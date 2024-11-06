import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import TaskCheckbox from "@/components/TaskCheckBox";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import NewObject from "@/components/NewObject";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);
  const [isCreateTaskModalVisible, setCreateTaskModalVisibility] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    start_date: new Date(),
    due_date: new Date(),
    location_id: 0,
    parent_task_id: 0,
    completed: false,
  });

  // Fetch Tasks and Locations on Mount and Refresh
  const fetchData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
      setRefreshing(false);
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

  // Pull-to-Refresh Function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Show/Hide Date Pickers
  const showStartDatePicker = () => setDatePickerVisibility(true);
  const hideStartDatePicker = () => setDatePickerVisibility(false);
  const showDueDatePicker = () => setDueDatePickerVisibility(true);
  const hideDueDatePicker = () => setDueDatePickerVisibility(false);

  const handleStartDateConfirm = (date) => {
    setNewTask((prev) => ({ ...prev, start_date: date }));
    hideStartDatePicker();
  };

  const handleDueDateConfirm = (date) => {
    setNewTask((prev) => ({ ...prev, due_date: date }));
    hideDueDatePicker();
  };

  // Show/Hide Create Task Modal
  const showCreateTaskModal = () => setCreateTaskModalVisibility(true);
  const hideCreateTaskModal = () => setCreateTaskModalVisibility(false);

  // Add New Task
  const addTask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/task/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify(newTask),
      });
      const data = await response.json();

      if (response.ok) {
        setTasks((prevTasks) => [...prevTasks, data]);
        setNewTask({
          title: "",
          start_date: new Date(),
          due_date: new Date(),
          location_id: 0,
          parent_task_id: 0,
          completed: false,
        });
        hideCreateTaskModal();
        Alert.alert("Success", "Task added successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task.");
    }
  };

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
      <TaskCheckbox taskId={item.id} />
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
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="mb-16"
      />
      <NewObject callback={showCreateTaskModal} />

      <Modal
        visible={isCreateTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-11/12">
            <Text className="text-xl font-bold mb-4">Add New Task</Text>
            <TextInput
              className="border-b border-blue-600 mb-4 p-2"
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) =>
                setNewTask((prev) => ({ ...prev, title: text }))
              }
            />
            <TouchableOpacity
              className="border-b border-blue-600 mb-4 p-2"
              onPress={showStartDatePicker}
            >
              <Text>Start Date: {newTask.start_date.toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-b border-blue-600 mb-4 p-2"
              onPress={showDueDatePicker}
            >
              <Text>Due Date: {newTask.due_date.toLocaleString()}</Text>
            </TouchableOpacity>

            {/* Location Picker */}
            <Picker
              selectedValue={newTask.location_id}
              onValueChange={(itemValue) =>
                setNewTask((prev) => ({ ...prev, location_id: itemValue }))
              }
              className="border-b border-blue-600 mb-4"
            >
              <Picker.Item label="Select Location" value={0} />
              {locations.map((location) => (
                <Picker.Item
                  key={location.id}
                  label={location.address}
                  value={location.id}
                />
              ))}
            </Picker>

            {/* Parent Task Picker */}
            <Picker
              selectedValue={newTask.parent_task_id}
              onValueChange={(itemValue) =>
                setNewTask((prev) => ({ ...prev, parent_task_id: itemValue }))
              }
              className="border-b border-blue-600 mb-4"
            >
              <Picker.Item label="Select Parent Task" value={0} />
              {tasks.map((task) => (
                <Picker.Item key={task.id} label={task.title} value={task.id} />
              ))}
            </Picker>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity className="mr-4" onPress={hideCreateTaskModal}>
                <Text className="text-blue-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 rounded px-4 py-2"
                onPress={addTask}
              >
                <Text className="text-white">Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
      />

      <DateTimePickerModal
        isVisible={isDueDatePickerVisible}
        mode="datetime"
        onConfirm={handleDueDateConfirm}
        onCancel={hideDueDatePicker}
      />
    </View>
  );
};

export default TasksPage;
