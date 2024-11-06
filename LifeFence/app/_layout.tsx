import * as React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
  Button,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "./(tabs)/_layout";
import { authHelper } from "@/utils/auth";
import Login from "@/components/Login";
import Signup from "@/components/Signup";
import "../global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(true);
  const [isLogin, setIsLogin] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(true);
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  React.useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authHelper.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // Update authentication state
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <View className="flex flex-col gap-4 p-10 justify-center align-middle flex-1">
        {isLogin ? <Login onLoginSuccess={handleLoginSuccess} /> : <Signup />}
        <Button
          title={isLogin ? "Switch to Signup" : "Switch to Login"}
          onPress={toggleForm}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {children}
      <Tabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
