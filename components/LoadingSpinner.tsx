import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  borderWidth?: number;
  duration?: number;
  style?: object;
}

const LoadingSpinner = ({
  size = 100,
  color = Colors.primary,
  borderWidth = 6,
  duration = 1000,
  style,
}: LoadingSpinnerProps) => {
  const rotation = useSharedValue(0);

  const loadingAnimationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
      }),
      -1,
      false
    );

    return () => {
      rotation.value = withTiming(0);
    };
  }, []);

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size,
            borderWidth,
            borderColor: color,
            borderRightColor: Colors.primaryLight,
          },
          loadingAnimationStyle,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
});

export default LoadingSpinner;
