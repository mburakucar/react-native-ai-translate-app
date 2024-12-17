import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerLargeTitle: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: "Profile" }} />
      <Stack.Screen
        name="edit-profile"
        options={{ headerTitle: "Edit Profile" }}
      />
      <Stack.Screen
        name="history"
        options={{
          headerTitle: "History",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
};

export default Layout;

const styles = StyleSheet.create({});
