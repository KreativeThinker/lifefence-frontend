import { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import NewObject from "./NewObject";
import GroupTaskList from "./GroupTaskList";
import GroupCreateTask from "./CreateGroupTask";

export default function GroupTaskScreen({ groupId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [locations, setLocations] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await authHelper.getToken();

        const locationResponse = await fetch(`${BASE_URL}/location/view/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const locationData = await locationResponse.json();
        console.log(locationData);

        const tasksResponse = await fetch(
          `${BASE_URL}/group-tasks/view/${groupId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log(tasksResponse);
        const tasksData = await tasksResponse.json();

        setLocations(locationData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching locations or tasks:", error);
      }
    };

    fetchData();
  }, []);

  const handleTaskAdded = (newTask) => {
    console.log(newTask);
  };
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-4">Group Tasks</Text>
      <GroupTaskList query={`${BASE_URL}/group-tasks/view/${groupId}`} />
      <GroupCreateTask
        groupId={groupId}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        locations={locations}
        tasks={tasks}
        onTaskAdded={handleTaskAdded}
      />

      <NewObject callback={() => setModalVisible(true)} />
    </View>
  );
}
