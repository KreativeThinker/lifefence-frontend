import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { authHelper } from "@/utils/auth";
import TaskCheckbox from "./TaskCheckBox";

export default function TaskList({ query }) {
  const [tasks, setTasks] = useState([{}]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await authHelper.getToken();

      const [tasksResponse] = await Promise.all([
        fetch(query, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tasksData = await tasksResponse.json();

      setTasks(structureTasks(tasksData));
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Task Structure
  const structureTasks = (tasks) => {
    return tasks.reduce((acc, task) => {
      if (task.parent_task_id) {
        const parentTask = acc.find((t) => t.id === task.parent_task_id);
        if (parentTask) {
          parentTask.children = parentTask.children || [];
          parentTask.children.push(task);
        }
      } else {
        acc.push({ ...task, children: [] });
      }
      return acc;
    }, []);
  };

  // Pull-to-Refresh Function
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
        {item.children && item.children.length > 0 && (
          <FlatList
            data={item.children}
            renderItem={renderChildTask}
            keyExtractor={(child) => child.id.toString()}
            className="mt-2"
          />
        )}
      </View>
    </View>
  );

  const renderChildTask = ({ item }) => (
    <View className="flex-row p-2 mb-2 rounded-lg bg-gray-100">
      <TaskCheckbox taskId={item.id} checkState={item.completed} />
      <Text className="ml-4 text-base">{item.title}</Text>
    </View>
  );

  const getTaskBackgroundColor = (task) => {
    const isOverdue = new Date(task.due_date) < new Date();
    const isCompleted = task.completed;

    if (isCompleted) return "bg-green-200";
    if (isOverdue) return "bg-red-200";
    return "bg-gray-100";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex flex-1 p-4 bg-white">
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text className="text-center text-gray-500 mt-8">
          No tasks available
        </Text>
      )}
    </View>
  );
}
