"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  type GestureResponderEvent,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import * as Location from "expo-location"
import {
  getAuth,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"

// ModalInput component for password prompts
type ModalInputProps = {
  visible: boolean
  title: string
  placeholder: string
  secureTextEntry?: boolean
  onCancel: () => void
  onSubmit: (value: string) => void
  theme: "light" | "dark"
}

const ModalInput: React.FC<ModalInputProps> = ({
  visible,
  title,
  placeholder,
  secureTextEntry,
  onCancel,
  onSubmit,
  theme,
}) => {
  const [value, setValue] = useState("")

  useEffect(() => {
    if (visible) setValue("")
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: Colors[theme].background,
            padding: 24,
            borderRadius: 12,
            width: "85%",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>{title}</ThemedText>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: Colors[theme].border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              width: "100%",
              marginBottom: 18,
              color: Colors[theme].text,
              backgroundColor: Colors[theme].inputBackground,
            }}
            placeholder={placeholder}
            placeholderTextColor={Colors[theme].textMuted}
            secureTextEntry={secureTextEntry}
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
            <Pressable
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginRight: 10,
                borderRadius: 6,
                backgroundColor: Colors[theme].border,
              }}
              onPress={onCancel}
            >
              <ThemedText style={{ color: Colors[theme].text }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 6,
                backgroundColor: Colors[theme].tint,
              }}
              onPress={() => {
                if (value.trim()) onSubmit(value)
              }}
            >
              <ThemedText style={{ color: Colors[theme].background, fontWeight: "bold" }}>Submit</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default function AdminProfileScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const theme = colorScheme
  const s = styles(theme)
  const router = useRouter()
  const auth = getAuth()

  // Animation values
  const profileImageScale = useState(new Animated.Value(1))[0]

  // Auth state
  const [user, setUser] = useState<User | null>(auth.currentUser)

  // Current city state
  const [currentCity, setCurrentCity] = useState<string | null>(null)
  const [cityLoading, setCityLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        router.replace("/(auth)/login")
      }
    })
    return unsubscribe
  }, [])

  // Profile state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Modal state
  const [modal, setModal] = useState<null | "changePasswordOld" | "changePasswordNew">(null)
  const [modalCallback, setModalCallback] = useState<(value: string) => void>(() => () => {})

  // Fetch admin profile
  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const userDoc = await getDoc(doc(db, "admins", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data() || {}
          setName(data.displayName || data.name || "")
          setContact(data.contact || "")
          setEmail(data.email || user.email || "")
          setCity(data.city || "")

          // Handle different photo storage methods
          if (data.photoDataUrl) {
            // Direct base64 data URL
            setPhoto(data.photoDataUrl)
          } else if (data.photoUrl && data.photoUrl.startsWith("firestore://")) {
            // Firestore reference - retrieve the actual image
            const imageData = await getImageFromFirestore(data.photoUrl)
            setPhoto(imageData)
          } else if (data.photoUrl) {
            // Regular URL (Firebase Storage or other)
            setPhoto(data.photoUrl)
          }
        }
      } catch (e) {
        console.log("Fetch profile error:", e)
        Alert.alert("Error", "Failed to fetch admin profile.")
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  // Fetch current city
  useEffect(() => {
    const fetchCurrentCity = async () => {
      setCityLoading(true)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          setCurrentCity(null)
          setCityLoading(false)
          return
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })

        const geo = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        if (geo && geo[0] && geo[0].city) {
          setCurrentCity(geo[0].city)
          
          // Update city field if it's empty
          if (!city) {
            setCity(geo[0].city)
          }
        }
        else setCurrentCity(null)
      } catch (error) {
        console.error("Error getting location:", error)
        setCurrentCity(null)
      }
      setCityLoading(false)
    }

    fetchCurrentCity()
  }, [])

  // Save profile changes
  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "admins", user.uid), {
        displayName: name,
        contact,
        city,
        photoUrl: photo,
        updatedAt: new Date().toISOString(),
      })
      Alert.alert("Profile Updated", "Your profile has been updated.")
    } catch (e) {
      console.log("Profile update error:", e)
      Alert.alert("Error", "Failed to update profile.")
    }
    setSaving(false)
  }

  // Function to retrieve base64 image from Firestore
  const getImageFromFirestore = async (firestoreUrl: string): Promise<string> => {
    try {
      const docId = firestoreUrl.replace("firestore://profile_images/", "")
      const imageDoc = await getDoc(doc(db, "profile_images", docId))

      if (imageDoc.exists()) {
        const data = imageDoc.data()
        return data.imageData || ""
      }
      return ""
    } catch (error) {
      console.error("Error retrieving image from Firestore:", error)
      return ""
    }
  }

  // Store image as base64 in Firestore (for smaller images)
  const uploadImageAsBase64 = async (uri: string): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    try {
      console.log("Starting base64 storage method...")
      setUploadProgress(25)

      // Read file as base64
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      console.log("Base64 string length:", base64String.length)
      setUploadProgress(50)

      // Check if image is too large for Firestore (1MB limit for document field)
      if (base64String.length > 1000000) {
        throw new Error("Image too large for direct storage. Please select a smaller image.")
      }

      // Create data URL
      const dataUrl = `data:image/jpeg;base64,${base64String}`
      setUploadProgress(75)

      // Store in Firestore as a separate document for images
      const imageDoc = await addDoc(collection(db, "profile_images"), {
        userId: user.uid,
        imageData: dataUrl,
        uploadedAt: new Date().toISOString(),
        contentType: "image/jpeg",
      })

      console.log("Image stored in Firestore with ID:", imageDoc.id)
      setUploadProgress(100)

      // Return a reference URL that we can use to retrieve the image
      return `firestore://profile_images/${imageDoc.id}`
    } catch (error) {
      console.error("Base64 storage failed:", error)
      throw error
    }
  }

  // Main image upload handler
  const handleImageUpload = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to your photos")
        return
      }

      // Launch image picker with smaller quality and size
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Reduced quality for smaller file size
        allowsMultipleSelection: false,
      })

      if (result.canceled || !result.assets?.[0]?.uri) return

      const uri = result.assets[0].uri
      console.log("Selected image URI:", uri)

      // Check file size
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 500 * 1024) {
        Alert.alert("File Too Large", "Please select an image smaller than 500KB for better performance.")
        return
      }

      setPhotoUploading(true)
      setUploadProgress(0)

      // Animation
      Animated.sequence([
        Animated.timing(profileImageScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(profileImageScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      // Upload using base64 storage method
      const imageUrl = await uploadImageAsBase64(uri)

      // Get the actual base64 data URL for immediate display
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      const dataUrl = `data:image/jpeg;base64,${base64String}`

      setPhoto(dataUrl) // Set for immediate display

      // Update Firestore with reference
      await updateDoc(doc(db, "admins", user!.uid), {
        photoUrl: imageUrl, // Store the Firestore reference
        photoDataUrl: dataUrl, // Store the actual data URL for quick access
        updatedAt: new Date().toISOString(),
      })

      Alert.alert("Success", "Profile photo updated successfully!")
    } catch (error: any) {
      console.error("Upload error:", error)
      Alert.alert("Upload Error", error.message || "Failed to upload image. Please try again.")
    } finally {
      setPhotoUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleChangePassword(event: GestureResponderEvent): Promise<void> {
    if (!user) return
    setModal("changePasswordOld")
    setModalCallback(() => async (currentPassword: string) => {
      setModal(null)
      try {
        // Re-authenticate
        const credential = EmailAuthProvider.credential(user.email || "", currentPassword)
        await reauthenticateWithCredential(user, credential)
        // Prompt for new password
        setModal("changePasswordNew")
        setModalCallback(() => async (newPassword: string) => {
          setModal(null)
          try {
            await updatePassword(user, newPassword)
            Alert.alert("Success", "Password changed successfully.")
          } catch (e: any) {
            console.error(e)
            Alert.alert("Error", e.message || "Failed to change password.")
          }
        })
      } catch (e: any) {
        console.error(e)
        Alert.alert("Error", e.message || "Current password is incorrect.")
      }
    })
  }

  function handleLogout(event: GestureResponderEvent): void {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth)
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Logout error:", error)
            Alert.alert("Error", "Failed to logout. Please try again.")
          }
        },
      },
    ])
  }

  if (!user || loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={s.container}>
          <ThemedText style={s.headerTitle}>Admin Profile</ThemedText>

          {/* Current City */}
          <View style={s.cityContainer}>
            <Ionicons name="location" size={18} color={Colors[theme].tint} style={{ marginRight: 6 }} />
            <ThemedText style={s.cityText}>
              {cityLoading ? "Detecting your current location..." : currentCity ? `Current location: ${currentCity}` : "Location not available"}
            </ThemedText>
          </View>

          {/* Profile Photo with Upload Progress */}
          <Animated.View style={{ transform: [{ scale: profileImageScale }] }}>
            <TouchableOpacity
              style={s.photoContainer}
              onPress={handleImageUpload}
              activeOpacity={0.7}
              disabled={photoUploading}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={s.photo} resizeMode="cover" />
              ) : (
                <View style={s.photoPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors[theme].textMuted} />
                  <ThemedText style={s.photoEditText}>Edit</ThemedText>
                </View>
              )}

              {photoUploading && (
                <View style={s.uploadOverlay}>
                  <ActivityIndicator size="small" color={Colors[theme].background} />
                  {uploadProgress > 0 && <ThemedText style={s.progressText}>{Math.round(uploadProgress)}%</ThemedText>}
                </View>
              )}

              {!photoUploading && (
                <View style={s.photoEditBadge}>
                  <Ionicons name="camera" size={16} color={Colors[theme].background} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Save Button */}
          <TouchableOpacity
            style={[s.saveButton, saving && s.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Ionicons name="save" size={20} color={Colors[theme].background} style={{ marginRight: 8 }} />
            <ThemedText style={s.saveButtonText}>{saving ? "Saving..." : "Save Changes"}</ThemedText>
          </TouchableOpacity>

          {/* Profile Fields */}
          <View style={s.section}>
            <ThemedText style={s.sectionTitle}>Admin Information</ThemedText>
            <View style={s.inputGroup}>
              <ThemedText style={s.label}>Full Name</ThemedText>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Admin name"
                placeholderTextColor={Colors[theme].textMuted}
              />
            </View>
            <View style={s.inputGroup}>
              <ThemedText style={s.label}>Contact Number</ThemedText>
              <TextInput
                style={s.input}
                value={contact}
                onChangeText={setContact}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={Colors[theme].textMuted}
              />
            </View>
            <View style={s.inputGroup}>
              <ThemedText style={s.label}>City</ThemedText>
              <TextInput
                style={s.input}
                value={city}
                onChangeText={setCity}
                placeholder="Your city"
                placeholderTextColor={Colors[theme].textMuted}
              />
            </View>
            <View style={s.inputGroup}>
              <ThemedText style={s.label}>Email</ThemedText>
              <TextInput
                style={[s.input, { backgroundColor: Colors[theme].inputBackground }]}
                value={email}
                editable={false}
                selectTextOnFocus={false}
                placeholderTextColor={Colors[theme].textMuted}
              />
            </View>
          </View>

          {/* Security Section */}
          <View style={s.section}>
            <ThemedText style={s.sectionTitle}>Security</ThemedText>
            <TouchableOpacity style={s.securityButton} onPress={handleChangePassword} activeOpacity={0.7}>
              <Ionicons name="key" size={20} color={Colors[theme].tint} style={{ marginRight: 12 }} />
              <ThemedText style={s.securityButtonText}>Change Password</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={s.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out" size={20} color="#EF5350" style={{ marginRight: 8 }} />
            <ThemedText style={s.logoutButtonText}>Log Out</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Modals */}
        <ModalInput
          visible={modal === "changePasswordOld"}
          title="Enter Current Password"
          placeholder="Current Password"
          secureTextEntry
          onCancel={() => setModal(null)}
          onSubmit={modalCallback}
          theme={theme}
        />
        <ModalInput
          visible={modal === "changePasswordNew"}
          title="Enter New Password"
          placeholder="New Password"
          secureTextEntry
          onCancel={() => setModal(null)}
          onSubmit={modalCallback}
          theme={theme}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 30,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[theme].tint,
      marginBottom: 18,
      textAlign: "center",
    },
    photoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme === "dark" ? Colors.dark.card : Colors.light.inputBackground,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 3,
      borderColor: Colors[theme].tint + "33",
      overflow: "hidden",
      position: "relative",
    },
    photo: {
      width: "100%",
      height: "100%",
    },
    photoPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    photoEditText: {
      fontSize: 14,
      color: Colors[theme].tint,
      marginTop: 6,
      fontWeight: "500",
    },
    photoEditBadge: {
      position: "absolute",
      bottom: 8,
      right: 8,
      backgroundColor: Colors[theme].tint,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    uploadOverlay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      color: Colors[theme].background,
      marginTop: 8,
      fontWeight: "bold",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[theme].tint,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 24,
      alignSelf: "center",
      shadowColor: Colors[theme].tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: Colors[theme].background,
      fontWeight: "600",
      fontSize: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      color: Colors[theme].tint,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 6,
      color: Colors[theme].text,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[theme].border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: Colors[theme].text,
      backgroundColor: theme === "dark" ? Colors.dark.card : Colors.light.inputBackground,
    },
    securityButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: theme === "dark" ? Colors.dark.card : Colors.light.inputBackground,
      marginBottom: 10,
    },
    securityButtonText: {
      fontSize: 15,
      fontWeight: "500",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 10,
      backgroundColor: theme === "dark" ? "#2D1C1C" : "#FFEBEE",
      marginTop: 16,
    },
    logoutButtonText: {
      color: "#EF5350",
      fontWeight: "600",
      fontSize: 16,
    },
    cityContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 20,
      backgroundColor: theme === "dark" ? Colors.dark.card : Colors.light.inputBackground,
      marginBottom: 24,
      alignSelf: "center",
    },
    cityText: {
      fontSize: 15,
      fontWeight: "500",
      color: Colors[theme].tint,
    },
  })
