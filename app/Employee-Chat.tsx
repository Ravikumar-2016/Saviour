import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Text, View } from "react-native";
import ChatRoom from "../components/Chat/EmployeeChatRoom";
import { useColorScheme } from "../hooks/useColorScheme";
import { Colors } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function EmployeeChatScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { user } = useAuth();
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCity = async () => {
      if (!user) return;
      const employeeDoc = await getDoc(doc(db, "employees", user.uid));
      if (employeeDoc.exists() && employeeDoc.data().city) {
        setCity(employeeDoc.data().city);
      } else {
        setCity(null);
      }
      setLoading(false);
    };
    fetchCity();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </SafeAreaView>
    );
  }

  if (!city) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: Colors[colorScheme].text, fontSize: 18 }}>You must set your city in your profile to access chat.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ChatRoom roomId={city} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});