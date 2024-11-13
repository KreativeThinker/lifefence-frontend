import React, { useState, useEffect } from "react";
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

const GroupCreateTask = ({
  visible,
  onClose,
  locations,
  tasks,
  onTaskAdded,
  groupId,
}) => {
  // Updated newTask to align with backend model
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: new Date(),
    assigned_to_id: null,
    group_id: groupId,
  });

  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);
  const [members, setMembers] = useState([]);

  // Fetch group members
  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const token = await authHelper.getToken();
        const response = await fetch(`${BASE_URL}/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setMembers(data.members || []);
        } else {
          console.error("Error fetching group members:", data.message);
        }
      } catch (error) {
        console.error("Error fetching group members:", error);
      }
    };

    if (groupId) {
      fetchGroupMembers();
    }
  }, [groupId]);

  // Show and hide date picker
  const showDueDatePicker = () => setDueDatePickerVisibility(true);
  const hideDueDatePicker = () => setDueDatePickerVisibility(false);

  // Handle due date selection
  const handleDueDateConfirm = (date) => {
    setNewTask((prev) => ({ ...prev, due_date: date }));
    hideDueDatePicker();
  };

  // Add task function
  const addTask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/group-tasks/new`, {
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
          description: "",
          due_date: new Date(),
          assigned_to_id: null,
          group_id: groupId,
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
          <TextInput
            className="border-b border-blue-600 mb-4 p-2"
            placeholder="Task Description"
            value={newTask.description}
            onChangeText={(text) =>
              setNewTask((prev) => ({ ...prev, description: text }))
            }
          />
          <TouchableOpacity
            className="border-b border-blue-600 mb-4 p-2"
            onPress={showDueDatePicker}
          >
            <Text>Due Date: {newTask.due_date.toLocaleString()}</Text>
          </TouchableOpacity>

          {/* Assignee Picker */}
          <Picker
            selectedValue={newTask.assigned_to_id}
            onValueChange={(itemValue) =>
              setNewTask((prev) => ({ ...prev, assigned_to_id: itemValue }))
            }
            className="border-b border-blue-600 mb-4"
          >
            <Picker.Item label="Select Assignee" value={null} />
            {members.map((member) => (
              <Picker.Item
                key={member.id}
                label={member.user_name} // assuming each member has a `user_name` attribute
                value={member.id}
              />
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
        isVisible={isDueDatePickerVisible}
        mode="datetime"
        onConfirm={handleDueDateConfirm}
        onCancel={hideDueDatePicker}
      />
    </Modal>
  );
};

export default GroupCreateTask;
