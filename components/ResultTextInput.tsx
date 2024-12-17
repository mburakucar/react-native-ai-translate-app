import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as Clipboard from "expo-clipboard";
import { ShowToast } from "./ShowToast";
import { useSegments } from "expo-router";

interface ResultTextInputProps {
  text: string;
  setText: (text: string) => void;
  disabled: boolean;
  editable: boolean;
  changeBackground: boolean;
  onPress: () => void;
  blurOnSubmit: boolean;
}

const ResultTextInput = ({
  text,
  setText,
  disabled,
  editable,
  changeBackground,
  onPress,
  blurOnSubmit,
}: ResultTextInputProps) => {
  const segments = useSegments();

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    ShowToast("success", "Copied to clipboard", "Text copied to clipboard");
  };

  return (
    <View
      style={[
        styles.resultContainer,
        segments[1] && segments[1] === "camera" && { maxHeight: 350 },
      ]}
    >
      <TextInput
        editable={editable}
        multiline={true}
        numberOfLines={4}
        style={[
          styles.resultText,
          segments[1] && segments[1] === "camera" && { maxHeight: 300 },
        ]}
        value={text}
        onChangeText={setText}
        returnKeyType={blurOnSubmit ? "done" : "default"}
        submitBehavior={blurOnSubmit ? "blurAndSubmit" : "newline"}
      />
      <View style={styles.resultFooter}>
        <Text style={styles.resultFooterTextLeft}>{text?.length}</Text>
        <View style={styles.resultFooterRight}>
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(text);
            }}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={disabled}
            style={{
              backgroundColor: changeBackground
                ? Colors.primary
                : "transparent",
              opacity: disabled ? 0.5 : 1,
              borderRadius: 100,
              padding: changeBackground ? 5 : 0,
            }}
            onPress={onPress}
          >
            <AntDesign
              name="sound"
              size={changeBackground ? 18 : 26}
              color={changeBackground ? "white" : Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ResultTextInput;

const styles = StyleSheet.create({
  resultContainer: {
    width: "100%",
    maxHeight: 180,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
  },
  resultText: {
    padding: 10,
    maxHeight: 130,
    height: "100%",
    fontFamily: "Metropolis-SemiBold",
    fontSize: 16,
    marginBottom: 10,
  },
  resultFooter: {
    backgroundColor: "transparent",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultFooterTextLeft: {
    fontFamily: "Metropolis-Regular",
    fontSize: 14,
  },
  resultFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
