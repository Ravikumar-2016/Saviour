import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from "react-native";
import { ChatMessage } from "./ChatRoom";
import MediaPreview from "./MediaPreview";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

type Props = {
  message: ChatMessage;
  isOwn: boolean;
  onProfilePress?: (msg: ChatMessage) => void;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(urlRegex);
  return parts.map((part, idx) => {
    if (urlRegex.test(part)) {
      return (
        <Text
          key={idx}
          style={{
            color: "#00e0ff",
            textDecorationLine: "underline",
            fontWeight: "bold",
            flexWrap: "wrap",
          }}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return <Text key={idx}>{part}</Text>;
  });
}

export default function MessageBubble({ message, isOwn, onProfilePress }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const [profileModal, setProfileModal] = useState(false);

  const displayName = message.fullName || message.userName || message.email || "User";
  const avatar =
    message.photoUrl ||
    message.userAvatar ||
    require("../../assets/images/default-avatar.png");
  const handleCopy = () => {
    Clipboard.setStringAsync(message.text || "");
    Alert.alert("Copied", "Message copied to clipboard");
  };

  return (
    <Pressable
      onLongPress={handleCopy}
      delayLongPress={350}
      style={[
        styles.bubble,
        isOwn ? styles.own : styles.other,
        { backgroundColor: isOwn ? Colors[colorScheme].tint : Colors[colorScheme].background },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
        <TouchableOpacity onPress={() => setProfileModal(true)}>
          <Image
            source={
              typeof avatar === "string"
                ? { uri: avatar }
                : avatar
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <Text style={[styles.name, { color: Colors[colorScheme].textMuted }]}>
          {displayName}
        </Text>
      </View>
      {message.media && (
        <MediaPreview
          media={message.media}
          mediaType={
            message.mediaType === "image" ||
            message.mediaType === "video" ||
            message.mediaType === "audio"
              ? message.mediaType
              : undefined
          }
        />
      )}
      {message.text ? (
        <Text
          style={[
            styles.text,
            { color: isOwn ? "#fff" : Colors[colorScheme].text, flexWrap: "wrap" },
          ]}
          selectable
        >
          {renderTextWithLinks(message.text)}
        </Text>
      ) : null}
      <Text style={styles.time}>
        {message.createdAt?.toDate
          ? message.createdAt.toDate().toLocaleTimeString()
          : ""}
      </Text>
      {/* Profile Modal */}
      <Modal visible={profileModal} transparent animationType="slide" onRequestClose={() => setProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.profileModal, { backgroundColor: Colors[colorScheme].background }]}>
            <TouchableOpacity onPress={() => setProfileModal(false)} style={{ alignSelf: "flex-end" }}>
              <Text style={{ color: Colors[colorScheme].tint, fontWeight: "bold", fontSize: 18 }}>Close</Text>
            </TouchableOpacity>
            <Image
              source={
                typeof avatar === "string"
                  ? { uri: avatar }
                  : avatar
              }
              style={styles.profileAvatar}
            />
            <Text style={[styles.profileName, { color: Colors[colorScheme].text }]}>
              {message.fullName || message.userName || message.email || "User"}
            </Text>
            {message.email && (
              <Text style={{ color: Colors[colorScheme].textMuted, fontSize: 15, marginTop: 4 }}>
                {message.email}
              </Text>
            )}
            {message.userPhone && (
              <Text style={{ color: Colors[colorScheme].textMuted, fontSize: 15, marginTop: 4 }}>
                {message.userPhone}
              </Text>
            )}
            {message.contact && (
              <Text style={{ color: Colors[colorScheme].textMuted, fontSize: 15, marginTop: 4 }}>
                Contact: {message.contact}
              </Text>
            )}
            {message.city && (
              <Text style={{ color: Colors[colorScheme].textMuted, fontSize: 15, marginTop: 4 }}>
                City: {message.city}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: {
    marginBottom: 12,
    borderRadius: 14,
    padding: 10,
    maxWidth: "80%",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  own: { alignSelf: "flex-end" },
  other: { alignSelf: "flex-start" },
  name: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
  text: { fontSize: 16, marginTop: 2, flexWrap: "wrap" },
  time: { fontSize: 10, color: "#888", marginTop: 4, alignSelf: "flex-end" },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileModal: {
    width: 300,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontWeight: "bold", fontSize: 22, marginTop: 6 },
});