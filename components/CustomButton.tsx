import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

const CustomButton = ({
  onPress,
  title,
  loading,
  disabled,
}: {
  onPress?: () => void | null;
  title: string;
  loading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.container, disabled && { opacity: 0.5 }]}
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  text: {
    color: "white",
    fontFamily: "Metropolis-Bold",
    fontSize: 17,
  },
});
