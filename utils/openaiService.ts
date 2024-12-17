import { useStore } from "@/stores/store";
import axiosInstance from "./axiosInstance";
import { History } from "@/constants/Interfaces";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

const addToHistory = async (newHistory: History) => {
  const { setHistory, history, user } = useStore.getState();

  if (!user?.id) {
    return;
  }

  newHistory.uid = user?.id.toString();

  if (history.length >= 10) {
    const oldestRecord = history.reduce((oldest, current) => {
      return new Date(oldest.date) < new Date(current.date) ? oldest : current;
    });

    if (oldestRecord.type === "voice" && oldestRecord.voice?.voiceUri) {
      try {
        await FileSystem.deleteAsync(oldestRecord.voice.voiceUri);
      } catch (error) {
        console.error("Error deleting voice file:", error);
      }
    }

    const filteredHistory = history.filter((item) => item !== oldestRecord);
    setHistory([...filteredHistory, newHistory]);
  } else {
    setHistory([...history, newHistory]);
  }
};

export const textToSpeech = async (text: string, language: string) => {
  try {
    const translationResponse = await axiosInstance.post(
      "https://api.openai.com/v1/audio/speech",
      {
        model: "tts-1",
        input: text,
        voice: "nova",
        response_format: "mp3",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    const blob = translationResponse.data;
    const fileReaderInstance = new FileReader();

    const base64data = await new Promise((resolve, reject) => {
      fileReaderInstance.onload = () => {
        const base64 = fileReaderInstance.result?.toString().split(",")[1];
        resolve(base64);
      };
      fileReaderInstance.onerror = () => {
        reject(new Error("FileReader failed"));
      };
      fileReaderInstance.readAsDataURL(blob);
    });

    return {
      status: true,
      message: "Translation successful",
      audio: base64data,
    };
  } catch (error) {
    console.error("Text to speech error:", error);
    return {
      status: false,
      message: "An error occurred while generating the audio",
      error: error,
      translatedText: "",
    };
  }
};

export const translateText = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
) => {
  try {
    const translationResponse = await axiosInstance.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              sourceLanguage == "auto"
                ? `You are a translator. Detect the language of the text first, then translate it to ${targetLanguage}. Only respond with the translated text, nothing else.`
                : `You are a translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only respond with the translated text, nothing else.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const translationData = translationResponse.data;

    var newHistory: History = {
      id: Crypto.randomUUID(),
      date: new Date(),
      type: "text",
      text: {
        sourceText: text,
        sourceLanguage: sourceLanguage,
        translatedText: translationData.choices[0].message.content,
        translatedLanguage: targetLanguage,
      },
    };

    addToHistory(newHistory);

    return {
      status: true,
      message: "Translation successful",
      translatedText: translationData.choices[0].message.content,
    };
  } catch (error) {
    console.error("Text translation error:", error);
    return {
      status: false,
      message: "Translation error",
      error: error,
      translatedText: "",
    };
  }
};

export const translateImage = async (
  imageUri: string,
  targetLanguage: string
) => {
  try {
    const translationResponse = await axiosInstance.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Translate the text in this image to ${targetLanguage}. Only provide the translated text, nothing else. If the translation cannot be done, return the message "Texts in the image could not be read".`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageUri}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const translationData = translationResponse.data;

    var newHistory: History = {
      id: Crypto.randomUUID(),
      date: new Date(),
      type: "image",
      image: {
        image: `data:image/jpeg;base64,${imageUri}`,
        translatedText: translationData.choices[0].message.content,
        translatedLanguage: targetLanguage,
      },
    };

    addToHistory(newHistory);

    return {
      status: true,
      message: "Translation successful",
      translatedText: translationData.choices[0].message.content,
    };
  } catch (error) {
    console.error("Image translation error:", error);
    return {
      status: false,
      message: "Translation error",
      error: error,
      translatedText: "",
    };
  }
};

export const translateAudio = async (
  audioUri: string,
  targetLanguage: string
) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: audioUri,
      type: "audio/m4a",
      name: "audio.m4a",
    } as unknown as Blob);
    formData.append("model", "whisper-1");

    const response = await axiosInstance.post(
      "https://api.openai.com/v1/audio/translations",
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const data = response.data;
    const englishText = data.text;

    const translationResponse = await axiosInstance.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the following text to ${targetLanguage}. Only respond with the translated text, nothing else.`,
          },
          {
            role: "user",
            content: englishText,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const translationData = translationResponse.data;

    var newHistory: History = {
      id: Crypto.randomUUID(),
      date: new Date(),
      type: "voice",
      voice: {
        voiceUri: audioUri,
        translatedText: translationData.choices[0].message.content,
        translatedLanguage: targetLanguage,
      },
    };

    addToHistory(newHistory);

    return {
      status: true,
      message: "Translation successful",
      translatedText: translationData.choices[0].message.content,
      englishText: englishText,
    };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      status: false,
      message: "Translation error",
      error: error,
      translatedText: "",
      englishText: "",
    };
  }
};
