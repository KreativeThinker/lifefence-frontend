import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";

export default function CreateGroupScreen({ navigation }) {
  const [groupName, setGroupName] = useState("");

  const createGroup = async () => {
    if (!groupName) {
      Alert.alert("Error", "Please enter a group name.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify({ name: groupName }),
      });

      if (response.ok) {
        Alert.alert("Success", "Group created successfully!");
        navigation.goBack(); // Go back to Groups screen after creation
      } else {
        Alert.alert("Error", "Failed to create group.");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "An error occurred while creating the group.");
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold text-center mb-4">
        Create New Group
      </Text>
      <TextInput
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
        className="border border-gray-300 p-2 mb-4 rounded"
      />
      <Button title="Create Group" onPress={createGroup} />
    </View>
  );
}
