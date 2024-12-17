import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { History } from "@/constants/Interfaces";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";

const HistoryItem = ({
  item,
  setDetailData,
  bottomSheetRef,
  getLanguage,
  deleteHistory,
}: {
  item: History;
  setDetailData: (item: History) => void;
  bottomSheetRef: React.RefObject<BottomSheet>;
  getLanguage: (item: History) => {
    name: string;
    flag: string;
    sourceName: string;
    sourceFlag: string;
  };
  deleteHistory: (id: string) => void;
}) => {
  const returnIcon = (type: string) => {
    switch (type) {
      case "text":
        return (
          <MaterialIcons name="translate" size={26} color={Colors.primary} />
        );
      case "voice":
        return (
          <MaterialIcons
            name="keyboard-voice"
            size={30}
            color={Colors.primary}
          />
        );
      case "image":
        return (
          <Ionicons name="camera-outline" size={30} color={Colors.primary} />
        );
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "dd.MM.yyyy HH:mm:ss");
    } catch (error) {
      return "Geçersiz tarih";
    }
  };

  const getTranslatedText = (item: History) => {
    let text = "";
    if (item.type === "image") {
      text = item.image?.translatedText || "";
    } else if (item.type === "voice") {
      text = item.voice?.translatedText || "";
    } else {
      text = item.text?.translatedText || "";
    }

    return text.length > 50 ? text.slice(0, 50) + "..." : text;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={Layout.springify()}
      style={styles.container}
    >
      <View style={styles.row1Container}>
        <View style={{ gap: 5, flexShrink: 1 }}>
          <Text style={styles.row1Header}>
            {item.type == "image"
              ? "Image to Text"
              : item.type == "voice"
              ? "Voice to Text"
              : "Text to Text"}
            {" | "}
            {item.type == "text" && `${getLanguage(item).sourceFlag} > `}
            {getLanguage(item).flag}
          </Text>
          <Text style={styles.row1Text}>{getTranslatedText(item)}</Text>
        </View>
        <View>{returnIcon(item.type)}</View>
      </View>

      <View style={styles.row2Container}>
        <Text style={styles.row2Date}>{formatDate(item.date)}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5,
          }}
        >
          <TouchableOpacity
            style={styles.row2Button}
            onPress={() => {
              setDetailData(item);
              bottomSheetRef.current?.expand();
            }}
          >
            <Text style={styles.row2ButtonText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row2DeleteButton}
            onPress={() => {
              deleteHistory(item?.id);
            }}
          >
            <Text style={styles.row2ButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  row1Container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row1Header: {
    fontFamily: "Metropolis-Bold",
    color: Colors.primary,
  },
  row1Text: {
    fontFamily: "Metropolis-Regular",
    fontSize: 13,
    color: Colors.placeholder,
  },
  row2Container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 1,
  },
  row2Date: {
    fontFamily: "Metropolis-Regular",
    fontSize: 11,
    color: Colors.placeholder,
  },
  row2Button: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  row2DeleteButton: {
    backgroundColor: "red",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  row2ButtonText: {
    fontSize: 12,
    fontFamily: "Metropolis-Medium",
    color: "white",
  },
});
