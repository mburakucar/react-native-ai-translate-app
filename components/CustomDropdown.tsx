import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/Colors";

interface DropdownProps {
  label: string;
  value: string;
}

const CustomDropdown = ({
  value,
  setValue,
  placeholder,
  searchPlaceholder,
  onChangeCallback,
  renderLeftIcon,
  data,
}: {
  value: string | null;
  setValue: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  onChangeCallback?: (value: string) => void | null;
  renderLeftIcon?: (visible?: boolean) => React.ReactElement | null;
  data: DropdownProps[];
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: Colors.primary }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        activeColor={Colors.text}
        data={data || []}
        search
        autoScroll
        maxHeight={300}
        labelField="label"
        valueField="value"
        searchField="label"
        keyboardAvoiding={true}
        placeholder={!isFocus ? placeholder : "..."}
        searchPlaceholder={searchPlaceholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item: DropdownProps) => {
          setValue(item.value);
          setIsFocus(false);
          if (onChangeCallback) {
            onChangeCallback(item.value);
          }
        }}
        renderLeftIcon={renderLeftIcon}
      />
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdown: {
    height: 60,
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
