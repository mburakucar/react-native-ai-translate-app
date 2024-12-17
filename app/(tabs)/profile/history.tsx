import {
  FlatList,
  SafeAreaView,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef } from "react";
import { Colors } from "@/constants/Colors";
import { useStore } from "@/stores/store";
import { Ionicons } from "@expo/vector-icons";
import { useStateIfMounted } from "use-state-if-mounted";
import { History } from "@/constants/Interfaces";
import { Languages } from "@/constants/Languages";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Audio } from "expo-av";
import { playFromUri, playText } from "@/utils/playSound";
import HistoryItem from "@/components/HistoryItem";
import ImageView from "react-native-image-viewing";
import * as FileSystem from "expo-file-system";
import ResultTextInput from "@/components/ResultTextInput";

const Page = () => {
  const { history, setHistory, setTabBarVisible } = useStore();

  const [data, setData] = useStateIfMounted<History[]>([]);
  const [detailData, setDetailData] = useStateIfMounted<History | null>(null);

  const [isVisible, setIsVisible] = useStateIfMounted(false);

  const [isLoadingSound, setIsLoadingSound] = useStateIfMounted(false);
  const [isPlaying, setIsPlaying] = useStateIfMounted(false);
  const [isPlayingRecording, setIsPlayingRecording] = useStateIfMounted(false);
  const [isPlayingSource, setIsPlayingSource] = useStateIfMounted(false);
  const [isPlayingTarget, setIsPlayingTarget] = useStateIfMounted(false);
  const [sound, setSound] = useStateIfMounted<Audio.Sound | null>(null);

  useEffect(() => {
    if (history.length) {
      const sortedHistory = history.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
      setData(sortedHistory);
    } else {
      setData([]);
    }
  }, [history]);

  useEffect(() => {
    setTabBarVisible(false);

    return () => {
      setTabBarVisible(true);
    };
  }, []);

  const getLanguage = (item: History) => {
    let language = "";
    let sourceLanguage = "";
    if (item.type === "image") {
      language = item.image?.translatedLanguage || "";
    } else if (item.type === "voice") {
      language = item.voice?.translatedLanguage || "";
    } else {
      language = item.text?.translatedLanguage || "";
      sourceLanguage = item.text?.sourceLanguage || "";
    }

    if (item?.type === "text" && item?.text?.sourceLanguage == "auto") {
      sourceLanguage = "Auto";
    }

    const languageData = Languages.find((lang) => lang.code === language);
    const sourceLanguageData = Languages.find(
      (lang) => lang.code === sourceLanguage
    );

    return {
      name: `${languageData?.englishName} (${languageData?.name})`,
      flag: languageData?.flag || "",
      sourceName: `${sourceLanguageData?.englishName} (${sourceLanguageData?.name})`,
      sourceFlag: sourceLanguageData?.flag || "Auto Detect",
    };
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const returnDetailComponent = (item: History) => {
    switch (item.type) {
      case "text":
        return (
          <View style={{ gap: 20, width: "100%", flexShrink: 1 }}>
            <ResultTextInput
              text={item.text?.sourceText || ""}
              setText={() => {}}
              disabled={isLoadingSound || isPlayingTarget}
              editable={false}
              changeBackground={isPlayingSource}
              blurOnSubmit={false}
              onPress={() => {
                playText(
                  item.text?.sourceText || "",
                  item.text?.sourceLanguage || "",
                  isPlayingSource,
                  setIsPlayingSource,
                  sound,
                  setSound,
                  setIsLoadingSound
                );
              }}
            />

            <ResultTextInput
              text={item.text?.translatedText || ""}
              setText={() => {}}
              disabled={isLoadingSound || isPlayingSource}
              editable={false}
              changeBackground={isPlayingTarget}
              blurOnSubmit={false}
              onPress={() => {
                playText(
                  item.text?.translatedText || "",
                  item.text?.translatedLanguage || "",
                  isPlayingTarget,
                  setIsPlayingTarget,
                  sound,
                  setSound,
                  setIsLoadingSound
                );
              }}
            />
          </View>
        );
      case "voice":
        return (
          <View style={styles.voiceContainer}>
            <ResultTextInput
              text={item.voice?.translatedText || ""}
              setText={() => {}}
              disabled={isLoadingSound}
              editable={false}
              changeBackground={isPlaying}
              blurOnSubmit={false}
              onPress={() => {
                playText(
                  item.voice?.translatedText || "",
                  item.voice?.translatedLanguage || "",
                  isPlaying,
                  setIsPlaying,
                  sound,
                  setSound,
                  setIsLoadingSound
                );
              }}
            />

            <View style={styles.voiceButtonContainer}>
              <TouchableOpacity
                style={{
                  backgroundColor: isPlayingRecording ? "red" : Colors.primary,
                  padding: 15,
                  borderRadius: 100,
                }}
                onPress={() => {
                  playFromUri(
                    item.voice?.voiceUri || "",
                    isPlayingRecording,
                    setIsPlayingRecording,
                    sound,
                    setSound
                  );
                }}
              >
                <Text
                  style={{
                    fontFamily: "Metropolis-SemiBold",
                    fontSize: 16,
                    color: "white",
                  }}
                >
                  {isPlayingRecording ? (
                    <Ionicons name="stop" size={24} color="white" />
                  ) : (
                    <Ionicons name="play" size={24} color="white" />
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case "image":
        return (
          <View style={{ gap: 20, width: "100%", flexShrink: 1 }}>
            <ResultTextInput
              text={item.image?.translatedText || ""}
              setText={() => {}}
              disabled={isLoadingSound}
              editable={false}
              changeBackground={isPlaying}
              blurOnSubmit={false}
              onPress={() => {
                playText(
                  item.image?.translatedText || "",
                  item.image?.translatedLanguage || "",
                  isPlaying,
                  setIsPlaying,
                  sound,
                  setSound,
                  setIsLoadingSound
                );
              }}
            />

            <ImageView
              images={[{ uri: item.image?.image }]}
              imageIndex={0}
              visible={isVisible}
              onRequestClose={() => setIsVisible(false)}
              swipeToCloseEnabled={true}
            />
            <TouchableOpacity
              onPress={() => {
                setIsVisible(true);
              }}
            >
              <Image
                source={{ uri: item.image?.image }}
                resizeMode="cover"
                style={{ width: "100%", height: 200, borderRadius: 10 }}
              />
            </TouchableOpacity>
          </View>
        );
    }
  };

  const returnTranslatedFromComponent = (item: History) => {
    switch (item.type) {
      case "text":
        return (
          <Text style={styles.translatedFromText}>
            {getLanguage(item).sourceFlag?.length &&
            getLanguage(item).sourceFlag != "Auto Detect"
              ? `Translated from ${getLanguage(item).sourceFlag} ${
                  getLanguage(item).sourceName
                } to ${getLanguage(item).flag} ${getLanguage(item).name}`
              : `Translated to ${getLanguage(item).flag} ${
                  getLanguage(item).name
                }`}
          </Text>
        );
      default:
        return (
          <Text style={styles.translatedFromText}>
            Translated to{" "}
            {getLanguage(item).flag + " " + getLanguage(item).name}
          </Text>
        );
    }
  };

  const deleteHistory = async (id: string) => {
    let deleteData = history.find((item) => item.id === id);
    if (deleteData?.type === "voice" && deleteData?.voice?.voiceUri) {
      await FileSystem.deleteAsync(deleteData.voice.voiceUri);
    }
    setHistory(history.filter((item) => item.id !== id));
  };

  const snapPoints = React.useMemo(() => ["70%"], []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item?.id}
        style={{
          width: "100%",
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 10,
        }}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            setDetailData={setDetailData}
            bottomSheetRef={bottomSheetRef}
            getLanguage={getLanguage}
            deleteHistory={deleteHistory}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found</Text>
          </View>
        )}
      />
      <BottomSheetModalProvider>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableOverDrag={false}
          backdropComponent={renderBackdrop}
          backgroundComponent={null}
          handleIndicatorStyle={{
            backgroundColor: "transparent",
          }}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
        >
          <View
            style={{
              paddingTop: 20,
              paddingHorizontal: 20,
              flex: 1,
              backgroundColor: Colors.backgroundDark,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetHeaderText}>Details</Text>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.close();
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={40}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            <BottomSheetScrollView
              style={styles.bottomSheetContainer}
              contentContainerStyle={styles.bottomSheetContentContainer}
            >
              {detailData ? (
                <>
                  {returnTranslatedFromComponent(detailData)}
                  {returnDetailComponent(detailData)}
                </>
              ) : null}
            </BottomSheetScrollView>
          </View>
        </BottomSheet>
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bottomSheetContainer: {
    flex: 1,
  },
  bottomSheetContentContainer: {
    alignItems: "flex-start",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Metropolis-SemiBold",
    fontSize: 16,
    color: Colors.placeholder,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  bottomSheetHeaderText: {
    fontFamily: "Metropolis-Bold",
    color: Colors.primary,
    fontSize: 25,
  },
  translatedFromText: {
    fontFamily: "Metropolis-Bold",
    fontSize: 16,
    marginBottom: 10,
  },
  voiceContainer: {
    gap: 20,
    width: "100%",
    flexShrink: 1,
    alignItems: "flex-start",
  },
  voiceButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 1,
  },
});
