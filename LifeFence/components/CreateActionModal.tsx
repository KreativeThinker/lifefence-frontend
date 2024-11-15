// CreateActionModal.js
import React, { useEffect, useState } from "react";
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

const CreateActionModal = ({ visible, onClose, onActionCreated }) => {
  const [newAction, setNewAction] = useState({
    trigger_function: "",
    location_id: 0,
    start_time: new Date(),
    end_time: new Date(),
  });

  const [locations, setLocations] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] =
    useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);

  const handleStartDateConfirm = (date) => {
    setNewAction((prev) => ({ ...prev, start_time: date }));
    hideStartDatePicker();
  };

  const handleEndDateConfirm = (date) => {
    setNewAction((prev) => ({ ...prev, end_time: date }));
    hideEndDatePicker();
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/location/view/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authHelper.getToken()}`,
          },
        });

        const data = await response.json();
        if (response.ok && data) {
          setLocations(data);
        } else {
          console.error("Failed to fetch locations:", data.message);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    if (visible) {
      fetchLocations();
    }
  }, [visible]);

  const createAction = async () => {
    console.log(newAction);

    try {
      const response = await fetch(`${BASE_URL}/actions/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authHelper.getToken()}`,
        },
        body: JSON.stringify(newAction),
      });
      const data = await response.json();

      if (response.ok) {
        onActionCreated(data);
        setNewAction({
          trigger_function: "",
          location_id: 0,
          start_time: new Date(),
          end_time: new Date(),
        });
        onClose();
        Alert.alert("Success", "Action created successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to create action.");
      }
    } catch (error) {
      console.error("Error creating action:", error);
      Alert.alert("Error", "Failed to create action.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white p-6 rounded-lg w-11/12">
          <Text className="text-xl font-bold mb-4">Create New Action</Text>
          <TextInput
            className="border-b border-blue-600 mb-4 p-2"
            placeholder="Trigger Function"
            value={newAction.trigger_function}
            onChangeText={(text) =>
              setNewAction((prev) => ({ ...prev, trigger_function: text }))
            }
          />
          <TouchableOpacity
            className="border-b border-blue-600 mb-4 p-2"
            onPress={showStartDatePicker}
          >
            <Text>Start Time: {newAction.start_time.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border-b border-blue-600 mb-4 p-2"
            onPress={showEndDatePicker}
          >
            <Text>End Time: {newAction.end_time.toLocaleString()}</Text>
          </TouchableOpacity>

          <Picker
            selectedValue={newAction.location_id}
            onValueChange={(itemValue) =>
              setNewAction((prev) => ({ ...prev, location_id: itemValue }))
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

          <View className="flex-row justify-end">
            <TouchableOpacity
              className="mr-4 bg-gray-200 p-2 rounded-lg"
              onPress={onClose}
            >
              <Text className="text-gray-800">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-lg"
              onPress={createAction}
            >
              <Text className="text-white">Create Action</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="datetime"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="datetime"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
      />
    </Modal>
  );
};

export default CreateActionModal;
