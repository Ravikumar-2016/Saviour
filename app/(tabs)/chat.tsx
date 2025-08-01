import React, { useEffect, useState } from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Text, View } from "react-native";
import ChatRoom from "../../components/Chat/ChatRoom";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useNavigation } from "expo-router";
import { useLayoutEffect } from "react";

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatReady, setChatReady] = useState(false);
  const navigation = useNavigation();

  // Set navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Chat",
      headerBackTitle: "Back",
      headerTitleAlign: "center",
    });
  }, [navigation]);

  useEffect(() => {
    const fetchCity = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().city) {
        setCity(userDoc.data().city);
      } else {
        setCity(null);
      }
      setLoading(false);
    };
    fetchCity();
  }, [user]);

  useEffect(() => {
    const ensureChatDoc = async () => {
      if (!city) return;
      const chatDocRef = doc(db, "chats_users", city);
      const chatDoc = await getDoc(chatDocRef);
      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { createdAt: new Date() });
      }
      setChatReady(true);
    };
    if (city) ensureChatDoc();
  }, [city]);

  if (loading || (city && !chatReady)) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  if (!city) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme].background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors[colorScheme].text, fontSize: 18 }}>You must set your city in your profile to access chat.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ChatRoom roomId={city} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});