import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import React, { useEffect } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { ShowToast } from "@/components/ShowToast";
import { useStateIfMounted } from "use-state-if-mounted";
import { translateText } from "@/utils/openaiService";
import { Feather } from "@expo/vector-icons";
import { getLanguages } from "@/constants/Languages";
import { useStore } from "@/stores/store";
import CustomDropdown from "@/components/CustomDropdown";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Audio } from "expo-av";
import { playText } from "@/utils/playSound";
import { BlurView } from "expo-blur";
import ResultTextInput from "@/components/ResultTextInput";

const dropdownData = getLanguages(true);
const targetDropdownData = dropdownData.filter((item) => item.value !== "auto");

const Index = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { locale } = useStore();

  const [sourceLanguage, setSourceLanguage] = useStateIfMounted("auto");
  const [targetLanguage, setTargetLanguage] = useStateIfMounted(locale);

  const [isTranslating, setIsTranslating] = useStateIfMounted(false);

  const [showResult, setShowResult] = useStateIfMounted(true);
  const [sourceText, setSourceText] = useStateIfMounted("");
  const [translatedText, setTranslatedText] = useStateIfMounted("");
  const [isLoadingSound, setIsLoadingSound] = useStateIfMounted(false);
  const [isPlayingSource, setIsPlayingSource] = useStateIfMounted(false);
  const [isPlayingTarget, setIsPlayingTarget] = useStateIfMounted(false);
  const [sound, setSound] = useStateIfMounted<Audio.Sound | null>(null);

  const resultViewStyle = useAnimatedStyle(() => ({
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    opacity: withTiming(showResult ? 1 : 0, { duration: 500 }),
  }));

  const translate = async () => {
    if (!sourceLanguage?.length || !targetLanguage?.length) {
      ShowToast(
        "error",
        "Translation Error",
        "Please select source and target languages to translate"
      );
      return;
    }

    if (sourceLanguage === targetLanguage) {
      ShowToast(
        "error",
        "Translation Error",
        "Source and target languages cannot be the same"
      );
      return;
    }

    if (!sourceText) {
      ShowToast("error", "Translation Error", "Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    const { translatedText, status, message, error } = await translateText(
      sourceText,
      sourceLanguage,
      targetLanguage
    );
    if (status) {
      setTranslatedText(translatedText);
      setShowResult(true);
    } else {
      ShowToast("error", "Translation Error", message);
    }

    setIsTranslating(false);
  };

  const changeLanguages = () => {
    if (sourceLanguage === "auto") {
      ShowToast(
        "error",
        "Translation Error",
        "Auto detect language is not allowed to change"
      );
      return;
    }
    const tempSourceLanguage = sourceLanguage;
    const tempTargetLanguage = targetLanguage;

    setSourceText(translatedText);
    setTranslatedText("");

    setSourceLanguage(tempTargetLanguage);
    setTargetLanguage(tempSourceLanguage);
  };

  useEffect(() => {
    if (
      sourceLanguage != "auto" &&
      sourceLanguage?.length &&
      targetLanguage?.length
    ) {
      translate();
    }
  }, [sourceLanguage, targetLanguage]);

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
          <View style={styles.languageContainer}>
            <View style={{ width: "100%", flexShrink: 1 }}>
              <Text style={styles.title}>Source</Text>
              <CustomDropdown
                data={dropdownData}
                value={sourceLanguage}
                setValue={setSourceLanguage}
                placeholder="Select Source Language"
                searchPlaceholder="Search Language"
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                changeLanguages();
              }}
              style={styles.changeLanguagesButton}
            >
              <Feather name="refresh-cw" size={25} color="white" />
            </TouchableOpacity>
            <View style={{ width: "100%", flexShrink: 1 }}>
              <Text style={styles.title}>Target</Text>
              <CustomDropdown
                data={targetDropdownData}
                value={targetLanguage}
                setValue={setTargetLanguage}
                placeholder="Select Target Language"
                searchPlaceholder="Search Language"
              />
            </View>
          </View>
        </View>

        <Animated.View style={[resultViewStyle]}>
          {showResult ? (
            <View style={{ gap: 20, width: "100%" }}>
              <ResultTextInput
                text={sourceText}
                setText={setSourceText}
                disabled={isLoadingSound || isPlayingTarget}
                editable={true}
                changeBackground={isPlayingSource}
                blurOnSubmit={true}
                onPress={() => {
                  playText(
                    sourceText,
                    sourceLanguage,
                    isPlayingSource,
                    setIsPlayingSource,
                    sound,
                    setSound,
                    setIsLoadingSound
                  );
                }}
              />

              <ResultTextInput
                text={translatedText}
                setText={setTranslatedText}
                disabled={isLoadingSound || isPlayingSource}
                editable={false}
                changeBackground={isPlayingTarget}
                blurOnSubmit={false}
                onPress={() => {
                  playText(
                    translatedText,
                    targetLanguage,
                    isPlayingTarget,
                    setIsPlayingTarget,
                    sound,
                    setSound,
                    setIsLoadingSound
                  );
                }}
              />
            </View>
          ) : null}
        </Animated.View>

        {isTranslating || isLoadingSound ? <LoadingSpinner /> : null}

        <TouchableOpacity
          disabled={isTranslating}
          style={[
            styles.buttonStyle,
            { bottom: bottom + 100, opacity: isTranslating ? 0.5 : 1 },
          ]}
          onPress={() => {
            translate();
          }}
        >
          <Feather name="refresh-cw" size={60} color="white" />
        </TouchableOpacity>
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
  languageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  changeLanguagesButton: {
    padding: 15,
    backgroundColor: Colors.primary,
    borderRadius: 100,
  },
  title: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
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
  buttonStyle: {
    borderRadius: 200,
    padding: 20,
    position: "absolute",
    backgroundColor: Colors.primary,
  },
});

export default Index;
