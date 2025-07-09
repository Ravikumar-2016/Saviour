import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  Image,
  Alert,
  Modal,
  Text,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";

const MAX_MEDIA_SIZE = 950000;

type Props = {
  onSend: (msg: {
    text: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    userPhone?: string;
    email?: string;
    fullName?: string;
    photoUrl?: string;
    contact?: string;
    city?: string;
    media?: string;
    mediaType?: "image" | "video" | "audio" | "location";
    location?: { latitude: number; longitude: number };
  }) => void;
  user: any;
  onTyping?: (isTyping: boolean) => void;
};

export default function EmployeeMessageInput({ onSend, user, onTyping }: Props) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<string | undefined>();
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "location" | undefined>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const colorScheme = useColorScheme() ?? "light";
  const isPreparingRecording = useRef(false);

  // --- Media Pickers ---
  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });
      if (!res.canceled && res.assets && res.assets[0].base64) {
        const base64 = res.assets[0].base64;
        if (base64.length * 0.75 > MAX_MEDIA_SIZE) {
          Alert.alert("File too large", "Please select an image under 900KB.");
          return;
        }
        setMedia(`data:image/jpeg;base64,${base64}`);
        setMediaType("image");
        setShowMediaOptions(false);
        console.log("Image picked");
      }
    } catch (e) {
      console.error("Error picking image:", e);
    }
  };

  const pickVideo = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        base64: false,
        quality: 0.7,
      });
      if (!res.canceled && res.assets && res.assets[0].uri) {
        const fileUri = res.assets[0].uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          Alert.alert("File not found", "The selected video file does not exist.");
          return;
        }
        if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_MEDIA_SIZE) {
          Alert.alert("File too large", "Please select a video under 900KB.");
          return;
        }
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
        setMedia(`data:video/mp4;base64,${base64}`);
        setMediaType("video");
        setShowMediaOptions(false);
        console.log("Video picked");
      }
    } catch (e) {
      console.error("Error picking video:", e);
    }
  };

  const pickAudio = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "audio/*", copyToCacheDirectory: true });
      if (res.assets && res.assets.length > 0 && res.assets[0].uri) {
        const fileInfo = await FileSystem.getInfoAsync(res.assets[0].uri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_MEDIA_SIZE) {
          Alert.alert("File too large", "Please select an audio file under 900KB.");
          return;
        }
        const base64 = await FileSystem.readAsStringAsync(res.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
        setMedia(`data:audio/m4a;base64,${base64}`);
        setMediaType("audio");
        setShowMediaOptions(false);
        console.log("Audio picked");
      }
    } catch (e) {
      console.error("Error picking audio:", e);
    }
  };

  // --- Location Sharing ---
  const shareLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setMediaType("location");
      setShowMediaOptions(false);

      // Send location as a Google Maps link
      const mapsUrl = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
      onSend({
        text: `Live location: ${mapsUrl}`,
        userId: user.uid,
        userName: user.fullName || user.displayName || user.name || user.email || "User",
        userAvatar: user.photoUrl || user.photoURL,
        userPhone: user.contact || user.phoneNumber,
        email: user.email,
        fullName: user.fullName,
        photoUrl: user.photoUrl,
        contact: user.contact,
        city: user.city,
        media: undefined,
        mediaType: "location",
        location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
      });
      setText("");
      setMedia(undefined);
      setMediaType(undefined);
      setLocation(null);
      Keyboard.dismiss();
      setShowMediaOptions(false);
      console.log("Location picked and sent");
    } catch (e) {
      Alert.alert("Error", "Could not get location.");
      console.error("Error getting location:", e);
    }
  };

  // --- Voice Recording ---
  const startRecording = async () => {
    if (isPreparingRecording.current || isRecording) return;
    isPreparingRecording.current = true;
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      Alert.alert("Error", "Could not start recording");
      console.error("Error starting recording:", err);
    } finally {
      isPreparingRecording.current = false;
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_MEDIA_SIZE) {
        Alert.alert("File too large", "Please record a shorter audio.");
        setRecording(null);
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      setMedia(`data:audio/m4a;base64,${base64}`);
      setMediaType("audio");
      handleSend();
      console.log("Recording stopped and sent");
    }
    setRecording(null);
  };

  // --- Send Handler ---
  const handleSend = () => {
    if ((!text.trim() && !media && !location) || !user) return;

    const messageData: any = {
      text: text.trim(),
      userId: user.uid,
      userName: user.fullName || user.displayName || user.name || user.email || "User",
      userAvatar: user.photoUrl || user.photoURL,
      userPhone: user.contact || user.phoneNumber,
      email: user.email,
      fullName: user.fullName,
      photoUrl: user.photoUrl,
      contact: user.contact,
      city: user.city,
      ...(media && { media }),
      ...(mediaType && { mediaType }),
      ...(location && { location }),
    };

    onSend(messageData);
    setText("");
    setMedia(undefined);
    setMediaType(undefined);
    setLocation(null);
    Keyboard.dismiss();
    setShowMediaOptions(false);
    console.log("handleSend called");
  };

  // --- UI ---
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].card, borderTopColor: Colors[colorScheme].border }]}>
      {/* Spiral Clip Icon */}
      <TouchableOpacity onPress={() => setShowMediaOptions((v) => !v)} style={styles.iconBtn}>
        <Entypo name="attachment" size={24} color={Colors[colorScheme].tint} />
      </TouchableOpacity>

      {/* Media Options Modal */}
      <Modal visible={showMediaOptions} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMediaOptions(false)}>
          <View style={[styles.mediaOptions, { backgroundColor: Colors[colorScheme].background }]}>
            <TouchableOpacity onPress={pickImage} style={styles.mediaOptionBtn}>
              <Ionicons name="image" size={28} color="#22c55e" />
              <Text style={styles.mediaOptionText}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickVideo} style={styles.mediaOptionBtn}>
              <Ionicons name="videocam" size={28} color="#2563eb" />
              <Text style={styles.mediaOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickAudio} style={styles.mediaOptionBtn}>
              <Ionicons name="musical-notes" size={28} color="#f59e42" />
              <Text style={styles.mediaOptionText}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareLocation} style={styles.mediaOptionBtn}>
              <Ionicons name="location" size={28} color="#e11d48" />
              <Text style={styles.mediaOptionText}>Location</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Camera Icon */}
      <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
        <Ionicons name="camera" size={24} color={Colors[colorScheme].tint} />
      </TouchableOpacity>

      {/* Audio/Mic Icon */}
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        style={styles.iconBtn}
      >
        <MaterialCommunityIcons
          name={isRecording ? "microphone" : "microphone-outline"}
          size={24}
          color={isRecording ? "#e11d48" : Colors[colorScheme].tint}
        />
      </TouchableOpacity>

      {/* Message Input */}
      <View style={{ flex: 1 }}>
        <TextInput
          style={[
            styles.input,
            {
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].inputBackground || Colors[colorScheme].background,
            },
          ]}
          placeholder="Type a message"
          placeholderTextColor={Colors[colorScheme].textMuted}
          value={text}
          onChangeText={t => {
            setText(t);
            if (onTyping) onTyping(!!t);
          }}
          multiline
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity onPress={handleSend} style={styles.iconBtn}>
        <Ionicons name="send" size={24} color={Colors[colorScheme].tint} />
      </TouchableOpacity>

      {/* Media Preview */}
      {media && mediaType === "image" && (
        <Image source={{ uri: media }} style={{ width: 40, height: 40, borderRadius: 8, marginLeft: 8 }} />
      )}
      {location && (
        <View style={{ marginLeft: 8 }}>
          <Ionicons name="location" size={24} color="#e11d48" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: Platform.OS === "ios" ? 120 : 100,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  mediaOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  mediaOptionBtn: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  mediaOptionText: {
    marginTop: 4,
    fontSize: 13,
    color: "#444",
  },
});