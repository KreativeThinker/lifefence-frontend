import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import GroupTaskScreen from "@/components/GroupTaskScreen";

const Tab = createMaterialTopTabNavigator();

function UsersScreen({ groupId }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");
  const [editedGroupName, setEditedGroupName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/group/${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      const isAdminResponse = await fetch(
        `${BASE_URL}/group/${groupId}/is_admin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authHelper.getToken()}`,
          },
        },
      );
      const isAdminData = await isAdminResponse.json();
      setIsAdmin(isAdminData);
      const data = await response.json();
      setGroupDetails(data);
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setRefreshing(false);
    }
  }, [groupId]);

  const addMember = async () => {
    try {
      await fetch(`${BASE_URL}/group/${groupId}/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify({ user_id: newMemberId, role: "member" }),
      });
      fetchGroupDetails();
      setAddMemberModalVisible(false);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const removeMember = async (userId) => {
    try {
      await fetch(`${BASE_URL}/group/${groupId}/member/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      fetchGroupDetails();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const editGroup = async () => {
    try {
      await fetch(`${BASE_URL}/group/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify({ name: editedGroupName }),
      });
      fetchGroupDetails();
      setEditGroupModalVisible(false);
    } catch (error) {
      console.error("Error editing group:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  if (!groupDetails) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading group details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-3xl font-bold text-center my-4">
        {groupDetails.name}
      </Text>
      <Text className="text-lg text-center mb-4">
        Member Count: {groupDetails.members.length}
      </Text>

      <FlatList
        data={groupDetails.members}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View className="flex-row justify-between p-2 border-b border-gray-200">
            <Text className="text-lg">{item.user_name}</Text>
            {isAdmin && (
              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded-full"
                onPress={() => removeMember(item.user_id)}
              >
                <Text className="text-white">Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {isAdmin && (
        <View className="mt-4">
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-full mb-4"
            onPress={() => setAddMemberModalVisible(true)}
          >
            <Text className="text-white text-center">Add Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-500 py-3 rounded-full"
            onPress={() => setEditGroupModalVisible(true)}
          >
            <Text className="text-white text-center">Edit Group Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Member Modal */}
      <Modal
        transparent={true}
        visible={addMemberModalVisible}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-gray-900 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-80">
            <Text className="text-lg font-semibold mb-2">Add Member</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded mt-2 mb-4"
              placeholder="User ID"
              value={newMemberId}
              onChangeText={setNewMemberId}
            />
            <TouchableOpacity
              className="bg-blue-500 py-2 rounded-full"
              onPress={addMember}
            >
              <Text className="text-white text-center">Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-300 py-2 rounded-full mt-2"
              onPress={() => setAddMemberModalVisible(false)}
            >
              <Text className="text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        transparent={true}
        visible={editGroupModalVisible}
        animationType="slide"
      >
        <View className="flex-1 justify-center items-center bg-gray-900 bg-opacity-50">
          <View className="bg-white p-6 rounded-lg w-80">
            <Text className="text-lg font-semibold mb-2">Edit Group Name</Text>
            <TextInput
              className="border border-gray-300 p-2 rounded mt-2 mb-4"
              placeholder="Group Name"
              value={editedGroupName}
              onChangeText={setEditedGroupName}
            />
            <TouchableOpacity
              className="bg-blue-500 py-2 rounded-full"
              onPress={editGroup}
            >
              <Text className="text-white text-center">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-300 py-2 rounded-full mt-2"
              onPress={() => setEditGroupModalVisible(false)}
            >
              <Text className="text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function GroupDetailScreen({ route }) {
  const { groupId } = route.params;

  return (
    <Tab.Navigator>
      <Tab.Screen name="Users">
        {() => <UsersScreen groupId={groupId} />}
      </Tab.Screen>
      <Tab.Screen name="GroupTaskScreen">
        {() => <GroupTaskScreen groupId={groupId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
