import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import NewObject from "./NewObject";

export default function GroupTaskScreen({ groupId }) {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false); // New state for date picker
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/group-tasks/view/${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setRefreshing(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTaskCompletion = async (taskId) => {
    try {
      const response = await fetch(`${BASE_URL}/group-tasks/${taskId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${BASE_URL}/group-tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const addNewTask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/group-tasks/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify({ ...newTask, group_id: groupId }),
      });
      const createdTask = await response.json();
      setTasks((prevTasks) => [createdTask, ...prevTasks]);
      setModalVisible(false);
      setNewTask({ title: "", description: "", due_date: "" });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirmDate = (date) => {
    setNewTask((prev) => ({
      ...prev,
      due_date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
    }));
    hideDatePicker();
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Group Tasks</Text>
      <NewObject callback={() => setModalVisible(true)} />

      {tasks.length === 0 ? (
        <Text>No tasks found.</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View className="p-2 border-b border-gray-200">
              <Text className="text-lg">{item.title}</Text>
              <Text>{item.description || "No description provided"}</Text>
              <Text>
                Due Date: {new Date(item.due_date).toLocaleDateString()}
              </Text>
              <Button
                title={item.completed ? "Mark Incomplete" : "Mark Complete"}
                onPress={() => toggleTaskCompletion(item.id)}
              />
              <Button
                title="Delete Task"
                onPress={() =>
                  Alert.alert("Delete Task", "Are you sure?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "OK", onPress: () => deleteTask(item.id) },
                  ])
                }
                color="red"
              />
            </View>
          )}
        />
      )}

      {/* Modal for Adding New Task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 flex flex-col  justify-center items-center bg-black bg-opacity-50">
          <View className="w-11/12 bg-white p-6 gap-4 rounded-lg">
            <Text className="text-xl font-bold mb-4">Add New Task</Text>
            <TextInput
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />
            <TextInput
              placeholder="Description"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask({ ...newTask, description: text })
              }
            />
            <Button title="Pick Due Date" onPress={showDatePicker} />
            <Text className="text-gray-600">
              Selected Date: {newTask.due_date || "None"}
            </Text>
            <Button title="Add Task" onPress={addNewTask} />
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              color="gray"
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
    </View>
  );
}
