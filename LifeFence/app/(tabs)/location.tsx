import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import NewObject from "@/components/NewObject";

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [markers, setMarkers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [locationType, setLocationType] = useState("");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

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

  const saveCurrentLocation = async () => {
    if (!location || !address || !locationType) return;
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/location/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify({
          address: address,
          latitude: location.latitude,
          longitude: location.longitude,
          location_type: locationType,
        }),
      });

      if (response.ok) {
        console.log("Location saved successfully!");
        setModalVisible(false); // Close modal after successful save
        setAddress(""); // Clear inputs
        setLocationType("");
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
      } else {
        console.log("Failed to save location");
      }
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      {errorMsg ? (
        <Text className="text-lg text-center text-red-600">{errorMsg}</Text>
      ) : location ? (
        <>
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
          <NewObject callback={() => setModalVisible(true)} />

          {/* Modal for address and location type input */}
          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
              <View className="bg-white w-4/5 p-6 rounded-lg shadow-lg">
                <Text className="text-xl font-bold mb-4">Save Location</Text>
                <TextInput
                  placeholder="Enter address"
                  value={address}
                  onChangeText={setAddress}
                  className="border-b border-gray-300 mb-4 p-2"
                />
                <TextInput
                  placeholder="Enter location type"
                  value={locationType}
                  onChangeText={setLocationType}
                  className="border-b border-gray-300 mb-4 p-2"
                />
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    className="mr-4 bg-gray-200 p-2 rounded-lg"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-gray-800">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-blue-500 p-2 rounded-lg"
                    onPress={saveCurrentLocation}
                    disabled={loading}
                  >
                    <Text className="text-white">
                      {loading ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text className="text-lg text-center text-gray-800">
          Fetching location...
        </Text>
      )}
    </View>
  );
}
