import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import TaskCheckbox from "@/components/TaskCheckBox";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [tasks, setTasks] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const GEOFENCE_RADIUS = 200; // Set radius for geofence in meters

  // Calculate the distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log(".");

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
  const checkGeofence = (userLocation) => {
    console.log("Checking Geofence...");
    markers.forEach((marker) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude,
      );

      console.log("Distance to marker:", distance);

      if (distance < GEOFENCE_RADIUS) {
        Alert.alert(
          "Geofence Alert",
          `You are within range of ${marker.title}`,
        );
        console.log("In range of:", marker.title);
        setCurrentLocation(marker);
      }
    });
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
        setMarkers(
          data.map((item) => ({
            id: item.id,
            latitude: item.latitude,
            longitude: item.longitude,
            title: item.address,
            description: item.location_type,
          })),
        );
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    })();
  }, []);

  // Geofence check triggered by location and markers change
  useEffect(() => {
    if (location && markers.length > 0) {
      checkGeofence(location);
    }
  }, [location, markers]); // Only runs when location or markers update

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await authHelper.getToken();

      // Check if currentLocation and currentLocation.id exist, then set the URL accordingly
      const url = currentLocation?.id
        ? `${BASE_URL}/task/view/location/${currentLocation.id}`
        : `${BASE_URL}/task/view`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentLocation]); // Add currentLocation as a dependency to refetch data if it changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const renderItem = ({ item }) => (
    <View
      className={`flex-row p-4 mb-4 rounded-lg ${getTaskBackgroundColor(item)}`}
    >
      <TaskCheckbox taskId={item.id} checkState={item.completed} />
      <View className="flex flex-col gap-2 ml-4">
        <Text className="text-lg font-bold">{item.title}</Text>
        <Text className="text-gray-500">{item.start_date}</Text>
        <Text className="text-gray-500">{item.due_date}</Text>
      </View>
    </View>
  );

  const getTaskBackgroundColor = (task) => {
    const isOverdue = new Date(task.due_date) < new Date();
    const isCompleted = task.completed;
    if (isCompleted) return "bg-green-200";
    if (isOverdue) return "bg-red-200";
    return "bg-gray-100";
  };

  return (
    <View className="flex-1">
      {errorMsg ? (
        <Text className="text-center text-red-500">{errorMsg}</Text>
      ) : location ? (
        <>
          {/* Top half of the screen with the map */}
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

          {/* Bottom half with tasks */}
          <View className="flex-1 p-4 bg-white">
            <Text className="text-2xl font-bold mb-4">Tasks</Text>
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            ) : (
              <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            )}
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default App;
