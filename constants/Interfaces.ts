export interface User {
  id?: string;
  username: string;
  password: string;
}

export interface History {
  id: string;
  uid?: string;
  date: Date;
  type: "text" | "voice" | "image";
  image?: HistoryImage;
  voice?: HistoryVoice;
  text?: HistoryText;
}

interface HistoryImage {
  image: string;
  translatedText: string;
  translatedLanguage: string;
}

interface HistoryVoice {
  voiceUri: string;
  translatedText: string;
  translatedLanguage: string;
}

interface HistoryText {
  sourceText: string;
  sourceLanguage: string;
  translatedText: string;
  translatedLanguage: string;
}
