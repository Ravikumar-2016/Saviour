import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import EmployeeMessageList from "./EmployeeMessageList";
import EmployeeMessageInput from "./EmployeeMessageInput";
import { useAuth } from "../../context/AuthContext";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppUser } from "../../types/auth-context";

export type ChatMessage = {
  id: string;
  text: string;
  createdAt: any;
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
  readBy?: string[];
  typing?: boolean;
};

type EmployeeProfile = {
  fullName?: string;
  photoUrl?: string;
  contact?: string;
  city?: string;
  email?: string;
  userPhone?: string;
  phone?: string;
};

type Props = { roomId: string };

export default function EmployeeChatRoom({ roomId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth() as { user: AppUser | null };
  const colorScheme = useColorScheme() ?? "light";
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [accessAllowed, setAccessAllowed] = useState<boolean>(false);
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile>({});

  // Fetch employee profile from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchEmployeeProfile = async () => {
      const empDoc = await getDoc(doc(db, "employees", user.uid));
      if (empDoc.exists()) {
        const data = empDoc.data();
        setEmployeeProfile({
          fullName: data.fullName,
          photoUrl: data.photoUrl,
          contact: data.contact,
          city: data.city,
          email: data.email,
          userPhone: data.contact || data.phone || data.phoneNumber,
          phone: data.phone,
        });
        setUserCity(data.city);
        setAccessAllowed(data.city === roomId);
      } else {
        setEmployeeProfile({});
        setUserCity(null);
        setAccessAllowed(false);
      }
    };
    fetchEmployeeProfile();
  }, [user, roomId]);

  useEffect(() => {
    if (!accessAllowed) return;
    const q = query(
      collection(db, "chats_employees", roomId, "messages"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      Alert.alert("Error", "Could not fetch messages.");
    });
    return () => unsub();
  }, [roomId, accessAllowed]);

  useEffect(() => {
    if (!accessAllowed) return;
    const unsub = onSnapshot(doc(db, "chats_employees", roomId), (snap) => {
      const data = snap.data();
      setTypingUsers(data?.typingUsers || []);
    });
    return () => unsub();
  }, [roomId, accessAllowed]);

  useEffect(() => {
    if (!user || !accessAllowed) return;
    messages.forEach(async (msg) => {
      if (!msg.readBy?.includes(user.uid)) {
        try {
          await updateDoc(doc(db, "chats_employees", roomId, "messages", msg.id), {
            readBy: [...(msg.readBy || []), user.uid],
          });
        } catch (e) {
          console.error("Error marking message as read:", e);
        }
      }
    });
  }, [messages, user, roomId, accessAllowed]);

  // Helper to remove undefined fields
  function removeUndefinedFields<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as Partial<T>;
  }

  // Upload media to Firebase Storage and return the download URL
  const uploadMediaIfNeeded = async (media: string | undefined, mediaType: string | undefined) => {
    if (!media) return undefined;
    // If already a URL, just return it
    if (!media.startsWith("file://")) return media;
    try {
      const response = await fetch(media);
      const blob = await response.blob();
      const ext = media.split('.').pop() || (mediaType === "image" ? "jpg" : "bin");
      const fileRef = storageRef(storage, `chat_media/${roomId}/${Date.now()}_${user?.uid}.${ext}`);
      await uploadBytes(fileRef, blob);
      return await getDownloadURL(fileRef);
    } catch (e) {
      console.error("Media upload failed:", e);
      Alert.alert("Error", "Failed to upload media.");
      return undefined;
    }
  };

  const handleSend = async (msg: Omit<ChatMessage, "id" | "createdAt" | "readBy">) => {
    if (!user || !accessAllowed) return;
    if ((!msg.text || msg.text.trim() === "") && !msg.media) {
      Alert.alert("Error", "Cannot send empty message.");
      return;
    }
    try {
      let mediaUrl = undefined;
      if (msg.media) {
        mediaUrl = await uploadMediaIfNeeded(msg.media, msg.mediaType);
        if (!mediaUrl && msg.media) return; // If upload failed, don't send
      }
      const messageData = removeUndefinedFields({
        text: msg.text ?? "",
        userId: user.uid,
        userName: employeeProfile.fullName || user.displayName || user.email || "Employee",
        userAvatar: employeeProfile.photoUrl || user.photoURL,
        userPhone: employeeProfile.contact || employeeProfile.phone || user.phoneNumber,
        email: employeeProfile.email || user.email,
        fullName: employeeProfile.fullName,
        photoUrl: employeeProfile.photoUrl,
        contact: employeeProfile.contact,
        city: employeeProfile.city,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
        ...(mediaUrl && { media: mediaUrl }),
        ...(msg.mediaType && { mediaType: msg.mediaType }),
        ...(msg.location && { location: msg.location }),
      }) as Omit<ChatMessage, "id">;
      await addDoc(collection(db, "chats_employees", roomId, "messages"), messageData);
      await updateDoc(doc(db, "chats_employees", roomId), {
        typingUsers: [],
      });
    } catch (e) {
      console.error("Error sending message:", e);
      Alert.alert("Error", "Could not send message.");
    }
  };

  const handleTyping = async (isTyping: boolean) => {
    if (!user || !accessAllowed) return;
    const chatDoc = doc(db, "chats_employees", roomId);
    try {
      const docSnap = await getDoc(chatDoc);
      if (!docSnap.exists()) {
        await setDoc(chatDoc, { typingUsers: [] });
        console.log("Created chat doc for typing indicator");
      }
      const displayName = employeeProfile.fullName || user.displayName || user.email || "Employee";
      if (isTyping) {
        await updateDoc(chatDoc, {
          typingUsers: Array.from(new Set([...(typingUsers || []), displayName])),
        });
        if (typingRef.current) clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => handleTyping(false), 2000);
      } else {
        await updateDoc(chatDoc, {
          typingUsers: (typingUsers || []).filter((n) => n !== displayName),
        });
      }
      console.log("Typing status updated:", isTyping);
    } catch (e) {
      console.error("Error updating typing status:", e);
    }
  };

  if (!accessAllowed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: Colors[colorScheme].text, fontSize: 18 }}>
            You are not allowed to access this chat room.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          ) : (
            <EmployeeMessageList
              messages={messages}
              currentUserId={user?.uid}
              onProfilePress={() => {}}
            />
          )}
          {typingUsers.length > 0 && (
            <Text style={{ color: Colors[colorScheme].textMuted, marginLeft: 16, marginBottom: 2 }}>
              {typingUsers.join(", ")} typing...
            </Text>
          )}
        </View>
        <EmployeeMessageInput
          onSend={handleSend}
          user={{ ...user, ...employeeProfile }}
          onTyping={handleTyping}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1, justifyContent: "flex-end" },
});