import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { useStore } from "@/stores/store";
import { getLocales } from "expo-localization";
import { Toaster } from "sonner-native";
import StartPage from "./index";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const InitialScreen = () => {
  const [loaded] = useFonts({
    "Metropolis-Thin": require("../assets/fonts/Metropolis-Thin.otf"),
    "Metropolis-ExtraLight": require("../assets/fonts/Metropolis-ExtraLight.otf"),
    "Metropolis-Light": require("../assets/fonts/Metropolis-Light.otf"),
    "Metropolis-Regular": require("../assets/fonts/Metropolis-Regular.otf"),
    "Metropolis-Medium": require("../assets/fonts/Metropolis-Medium.otf"),
    "Metropolis-SemiBold": require("../assets/fonts/Metropolis-SemiBold.otf"),
    "Metropolis-Bold": require("../assets/fonts/Metropolis-Bold.otf"),
    "Metropolis-ExtraBold": require("../assets/fonts/Metropolis-ExtraBold.otf"),
    "Metropolis-Black": require("../assets/fonts/Metropolis-Black.otf"),
  });

  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const { user, setUser, locale, setLocale } = useStore();

  useEffect(() => {
    if (clerkUser && clerkUser.id) {
      setUser!({
        ...user,
        id: clerkUser.id,
      });
    }
  }, [clerkUser]);

  useEffect(() => {
    const userLocale = getLocales();
    if (!locale.length && userLocale.length) {
      setLocale(userLocale[0]?.languageCode || "");
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const isAnonymous = user?.username === "anonymous";

    if ((isSignedIn || isAnonymous) && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !isAnonymous) {
      router.replace("/(auth)");
    }
  }, [isSignedIn, user]);

  return <Slot />;
};

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView>
        <InitialScreen />
        <Toaster />
      </GestureHandlerRootView>
    </ClerkProvider>
  );
};

export default RootLayout;
