import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import TaskCheckbox from "@/components/TaskCheckBox";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import NewObject from "@/components/NewObject";
import CreateTask from "@/components/CreateTask";
import TaskList from "@/components/TaskList";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isCreateTaskModalVisible, setCreateTaskModalVisibility] =
    useState(false);
  const onTaskAdded = (newTask) =>
    setTasks((prevTasks) => [...prevTasks, newTask]);

  const fetchData = useCallback(async () => {
    try {
      const token = await authHelper.getToken();

      const [tasksResponse, locationsResponse] = await Promise.all([
        fetch(`${BASE_URL}/task/view`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/location/view/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tasksData = await tasksResponse.json();
      const locationsData = await locationsResponse.json();

      setTasks(structureTasks(tasksData));
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
    }
  }, []);

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
  return (
    <View className="flex flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Tasks</Text>
      <TaskList query={`${BASE_URL}/task/view`} />
      <CreateTask
        visible={isCreateTaskModalVisible}
        onClose={() => setCreateTaskModalVisibility(false)}
        locations={locations}
        tasks={tasks}
        onTaskAdded={onTaskAdded}
      />
      <NewObject callback={() => setCreateTaskModalVisibility(true)} />
    </View>
  );
};

export default TasksPage;
