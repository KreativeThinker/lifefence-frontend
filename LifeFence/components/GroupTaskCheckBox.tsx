import { BASE_URL } from "@/constants/apiConfig";
import { authHelper } from "@/utils/auth";
import React, { useState } from "react";
import { View, Alert } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const GroupTaskCheckbox = ({ taskId, checkState }) => {
  const [isChecked, setIsChecked] = useState(checkState);

  const toggleCheckbox = async (checked) => {
    try {
      setIsChecked(checked);

      const response = await fetch(
        `${BASE_URL}/group-tasks/toggle_complete/${taskId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authHelper.getToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      Alert.alert(
        "Success",
        `Task marked as ${checked ? "completed" : "not completed"}`,
      );
    } catch (error) {
      console.error("Error:", error);
      setIsChecked(!checked);
      Alert.alert("Error", "Failed to update task status.");
    }
  };
  return (
    <View>
      <BouncyCheckbox
        isChecked={isChecked}
        fillColor="#4CAF50"
        unFillColor="#FFFFFF"
        onPress={(checked) => toggleCheckbox(checked)}
      />
    </View>
  );
};

export default GroupTaskCheckbox;
