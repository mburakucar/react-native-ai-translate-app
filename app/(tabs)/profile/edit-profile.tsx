import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { ShowToast } from "@/components/ShowToast";
import { useStateIfMounted } from "use-state-if-mounted";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import CustomTextInput from "@/components/CustomTextInput";
import CustomDropdown from "@/components/CustomDropdown";
import { useStore } from "@/stores/store";
import { getLanguages } from "@/constants/Languages";

const dropdownData = getLanguages();

const EditProfile = () => {
  const { user } = useUser();
  const { locale, setLocale } = useStore();

  const [isLoading, setIsLoading] = useStateIfMounted(false);
  const [isLoadingName, setIsLoadingName] = useStateIfMounted(false);
  const [isEditing, setIsEditing] = useStateIfMounted(false);

  const [firstName, setFirstName] = useStateIfMounted(user?.firstName || "");
  const [lastName, setLastName] = useStateIfMounted(user?.lastName || "");

  const [language, setLanguage] = useStateIfMounted(locale);

  const updateImage = async () => {
    try {
      setIsLoading(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.75,
        base64: true,
      });

      if (!result.canceled) {
        const base64 = `data:image/png;base64,${result.assets[0].base64}`;
        await user?.setProfileImage({
          file: base64,
        });
      }
    } catch (error) {
      ShowToast(
        "error",
        "Error",
        "An error occurred while updating your profile image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateName = async () => {
    try {
      setIsEditing(false);
      setIsLoadingName(true);
      await user?.update({
        firstName: firstName,
        lastName: lastName,
      });
    } catch (error) {
      ShowToast("error", "Error", "An error occurred while updating your name");
    } finally {
      setIsLoadingName(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          <View style={styles.imageContainer}>
            <View>
              {isLoading ? (
                <View style={[styles.image, styles.imageCover]}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : null}
              <TouchableOpacity onPress={updateImage}>
                <MaterialIcons
                  name="mode-edit"
                  size={20}
                  color="white"
                  style={styles.imageEditIcon}
                />
                <Image source={{ uri: user?.imageUrl }} style={styles.image} />
              </TouchableOpacity>
            </View>
            <View style={styles.nameContainer}>
              {isEditing ? (
                <View style={styles.nameInputContainer}>
                  <CustomTextInput
                    value={firstName}
                    setValue={setFirstName}
                    placeholder="First Name"
                  />
                  <CustomTextInput
                    value={lastName}
                    setValue={setLastName}
                    placeholder="Last Name"
                  />
                </View>
              ) : (
                <Text style={styles.imageText}>{user?.fullName}</Text>
              )}
              {isLoadingName ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : isEditing ? (
                <FontAwesome
                  name="check"
                  size={24}
                  color={Colors.primary}
                  onPress={updateName}
                />
              ) : (
                <FontAwesome
                  name="edit"
                  size={24}
                  color={Colors.primary}
                  onPress={() => setIsEditing(true)}
                />
              )}
            </View>
            <Text style={styles.imageEmail}>
              {user?.emailAddresses[0].emailAddress}
            </Text>
          </View>
          <View style={{ marginVertical: 10 }}>
            <Text style={styles.sectionTitle}>Language</Text>
            <CustomDropdown
              data={dropdownData}
              value={language}
              setValue={setLanguage}
              placeholder="Select Your Language"
              searchPlaceholder="Search Language"
              onChangeCallback={(value) => {
                setLocale(value);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  nameInputContainer: {
    flexDirection: "column",
    width: "50%",
    flexShrink: 1,
    gap: 10,
  },
  imageContainer: {
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  imageText: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    color: Colors.primaryDark,
  },
  imageEmail: {
    fontFamily: "Metropolis-Regular",
    fontSize: 12,
    color: "gray",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  imageCover: {
    zIndex: 100,
    elevation: 100,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageEditIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    padding: 5,
    position: "absolute",
    bottom: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 10,
  },
});
