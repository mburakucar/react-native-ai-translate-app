import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground,
  Linking,
} from "react-native";
import React, { useEffect, useCallback } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolateColor,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Audio } from "expo-av";
import { ShowToast } from "@/components/ShowToast";
import { useStateIfMounted } from "use-state-if-mounted";
import { translateAudio } from "@/utils/openaiService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getLanguages } from "@/constants/Languages";
import { useStore } from "@/stores/store";
import CustomDropdown from "@/components/CustomDropdown";
import LoadingSpinner from "@/components/LoadingSpinner";
import { playText } from "@/utils/playSound";
import { BlurView } from "expo-blur";
import ResultTextInput from "@/components/ResultTextInput";

const dropdownData = getLanguages();

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = 3;
const BAR_MARGIN = 2;
const TOTAL_BAR_WIDTH = BAR_WIDTH + BAR_MARGIN * 2;
const BAR_COUNT = Math.floor((SCREEN_WIDTH - 100) / TOTAL_BAR_WIDTH);

const Voice = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { locale } = useStore();

  const [language, setLanguage] = useStateIfMounted(locale);

  const [recording, setRecording] = useStateIfMounted<Audio.Recording | null>(
    null
  );
  const [isTranslating, setIsTranslating] = useStateIfMounted(false);
  const [permissionGranted, setPermissionGranted] = useStateIfMounted(false);
  const [soundUri, setSoundUri] = useStateIfMounted<string | null>(null);

  const [showResult, setShowResult] = useStateIfMounted(false);
  const [translatedText, setTranslatedText] = useStateIfMounted("");

  const [isLoadingSound, setIsLoadingSound] = useStateIfMounted(false);
  const [isPlaying, setIsPlaying] = useStateIfMounted(false);
  const [sound, setSound] = useStateIfMounted<Audio.Sound | null>(null);

  const barHeights = Array.from({ length: BAR_COUNT }, () => useSharedValue(2));
  const buttonColor = useSharedValue(0);

  const resultViewStyle = useAnimatedStyle(() => ({
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    opacity: withTiming(showResult ? 1 : 0, { duration: 500 }),
  }));

  const waveViewStyle = useAnimatedStyle(() => ({
    opacity: withTiming(!showResult && !isTranslating ? 1 : 0, {
      duration: 300,
    }),
    transform: [
      {
        scale: withTiming(!showResult && !isTranslating ? 1 : 0.8, {
          duration: 300,
        }),
      },
    ],
  }));

  const createBarStyle = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        height: barHeights[index].value,
        width: BAR_WIDTH,
        backgroundColor: Colors.primary,
        marginHorizontal: BAR_MARGIN,
        borderRadius: BAR_WIDTH / 2,
      };
    });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonColor.value,
      [0, 1],
      [Colors.primary, "red"]
    );

    return {
      backgroundColor,
      borderRadius: 200,
      padding: 20,
      position: "absolute",
      bottom: bottom + 100,
    };
  });

  const checkPermissions = useCallback(async () => {
    try {
      const permissionResponse = await Audio.requestPermissionsAsync();
      setPermissionGranted(permissionResponse.status === "granted");
    } catch (error) {
      console.error("Permission error:", error);
      ShowToast(
        "error",
        "Permission Error",
        "Error while checking permissions"
      );
    }
  }, []);

  const startRecording = async () => {
    try {
      if (!permissionGranted) {
        ShowToast(
          "action",
          "Permission Error",
          "Audio recording permission required",
          {
            label: "Settings",
            onClick: () => {
              Linking.openSettings();
            },
          }
        );
        return;
      }

      if (!language?.length) {
        ShowToast(
          "error",
          "Language Error",
          "Please select a language to translate"
        );
        return;
      }

      setShowResult(false);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          enableEchoCancellation: true,
          noiseSuppression: true,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          enableEchoCancellation: true,
          noiseSuppression: true,
        },
      };

      buttonColor.value = withTiming(1, { duration: 1000 });
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          if (status.metering && status.metering < -25) {
            resetBarHeights();
            return;
          }
          const metering = status.metering ?? -160;
          const normalizedMeter = Math.min(
            Math.max((160 + metering) / 160, 0),
            1
          );

          barHeights.forEach((bar, index) => {
            if (normalizedMeter < 0.1) {
              const minMovement =
                Math.sin(Date.now() / 3000 + index) * 0.05 + 0.8;
              bar.value = withSpring(minMovement, {
                damping: 100,
                stiffness: 20,
                mass: 10,
              });
            } else {
              const amplitude = 10 + normalizedMeter * 50;
              const randomValue = Math.random() * normalizedMeter;
              bar.value = withSpring(amplitude * randomValue, {
                damping: 6,
                stiffness: 90,
                mass: 0.5,
              });
            }
          });
        }
      );
      setRecording(recording);
    } catch (error) {
      console.error("Recording start error:", error);
      ShowToast("error", "Recording Error", "Could not start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      buttonColor.value = withTiming(0, { duration: 1000 });
      resetBarHeights();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        ShowToast("error", "Error", "Could not get recording");
        return;
      }

      setSoundUri(uri);
    } catch (error) {
      console.error("Recording stop error:", error);
      ShowToast("error", "Error", "Could not stop recording");
    }
  };

  const resetBarHeights = () => {
    barHeights.forEach((bar) => {
      bar.value = withSpring(4, {
        damping: 10,
        stiffness: 80,
      });
    });
  };

  useEffect(() => {
    const translate = async () => {
      if (soundUri) {
        setIsTranslating(true);
        const { translatedText, englishText, status, message, error } =
          await translateAudio(soundUri, language);
        if (status) {
          setTranslatedText(translatedText);
          setShowResult(true);
        } else {
          ShowToast("error", "Translation Error", message);
        }

        deleteRecording();
        setIsTranslating(false);
      }
    };
    translate();
  }, [soundUri]);

  const deleteRecording = async () => {
    try {
      if (!soundUri) {
        return;
      }
      setSoundUri(null);
      // await FileSystem.deleteAsync(soundUri);
    } catch (error) {
      console.error("Delete error:", error);
      ShowToast("error", "Error", "Could not delete recording");
    }
  };

  useEffect(() => {
    checkPermissions();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  return (
    <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
      <ImageBackground
        source={require("@/assets/images/onboarding.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <BlurView intensity={30} style={styles.overlay} tint="dark" />

        <View
          style={{
            position: "absolute",
            top: top + 50,
            width: "100%",
            paddingHorizontal: 20,
          }}
        >
          <Text style={styles.title}>Language to Translate</Text>
          <CustomDropdown
            data={dropdownData}
            value={language}
            setValue={setLanguage}
            placeholder="Select Target Language"
            searchPlaceholder="Search Language"
          />
        </View>

        <Animated.View style={[resultViewStyle]}>
          {showResult ? (
            <ResultTextInput
              text={translatedText}
              setText={setTranslatedText}
              disabled={isLoadingSound}
              editable={false}
              changeBackground={isPlaying}
              blurOnSubmit={false}
              onPress={() => {
                playText(
                  translatedText,
                  language,
                  isPlaying,
                  setIsPlaying,
                  sound,
                  setSound,
                  setIsLoadingSound
                );
              }}
            />
          ) : null}
        </Animated.View>

        <Animated.View
          style={[
            styles.waveContainer,
            waveViewStyle,
            showResult && {
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            },
          ]}
        >
          <View style={styles.waveInnerContainer}>
            {barHeights.map((_, index) => (
              <Animated.View key={index} style={createBarStyle(index)} />
            ))}
          </View>
        </Animated.View>

        {isTranslating || isLoadingSound ? <LoadingSpinner /> : null}

        <AnimatedTouchableOpacity
          disabled={isTranslating}
          style={[buttonAnimatedStyle, { opacity: isTranslating ? 0.5 : 1 }]}
          onPress={() => {
            if (recording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
        >
          <MaterialCommunityIcons name="microphone" size={60} color="white" />
        </AnimatedTouchableOpacity>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
  },
  waveContainer: {
    justifyContent: "center",
  },
  waveInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: SCREEN_WIDTH / 2,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Voice;
