import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView scrollEnabled={user ? true : false} style={styles.container}>
        {!user ? (
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              You must log in to view this page.
            </Text>

            <CustomButton
              title="Login"
              onPress={() => {
                router.push("/(auth)/modal");
              }}
            />
          </View>
        ) : (
          <View style={styles.menuContainer}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: user?.imageUrl }} style={styles.image} />
              <Text style={styles.imageText}>{user?.fullName}</Text>
              <Text style={styles.imageEmail}>
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push("/profile/edit-profile");
              }}
              style={styles.buttons}
            >
              <FontAwesome5 name="user-edit" size={20} color={Colors.primary} />
              <Text style={styles.buttonText}>Edit Profile Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.push("/profile/history");
              }}
              style={styles.buttons}
            >
              <FontAwesome name="history" size={24} color={Colors.primary} />
              <Text style={styles.buttonText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                signOut();
              }}
              style={[styles.buttons, styles.logoutButton]}
            >
              <MaterialIcons name="logout" size={24} color="white" />
              <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ebebeb",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "lightcoral",
    borderColor: "lightcoral",
  },
  buttonText: {
    fontFamily: "Metropolis-SemiBold",
    color: "#5e5e5e",
    fontSize: 15,
    marginLeft: 10,
  },
  logoutText: {
    color: "white",
  },
  loginText: {
    fontFamily: "Metropolis-Regular",
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
