import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ImageBackground,
  Linking,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { Colors } from "@/constants/Colors";
import { useStateIfMounted } from "use-state-if-mounted";
import { getLanguages } from "@/constants/Languages";
import CustomDropdown from "@/components/CustomDropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/stores/store";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { translateImage } from "@/utils/openaiService";
import { ShowToast } from "@/components/ShowToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import * as Clipboard from "expo-clipboard";
import CameraModal from "@/components/CameraModal";
import { playText } from "@/utils/playSound";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import ResultTextInput from "@/components/ResultTextInput";
const dropdownData = getLanguages();

const Camera = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { locale } = useStore();

  const [language, setLanguage] = useStateIfMounted(locale);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTranslating, setIsTranslating] = useStateIfMounted(false);
  const [translatedText, setTranslatedText] = useStateIfMounted(
    "Capture image to translate"
  );
  const [modalVisible, setModalVisible] = useStateIfMounted(false);
  const [showResult, setShowResult] = useStateIfMounted(true);
  const [isLoadingSound, setIsLoadingSound] = useStateIfMounted(false);
  const [isPlaying, setIsPlaying] = useStateIfMounted(false);
  const [sound, setSound] = useStateIfMounted<Audio.Sound | null>(null);

  const takePicture = async (base64?: string) => {
    setIsTranslating(true);
    setShowResult(false);

    const translation = await translateImage(base64 || "", language);

    if (translation.status) {
      setTranslatedText(translation.translatedText);
      setShowResult(true);
    } else {
      ShowToast("error", "Translation Error", translation.message);
    }

    setIsTranslating(false);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    ShowToast("success", "Copied to clipboard", "Text copied to clipboard");
  };

  const resultViewStyle = useAnimatedStyle(() => ({
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    opacity: withTiming(showResult ? 1 : 0, { duration: 500 }),
  }));

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <BlurView intensity={30} style={styles.overlay} tint="dark" />
        {modalVisible ? (
          <CameraModal
            isVisible={modalVisible}
            onClose={() => setModalVisible(false)}
            onPhotoCapture={(base64) => {
              takePicture(base64);
            }}
          />
        ) : null}

        {!showResult && (isTranslating || !permission) ? (
          <LoadingSpinner />
        ) : showResult && isLoadingSound ? (
          <LoadingSpinner />
        ) : null}

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
          {!isTranslating && showResult ? (
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

        <TouchableOpacity
          disabled={isTranslating}
          style={[
            styles.cameraButton,
            { bottom: bottom + 100, opacity: isTranslating ? 0.5 : 1 },
          ]}
          onPress={async () => {
            if (permission && permission.granted) {
              if (!language?.length) {
                ShowToast(
                  "error",
                  "Language Error",
                  "Please select a language to translate"
                );
              } else {
                setModalVisible(true);
              }
            } else if (
              permission &&
              !permission.granted &&
              (permission.canAskAgain || permission.status === "undetermined")
            ) {
              requestPermission();
            } else {
              ShowToast(
                "action",
                "Permission Error",
                "Camera permission required. You need to enable it in settings.",
                {
                  label: "Settings",
                  onClick: () => {
                    Linking.openSettings();
                  },
                }
              );
            }
          }}
        >
          <MaterialCommunityIcons name="camera" size={60} color="white" />
        </TouchableOpacity>
      </ImageBackground>
    </Animated.View>
  );
};

export default Camera;

const styles = StyleSheet.create({
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
  cameraButton: {
    backgroundColor: Colors.primary,
    borderRadius: 200,
    padding: 20,
    position: "absolute",
  },
  title: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
});
