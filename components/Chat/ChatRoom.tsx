import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Alert } from "react-native";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
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

type UserProfile = {
  fullName?: string;
  photoUrl?: string;
  contact?: string;
  city?: string;
  email?: string;
  userPhone?: string;
};

type Props = { roomId: string };

export default function ChatRoom({ roomId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth() as { user: AppUser | null };
  const colorScheme = useColorScheme() ?? "light";
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [accessAllowed, setAccessAllowed] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  // Fetch user profile from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          fullName: data.fullName,
          photoUrl: data.photoUrl,
          contact: data.contact,
          city: data.city,
          email: data.email,
          userPhone: data.contact || data.phoneNumber,
        });
        setUserCity(data.city);
        setAccessAllowed(data.city === roomId);
      } else {
        setUserProfile({});
        setUserCity(null);
        setAccessAllowed(false);
      }
    };
    fetchUserProfile();
  }, [user, roomId]);

  // Ensure chat document exists before accessing messages
  useEffect(() => {
    if (!accessAllowed) return;
    const ensureChatDoc = async () => {
      const chatDocRef = doc(db, "chats_users", roomId);
      const chatDoc = await getDoc(chatDocRef);
      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { createdAt: new Date(), typingUsers: [] });
      }
    };
    ensureChatDoc();
  }, [roomId, accessAllowed]);

  // Listen for messages
  useEffect(() => {
    if (!accessAllowed) return;
    const q = query(
      collection(db, "chats_users", roomId, "messages"),
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

  // Listen for typing users
  useEffect(() => {
    if (!accessAllowed) return;
    const unsub = onSnapshot(doc(db, "chats_users", roomId), (snap) => {
      const data = snap.data();
      setTypingUsers(data?.typingUsers || []);
    });
    return () => unsub();
  }, [roomId, accessAllowed]);

  // Mark messages as read
  useEffect(() => {
    if (!user || !accessAllowed) return;
    messages.forEach(async (msg) => {
      if (!msg.readBy?.includes(user.uid)) {
        try {
          await updateDoc(doc(db, "chats_users", roomId, "messages", msg.id), {
            readBy: [...(msg.readBy || []), user.uid],
          });
        } catch (e) {
          console.error("Error marking message as read:", e);
        }
      }
    });
  }, [messages, user, roomId, accessAllowed]);

  // Send message
  const handleSend = async (msg: Omit<ChatMessage, "id" | "createdAt" | "readBy">) => {
    if (!user || !accessAllowed) return;
    try {
      const messageData: Omit<ChatMessage, "id"> = {
        text: msg.text,
        userId: user.uid,
        userName: userProfile.fullName || user.displayName || user.email || "User",
        userAvatar: userProfile.photoUrl || user.photoURL,
        userPhone: userProfile.contact || user.phoneNumber,
        email: user.email,
        fullName: userProfile.fullName,
        photoUrl: userProfile.photoUrl,
        contact: userProfile.contact,
        city: userProfile.city,
        createdAt: serverTimestamp(),
        readBy: [user.uid],
        ...(msg.media && { media: msg.media }),
        ...(msg.mediaType && { mediaType: msg.mediaType }),
        ...(msg.location && { location: msg.location }),
      };
      await addDoc(collection(db, "chats_users", roomId, "messages"), messageData);
      await updateDoc(doc(db, "chats_users", roomId), {
        typingUsers: [],
      });
    } catch (e) {
      console.error("Error sending message:", e);
      Alert.alert("Error", "Could not send message.");
    }
  };

  // Typing indicator
  const handleTyping = async (isTyping: boolean) => {
    if (!user || !accessAllowed) return;
    const chatDoc = doc(db, "chats_users", roomId);
    try {
      const docSnap = await getDoc(chatDoc);
      if (!docSnap.exists()) {
        await setDoc(chatDoc, { typingUsers: [] });
        console.log("Created chat doc for typing indicator");
      }
      if (isTyping) {
        await updateDoc(chatDoc, {
          typingUsers: Array.from(new Set([...(typingUsers || []), userProfile.fullName || user.displayName || user.email || "User"])),
        });
        if (typingRef.current) clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => handleTyping(false), 2000);
      } else {
        await updateDoc(chatDoc, {
          typingUsers: (typingUsers || []).filter((n) => n !== (userProfile.fullName || user.displayName || user.email || "User")),
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
      <ChatHeader
        title={`City: ${roomId} Chat`}
        avatar={messages[0]?.userAvatar || messages[0]?.photoUrl}
        subtitle="Local Users"
      />
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        ) : (
          <MessageList
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
      <MessageInput onSend={handleSend} user={{ ...user, ...userProfile }} onTyping={handleTyping} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { flex: 1, justifyContent: "flex-end" },
});