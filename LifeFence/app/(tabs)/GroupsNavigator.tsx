import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import GroupsScreen from "./groups";
import GroupDetailScreen from "./GroupDetailScreen"; // Ensure this path is correct
import CreateGroupScreen from "./CreateGroupScreen";

const Stack = createStackNavigator();

export function GroupsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsScreen" component={GroupsScreen} />
      <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroupScreen" component={CreateGroupScreen} />
    </Stack.Navigator>
  );
}
