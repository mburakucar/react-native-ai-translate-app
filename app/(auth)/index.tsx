import { StyleSheet, Text, View, ImageBackground, Image } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";

const OnboardingPage = () => {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require("@/assets/images/onboarding.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <BlurView intensity={30} style={styles.overlay} tint="dark" />
        <View style={styles.container}>
          <Image
            source={require("@/assets/images/translator-logo.gif")}
            style={styles.logo}
          />
          <Text style={styles.title}>AI Translate</Text>
          <Text style={styles.description}>Speak Any Language, Anywhere.</Text>
          <View style={[styles.buttonContainer, { bottom: bottom + 50 }]}>
            <CustomButton
              onPress={() => {
                router.push("/modal");
              }}
              title="Get Started"
            />
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

export default OnboardingPage;

const styles = StyleSheet.create({
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Metropolis-Bold",
    color: Colors.primary,
  },
  description: {
    fontSize: 17,
    fontFamily: "Metropolis-Regular",
    marginTop: 10,
    color: "#2F2F2F",
  },
  buttonContainer: {
    width: "100%",
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
