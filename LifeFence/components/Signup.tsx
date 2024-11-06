// // components/Signup.js
// import React, { useState } from "react";
// import { View, TextInput, Button, Alert } from "react-native";
// import { authHelper } from "../utils/auth";
//
// export default function Signup() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [dob, setDob] = useState("");
//
//   const handleSignup = async () => {
//     try {
//       await authHelper.signup(username, password, name, email, dob);
//       Alert.alert("Signup successful!");
//     } catch (error) {
//       Alert.alert(error.message);
//     }
//   };
//
//   return (
//     <View className="flex flex-col gap-4">
//       <TextInput
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <TextInput placeholder="Name" value={name} onChangeText={setName} />
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />
//       <TextInput
//         placeholder="Date of Birth"
//         value={dob}
//         onChangeText={setDob}
//       />
//       <Button title="Signup" onPress={handleSignup} />
//     </View>
//   );
// }

import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { authHelper } from "../utils/auth";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSignup = async () => {
    try {
      await authHelper.signup(username, password, name, email, dob);
      Alert.alert("Signup successful!");
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false); // Close the date picker after selection
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDob(formattedDate);
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
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="border-b border-gray-300 py-2"
      >
        <Text>{dob ? `DOB: ${dob}` : "Select Date of Birth"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dob ? new Date(dob) : new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Button title="Signup" onPress={handleSignup} />
    </View>
  );
}
