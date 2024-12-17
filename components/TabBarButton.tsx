import { Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";

const icons = {
  index: (props: any) => (
    <MaterialIcons name="translate" size={26} {...props} />
  ),
  voice: (props: any) => (
    <MaterialIcons name="keyboard-voice" size={30} {...props} />
  ),
  camera: (props: any) => (
    <Ionicons name="camera-outline" size={30} {...props} />
  ),
  profile: (props: any) => <AntDesign name="user" size={26} {...props} />,
};

type IconNames = keyof typeof icons;

const TabBarButton = (props: any) => {
  const { isFocused, label, routeName, color } = props;

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(
      typeof isFocused === "boolean" ? (isFocused ? 1 : 0) : isFocused,
      { duration: 350 }
    );
  }, [scale, isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 0]);

    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  });
  return (
    <Pressable {...props} style={styles.container}>
      <Animated.View style={[animatedIconStyle]}>
        {icons[routeName as IconNames]({
          color,
        })}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});

export default TabBarButton;
