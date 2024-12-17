import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React, { useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ShowToast } from "./ShowToast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onPhotoCapture: (photo: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isVisible,
  onClose,
  onPhotoCapture,
}) => {
  const { top, bottom } = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [flash, setFlash] = useState<"off" | "on">("off");

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });
        onPhotoCapture(photo?.base64 || "");
      } catch (error) {
        ShowToast(
          "error",
          "An error occurred",
          "An error occurred while taking the photo"
        );
      } finally {
        onClose();
      }
    }
  };

  const toggleFlash = () => {
    setFlash(flash === "on" ? "off" : "on");
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          enableTorch={flash === "on"}
        >
          <View style={[styles.topButtonsContainer, { marginTop: top }]}>
            <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
              <MaterialIcons
                name={flash === "on" ? "flash-on" : "flash-off"}
                size={30}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.topButton} onPress={onClose}>
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cameraButton, { bottom: bottom + 50 }]}
            onPress={takePicture}
          >
            <MaterialCommunityIcons name="camera" size={60} color="white" />
          </TouchableOpacity>
        </CameraView>
      </View>
    </Modal>
  );
};

export default CameraModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  camera: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 1,
  },
  topButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  cameraButton: {
    backgroundColor: Colors.primary,
    opacity: 0.8,
    borderRadius: 200,
    padding: 20,
    position: "absolute",
  },
  text: {
    color: "white",
    fontSize: 16,
  },
});
