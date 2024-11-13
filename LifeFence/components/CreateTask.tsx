// CreateTask.js
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";

const CreateTask = ({ visible, onClose, locations, tasks, onTaskAdded }) => {
  const [newTask, setNewTask] = useState({
    title: "",
    start_date: new Date(),
    due_date: new Date(),
    location_id: 0,
    parent_task_id: 0,
    completed: false,
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);

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
        onTaskAdded(data);
        setNewTask({
          title: "",
          start_date: new Date(),
          due_date: new Date(),
          location_id: 0,
          parent_task_id: 0,
          completed: false,
        });
        onClose();
        Alert.alert("Success", "Task added successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
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
          <View className="flex-row justify-end">
            <TouchableOpacity
              className="mr-4 bg-gray-200 p-2 rounded-lg"
              onPress={onClose}
            >
              <Text className="text-gray-800">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-lg"
              onPress={addTask}
            >
              <Text className="text-white">Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    </Modal>
  );
};

export default CreateTask;
