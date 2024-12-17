import { ShowToast } from "@/components/ShowToast";
import { Audio } from "expo-av";
import { textToSpeech } from "./openaiService";

export const playText = async (
  text: string,
  language: string,
  isPlaying: boolean,
  setIsPlaying: (value: boolean) => void,
  sound: Audio.Sound | null,
  setSound: (value: Audio.Sound | null) => void,
  setIsLoadingSound: (value: boolean) => void
) => {
  if (isPlaying) {
    await sound?.pauseAsync();
    setSound(null);
    setIsPlaying(false);
    return;
  }

  if (!text) {
    ShowToast("error", "Translation Error", "Please translate text first");
    return;
  }

  const permission = await Audio.getPermissionsAsync();
  if (!permission.granted) {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      ShowToast("error", "Permission Error", "Audio permission is required");
      return;
    }
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: true,
  });

  try {
    setIsLoadingSound(true);
    setIsPlaying(true);

    if (sound) {
      await sound.unloadAsync();
    }

    const { audio, status, message } = await textToSpeech(text, language);
    setIsLoadingSound(false);

    if (status && audio) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audio}` },
        { shouldPlay: true }
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ("isLoaded" in status && status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } else {
      ShowToast("error", "Text to speech error", message);
      setIsPlaying(false);
    }
  } catch (error) {
    console.error("Audio playback error:", error);
    ShowToast("error", "Audio Error", "Failed to play audio");
    setIsPlaying(false);
  }
};

export const playFromUri = async (
  uri: string,
  isPlaying: boolean,
  setIsPlaying: (value: boolean) => void,
  sound: Audio.Sound | null,
  setSound: (value: Audio.Sound | null) => void
) => {
  if (isPlaying) {
    await sound?.stopAsync();
    setSound(null);
    setIsPlaying(false);
    return;
  }

  if (!uri) {
    ShowToast("error", "Translation Error", "Audio not found");
    return;
  }

  const permission = await Audio.getPermissionsAsync();
  if (!permission.granted) {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      ShowToast("error", "Permission Error", "Audio permission is required");
      return;
    }
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: true,
  });

  try {
    setIsPlaying(true);

    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: true }
    );

    setSound(newSound);

    newSound.setOnPlaybackStatusUpdate((status: any) => {
      if ("isLoaded" in status && status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  } catch (error) {
    console.error("Audio playback error:", error);
    ShowToast("error", "Audio Error", "Failed to play audio");
    setIsPlaying(false);
  }
};
