import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useStateIfMounted } from "use-state-if-mounted";

const CustomTextInput = ({
  placeholder,
  value,
  setValue,
  secureTextEntry,
  clearCallback,
}: {
  placeholder: string;
  value: string;
  setValue: (text: string) => void;
  secureTextEntry?: boolean;
  clearCallback?: () => void | null;
}) => {
  const [isFocused, setIsFocused] = useStateIfMounted(false);
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused ? Colors.primary : "#e0e0e0" },
        ]}
        autoCapitalize="none"
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={Colors.placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value.length > 0 ? (
        <TouchableOpacity
          style={{ position: "absolute", right: 10 }}
          onPress={() => {
            setValue("");
            if (clearCallback) {
              clearCallback();
            }
          }}
        >
          <MaterialIcons
            name="highlight-remove"
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    fontFamily: "Metropolis-Regular",
    backgroundColor: "#ebebeb",
  },
});
