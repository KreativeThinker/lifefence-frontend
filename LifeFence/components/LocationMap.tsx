import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import TaskCheckbox from "@/components/TaskCheckBox";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch location
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
      });
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await authHelper.getToken();
      const response = await fetch(`${BASE_URL}/task/view`, {
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
  }, []);

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
            />
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
