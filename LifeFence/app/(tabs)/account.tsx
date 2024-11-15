import * as React from "react";
import { View, Text, Button, Alert } from "react-native";
import { authHelper } from "@/utils/auth"; // Make sure to import your auth helper
import { BASE_URL } from "../../constants/apiConfig"; // Adjust the import path as necessary

export default function AccountScreen() {
  const [userDetails, setUserDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await authHelper.getToken();
        const response = await fetch(`${BASE_URL}/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user details!");
        }

        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        Alert.alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await authHelper.logout();
      // Navigate to the login or main screen, depending on your app structure
      Alert.alert("Logged out successfully!");
    } catch (error) {
      Alert.alert("Logout failed!");
    }
  };

  if (loading) {
    return (
      <View className="flex flex-col flex-1 p-10 justify-center items-center">
        <Text>Loading user details...</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col flex-1 gap-4 p-10">
      {userDetails ? (
        <>
          <Text className="text-lg font-bold">Hello, {userDetails.name}!</Text>
          <Text>Email: {userDetails.email}</Text>
          <Text>Username: {userDetails.username}</Text>
          <Text>Date of Birth: {userDetails.dob}</Text>
          <Text>User ID: {userDetails.id}</Text>
        </>
      ) : (
        <Text>No user details available.</Text>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
