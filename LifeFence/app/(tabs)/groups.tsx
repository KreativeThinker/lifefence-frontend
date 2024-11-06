import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import NewObject from "@/components/NewObject";

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Fetch list of groups
  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/group/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
      });
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setRefreshing(false); // Reset refreshing after data fetch
    }
  }, []);

  // Use `useFocusEffect` to re-fetch data each time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups]),
  );

  // Navigate to GroupDetailScreen with group ID
  const openGroupDetails = (groupId) => {
    navigation.navigate("GroupDetailScreen", { groupId });
  };

  // Navigate to Create Group screen
  const openCreateGroup = () => {
    navigation.navigate("CreateGroupScreen"); // Ensure CreateGroupScreen is configured
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGroups();
  }, [fetchGroups]);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center mb-4">Your Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 border-b border-gray-300"
            onPress={() => openGroupDetails(item.id)}
          >
            <Text className="text-xl font-semibold">{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <NewObject callback={openCreateGroup} />
    </View>
  );
}
