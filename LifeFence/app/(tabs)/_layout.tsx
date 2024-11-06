import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GroupsScreen from "./groups";
import IndexScreen from "./index";
import AccountScreen from "./account";
import TasksScreen from "./tasks";
import LocationScreen from "./location";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

const Tab = createBottomTabNavigator();

export function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#F2F2F7",
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="(tabs)/tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "checkbox" : "checkbox-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="(tabs)/location"
        component={LocationScreen}
        options={{
          tabBarLabel: "Location",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "location" : "location-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="(tabs)/index"
        component={IndexScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="(tabs)/groups"
        component={GroupsScreen}
        options={{
          tabBarLabel: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="(tabs)/account"
        component={AccountScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
