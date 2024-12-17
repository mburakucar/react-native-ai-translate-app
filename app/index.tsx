import { Colors } from "@/constants/Colors";
import { Image, View, StyleSheet, ActivityIndicator } from "react-native";

const StartPage = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
  },
});

export default StartPage;
