import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import TabBar from "@/components/TabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: "",
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
