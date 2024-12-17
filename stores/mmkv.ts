import { MMKV } from "react-native-mmkv";

export const mmkvStorage = new MMKV({
  id: "mmkv-storage",
  //   encryptionKey: 'secureKey123',
});

export const getItem = (key: string) => {
  const value = mmkvStorage.getString(key);
  return value ? JSON.parse(value) : null;
};

export const setItem = (key: string, value: any) => {
  mmkvStorage.set(key, JSON.stringify(value));
};

export const removeItem = (key: string) => {
  mmkvStorage.delete(key);
};
