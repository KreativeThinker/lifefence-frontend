import React, { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import TaskList from "@/components/TaskList";
import CreateActionModal from "@/components/CreateActionModal";
import NewObject from "@/components/NewObject";

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [markers, setMarkers] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const GEOFENCE_RADIUS = 200; // Set radius for geofence in meters

  // Calculate the distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const executeAllActions = async (locationId) => {
    try {
      const actionsResponse = await fetch(
        `${BASE_URL}/actions/view?location_id=${locationId.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authHelper.getToken()}`,
          },
        },
      );

      const actionsData = await actionsResponse.json();

      if (!actionsResponse.ok) {
        Alert.alert(
          "Error",
          actionsData.detail || "Failed to fetch active actions.",
        );
        return;
      }

      if (actionsData.length === 0) {
        Alert.alert("Info", "No active actions for this location.");
        return;
      }

      for (const action of actionsData) {
        console.log(action);
        try {
          const triggerResponse = await fetch(
            `${BASE_URL}/actions/trigger/${action.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${await authHelper.getToken()}`,
              },
            },
          );

          const triggerData = await triggerResponse.json();

          if (!triggerResponse.ok) {
            Alert.alert(
              "Error",
              `Failed to trigger action ${action.id}: ${triggerData.detail || "Unknown error."}`,
            );
            continue;
          }

          // Custom behavior for the "trigger_function"
          if (action.trigger_function === "add") {
            console.log("add");

            const endDate = new Date(action.end_time);
            const addedMonth = new Date(
              endDate.setMonth(endDate.getMonth() + 1),
            );
            Alert.alert(
              "Add Action Triggered",
              `The new date is: ${addedMonth.toDateString()}`,
            );
          } else if (action.trigger_function === "time") {
            console.log("time");
            const currentTime = new Date();
            Alert.alert(
              "Time Action Triggered",
              `The time is ${currentTime.getHours()}:${currentTime.getMinutes()} and you are in ${locationId.title}`,
            );
          } else {
            console.log(
              `Unhandled trigger function: ${triggerData.trigger_function}`,
            );
          }
        } catch (triggerError) {
          console.error(`Error triggering action ${action.id}:`, triggerError);
        }
      }

      Alert.alert(
        "Geofence Alert",
        `You are within range of ${locationId.title}`,
      );
    } catch (error) {
      console.error("Error fetching or executing actions:", error);
      Alert.alert("Error", "An error occurred while processing the actions.");
    }
  };

  const checkGeofence = async (userLocation) => {
    // console.log("Checking Geofence...");
    for (const marker of markers) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude,
      );

      // console.log("Distance to marker:", distance);

      if (distance < GEOFENCE_RADIUS) {
        // Alert.alert(
        // "Geofence Alert",
        // `You are within range of ${marker.title}`,
        // );
        // console.log("In range of:", marker.title);
        setCurrentLocation(marker);
        executeAllActions(marker);
      }
    }
  };
  // Fetch location and markers on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Fetch current location
      let userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setLocation(userCoords);

      // Fetch markers
      try {
        const response = await fetch(`${BASE_URL}/location/view/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authHelper.getToken()}`,
          },
        });

        const data = await response.json();
        if (data) {
          setMarkers(
            data.map((item) => ({
              id: item.id,
              latitude: item.latitude,
              longitude: item.longitude,
              title: item.address,
              description: item.location_type,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (location && markers.length > 0) {
      checkGeofence(location);
    }
  }, [location, markers]);

  const url = currentLocation?.id
    ? `${BASE_URL}/task/view/location/${currentLocation.id}`
    : `${BASE_URL}/task/view`;

  return (
    <View className="flex-1">
      {errorMsg ? (
        <Text className="text-center text-red-500">{errorMsg}</Text>
      ) : location ? (
        <>
          <View className="flex-1">
            <MapView
              style={{ width: "100%", height: "100%" }}
              initialRegion={location}
              showsUserLocation={true}
            >
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                  }}
                  title={marker.title}
                  description={marker.description}
                />
              ))}
            </MapView>
          </View>

          <View className="flex-1 p-4 bg-white">
            <Text className="text-2xl font-bold mb-4">Tasks</Text>
            <TaskList query={url} />
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <NewObject callback={() => setModalVisible(true)} />

      <CreateActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        locations={markers}
        onActionCreated={() => Alert.alert("Action Created")}
      />
    </View>
  );
};

export default App;
