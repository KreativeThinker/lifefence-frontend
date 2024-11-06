import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { authHelper } from "../utils/auth";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await authHelper.login(username, password);
      Alert.alert("Login successful!");
      onLoginSuccess();
    } catch (error) {
      console.log(error.message);

      Alert.alert(error.message);
    }
  };

  return (
    <View className="flex flex-col gap-4">
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
