import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect } from "react";
import { useOAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { SegmentedControl } from "@/components/SegmentedControl";
import CustomTextInput from "@/components/CustomTextInput";
import CustomButton from "@/components/CustomButton";
import { FontAwesome } from "@expo/vector-icons";
import { ShowToast } from "@/components/ShowToast";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { Colors } from "@/constants/Colors";
const CELL_COUNT = 6;

import { useStateIfMounted } from "use-state-if-mounted";
import { useStore } from "@/stores/store";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const Login = () => {
  const { user, setUser } = useStore();
  const { signIn, setActive, isLoaded } = useSignIn();
  const {
    isLoaded: isLoadedSignUp,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();

  const router = useRouter();

  const [selectedOption, setSelectedOption] = useStateIfMounted("Sign In");

  const [emailAddress, setEmailAddress] = useStateIfMounted("");
  const [password, setPassword] = useStateIfMounted("");

  const [pendingVerification, setPendingVerification] =
    useStateIfMounted(false);
  const [code, setCode] = useStateIfMounted("");

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const [loading, setLoading] = useStateIfMounted(false);
  const [loadingGoogle, setLoadingGoogle] = useStateIfMounted(false);
  const [loadingWithoutSignIn, setLoadingWithoutSignIn] =
    useStateIfMounted(false);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    try {
      const signInAttempt = await signIn!.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive!({ session: signInAttempt.createdSessionId });
        setUser!({
          username: emailAddress,
          password,
        });
        router.replace("/");
      } else {
        ShowToast("error", "An error occurred", "Please try again");
        console.log(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      ShowToast(
        "error",
        err?.errors[0]?.message || "An error occurred",
        err?.errors[0]?.longMessage || "Please try again"
      );
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  const onSignUpPress = async () => {
    if (!isLoadedSignUp) {
      return;
    }

    setLoading(true);

    try {
      await signUp!.create({
        emailAddress,
        password,
      });

      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      ShowToast(
        "error",
        err?.errors[0]?.message || "An error occurred",
        err?.errors[0]?.longMessage || "Please try again"
      );
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoadedSignUp) {
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await signUp!.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActiveSignUp!({ session: completeSignUp.createdSessionId });
        setUser!({
          username: emailAddress,
          password,
        });
        router.replace("/");
      } else {
        ShowToast("error", "An error occurred", "Please try again");
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      ShowToast(
        "error",
        err?.errors[0]?.message || "An error occurred",
        err?.errors[0]?.longMessage || "Please try again"
      );
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      onPressVerify();
    }
  }, [code]);

  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onSignInWithGooglePress = useCallback(async () => {
    setLoadingGoogle(true);

    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL("/dashboard", {
            scheme: "ai-translate-app",
          }),
        });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        setUser!({
          username: "google_sign_in",
          password: "google_sign_in",
        });
      } else {
        ShowToast("error", "An error occurred", "Please try again");
      }
    } catch (err: any) {
      ShowToast(
        "error",
        err?.errors[0]?.message || "An error occurred",
        err?.errors[0]?.longMessage || "Please try again"
      );
      console.log("OAuth error", err);
    } finally {
      setLoadingGoogle(false);
    }
  }, []);

  const onContinueWithoutSignInPress = useCallback(async () => {
    setLoadingWithoutSignIn(true);

    try {
      setTimeout(() => {
        setUser!({
          id: undefined,
          username: "anonymous",
          password: "anonymous",
        });
        setLoadingWithoutSignIn(false);
      }, 1000);
    } catch (err: any) {
      ShowToast("error", "An error occurred", "Please try again");
      console.log("Anonymous sign in error", err);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          headerTitle: pendingVerification
            ? "Verify Your Email"
            : () => (
                <SegmentedControl
                  options={["Sign In", "Sign Up"]}
                  selectedOption={selectedOption}
                  onOptionPress={setSelectedOption}
                />
              ),
        }}
      />
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          marginTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {!pendingVerification ? (
            <>
              <View style={styles.inputContainer}>
                <CustomTextInput
                  placeholder="Email"
                  value={emailAddress}
                  setValue={setEmailAddress}
                />
              </View>

              <View style={styles.inputContainer}>
                <CustomTextInput
                  placeholder="Password"
                  value={password}
                  setValue={setPassword}
                  secureTextEntry={true}
                />
              </View>
              <View style={[styles.inputContainer, { marginTop: 20 }]}>
                <CustomButton
                  title={selectedOption === "Sign In" ? "Sign In" : "Sign Up"}
                  loading={loading}
                  onPress={() => {
                    if (selectedOption === "Sign In") {
                      onSignInPress();
                    } else {
                      onSignUpPress();
                    }
                  }}
                />
              </View>

              <View style={styles.borderContainer}>
                <View style={styles.border} />
                <Text style={styles.borderText}>or</Text>
                <View style={styles.border} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={onSignInWithGooglePress}
              >
                {loadingGoogle ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Image
                      source={require("@/assets/images/google-icon.png")}
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleText}>Sign In with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.borderContainer}>
                <View style={styles.border} />
                <Text style={styles.borderText}>or</Text>
                <View style={styles.border} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={onContinueWithoutSignInPress}
              >
                {loadingWithoutSignIn ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <FontAwesome
                      name="user-circle-o"
                      size={24}
                      color={Colors.primary}
                    />
                    <Text style={styles.googleText}>
                      Continue Without Sign In
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.verifyRow}>
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : null}
                <Text style={styles.verifyInfo}>
                  {loading
                    ? " Processing..."
                    : "Please enter the code sent to your e-mail address."}
                </Text>
              </View>
              <CodeField
                ref={ref}
                {...props}
                value={code}
                onChangeText={setCode}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    onLayout={getCellOnLayoutHandler(index)}
                    key={index}
                    style={[styles.cellRoot, isFocused && styles.focusCell]}
                  >
                    <Text style={styles.cellText}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </ScrollView>
      {/* <Toast /> */}
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flex: 1,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  border: {
    borderWidth: 1,
    flexShrink: 1,
    width: "100%",
    borderColor: "#d1d1d1",
  },
  borderContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 20,
  },
  borderText: {
    fontFamily: "Metropolis-Medium",
    color: "#7f7f7f",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleText: {
    fontFamily: "Metropolis-Medium",
    fontSize: 16,
  },

  codeFieldRoot: {
    marginTop: 20,
    width: 260,
    marginLeft: "auto",
    marginRight: "auto",
    gap: 4,
  },
  cellRoot: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  cellText: {
    color: Colors.primary,
    fontSize: 36,
    textAlign: "center",
    fontFamily: "Metropolis-Medium",
  },
  focusCell: {
    paddingBottom: 4,
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  verifyInfo: {
    fontFamily: "Metropolis-Medium",
    fontSize: 16,
    color: "#7f7f7f",
  },
});
