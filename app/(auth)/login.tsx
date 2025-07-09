import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, DocumentSnapshot, DocumentData } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import * as GoogleAuth from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

const USER_ROLES = ["user", "employee", "admin"] as const;
type UserRole = (typeof USER_ROLES)[number];

const GOOGLE_WEB_CLIENT_ID = "1012376360740-7egjvkecijotophpbhnsvc5flbsr75vm.apps.googleusercontent.com";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  // Google AuthSession
  const [request, response, promptAsync] = GoogleAuth.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const doGoogleLogin = async () => {
      if (response?.type === "success" && response.authentication?.accessToken) {
        setGoogleLoading(true);
        try {
          const credential = GoogleAuthProvider.credential(null, response.authentication.accessToken);
          const userCredential = await signInWithCredential(auth, credential);
          if (!userCredential.user) {
            Alert.alert("Login Failed", "No user returned from authentication.");
            setGoogleLoading(false);
            return;
          }
          // Check role by collection
          let userDoc: DocumentSnapshot<DocumentData>;
          if (selectedRole === "user") {
            userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          } else if (selectedRole === "employee") {
            userDoc = await getDoc(doc(db, "employees", userCredential.user.uid));
          } else {
            userDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
          }
          if (!userDoc.exists()) {
            Alert.alert(
              "Login Failed",
              `No ${selectedRole} account found for this email.`
            );
            setGoogleLoading(false);
            return;
          }
          // Route by role
          if (selectedRole === "admin") {
            router.replace("/Admin");
          } else if (selectedRole === "employee") {
            router.replace("/Employee");
          } else {
            router.replace("/(tabs)");
          }
        } catch (error: any) {
          console.error(error);
          Alert.alert("Google Login Failed", "Could not log in with Google.");
        } finally {
          setGoogleLoading(false);
        }
      }
    };
    doGoogleLogin();
  }, [response, selectedRole]);

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Login Failed", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Check role by collection
      let userDoc: DocumentSnapshot<DocumentData>;
      if (selectedRole === "user") {
        userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      } else if (selectedRole === "employee") {
        userDoc = await getDoc(doc(db, "employees", userCredential.user.uid));
      } else {
        userDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
      }
      if (!userDoc.exists()) {
        Alert.alert(
          "Login Failed",
          `No ${selectedRole} account found for this email.`
        );
        setLoading(false);
        return;
      }
      // Route by role
      if (selectedRole === "admin") {
        router.replace("/Admin");
      } else if (selectedRole === "employee") {
        router.replace("/Employee");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      let message = "Login failed. Please try again.";
      if (error.code === "auth/invalid-email") message = "Invalid email address.";
      if (error.code === "auth/user-disabled") message = "This account has been disabled.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password")
        message = "Invalid email or password.";
      if (error.code === "auth/too-many-requests")
        message = "Too many attempts. Please try again later.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: Colors[colorScheme].background,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
      color: Colors[colorScheme].tint,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: 20,
      fontSize: 16,
      color: Colors[colorScheme].textMuted,
    },
    roleSelectorContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      backgroundColor: Colors[colorScheme].inputBackground,
      borderRadius: 12,
      padding: 6,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginHorizontal: 2,
    },
    roleButtonSelected: {
      backgroundColor: Colors[colorScheme].tint,
    },
    roleButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors[colorScheme].textMuted,
    },
    roleButtonTextSelected: {
      color: Colors[colorScheme].background,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 12,
      backgroundColor: Colors[colorScheme].inputBackground,
    },
    input: {
      flex: 1,
      height: 54,
      color: Colors[colorScheme].text,
      fontSize: 16,
    },
    button: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      color: Colors[colorScheme].background,
      fontSize: 18,
      fontWeight: "bold",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors[colorScheme].border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: Colors[colorScheme].textMuted,
      fontSize: 14,
    },
    socialLoginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    socialButton: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 10,
      width: 54,
      height: 54,
      backgroundColor: Colors[colorScheme].inputBackground,
    },
    socialLogo: {
      width: 28,
      height: 28,
    },
    linkText: {
      textAlign: "center",
      color: Colors[colorScheme].tint,
      fontSize: 16,
    },
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Welcome Back!</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to continue as</ThemedText>
        <View style={styles.roleSelectorContainer}>
          {USER_ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.roleButton, selectedRole === role && styles.roleButtonSelected]}
              onPress={() => setSelectedRole(role)}
            >
              <ThemedText style={[styles.roleButtonText, selectedRole === role && styles.roleButtonTextSelected]}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors[colorScheme].textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors[colorScheme].textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors[colorScheme].background} />
          ) : (
            <ThemedText style={styles.buttonText}>
              Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </ThemedText>
          )}
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>Or continue with</ThemedText>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.socialLoginContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => promptAsync()}
            disabled={googleLoading || !request}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors[colorScheme].tint} />
            ) : (
              <Image source={require("../../assets/images/google-logo.png")} style={styles.socialLogo} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <ThemedText style={styles.linkText}>Don't have an account? Sign Up</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}