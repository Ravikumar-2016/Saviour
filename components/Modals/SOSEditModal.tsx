"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  useColorScheme as rnUseColorScheme,
} from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { doc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"

type EmergencyType =
  | "Medical Emergency"
  | "Fire Outbreak"
  | "Armed Robbery"
  | "Car Accident"
  | "Domestic Violence"
  | "Natural Disaster"
  | "Missing Person"
  | "Public Disturbance"
  | "Other"

type AlertLevel = "Low" | "Medium" | "High"

type SOSRequest = {
  id: string
  userId: string
  latitude: number
  longitude: number
  emergencyType: string
  description: string
  urgency: "High" | "Medium" | "Low"
  createdAt: any
  isPublic: boolean
  senderName?: string
  senderContact?: string
  status?: string
  responderId?: string
  responderName?: string
  responderRole?: string
  address?: string
  imageUrl?: string
}

interface SOSEditModalProps {
  visible: boolean
  sosRequest: SOSRequest | null
  onClose: () => void
  onUpdate: () => void
}

const emergencyTypes: EmergencyType[] = [
  "Medical Emergency",
  "Fire Outbreak",
  "Armed Robbery",
  "Car Accident",
  "Domestic Violence",
  "Natural Disaster",
  "Missing Person",
  "Public Disturbance",
  "Other",
]

const alertLevels: AlertLevel[] = ["Low", "Medium", "High"]

const getIconForType = (type: EmergencyType) => {
  switch (type) {
    case "Medical Emergency":
      return "medical-bag"
    case "Fire Outbreak":
      return "fire"
    case "Armed Robbery":
      return "pistol"
    case "Car Accident":
      return "car"
    case "Domestic Violence":
      return "account-group"
    case "Natural Disaster":
      return "weather-hurricane"
    case "Missing Person":
      return "account-search"
    case "Public Disturbance":
      return "account-alert"
    default:
      return "alert-circle"
  }
}

export default function SOSEditModal({ visible, sosRequest, onClose, onUpdate }: SOSEditModalProps) {
  const colorScheme = rnUseColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  const [emergencyType, setEmergencyType] = useState<EmergencyType>("Medical Emergency")
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("High")
  const [description, setDescription] = useState("")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Initialize form with SOS data
  useEffect(() => {
    if (sosRequest) {
      setEmergencyType(sosRequest.emergencyType as EmergencyType)
      setAlertLevel(sosRequest.urgency)
      setDescription(sosRequest.description)
      setOriginalImageUrl(sosRequest.imageUrl || null)
      setImageUri(sosRequest.imageUrl || null)
    }
  }, [sosRequest])

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setImageUri(null)
      setOriginalImageUrl(null)
      setUploadProgress(0)
    }
  }, [visible])

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permissions are required.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      allowsMultipleSelection: false,
    })

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 500 * 1024) {
        Alert.alert("File Too Large", "Please select an image smaller than 500KB for better performance.")
        return
      }
      setImageUri(uri)
    }
  }

  const uploadImageAsBase64 = async (uri: string): Promise<string> => {
    if (!sosRequest) throw new Error("No SOS request data")
    try {
      setUploadProgress(25)
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      setUploadProgress(50)
      if (base64String.length > 1000000) {
        throw new Error("Image too large for direct storage. Please select a smaller image.")
      }
      const dataUrl = `data:image/jpeg;base64,${base64String}`
      setUploadProgress(75)
      await addDoc(collection(db, "sos_images"), {
        userId: sosRequest.userId,
        sosId: sosRequest.id,
        imageData: dataUrl,
        uploadedAt: new Date().toISOString(),
        contentType: "image/jpeg",
        purpose: "sos_request_update",
      })
      setUploadProgress(100)
      return dataUrl
    } catch (error) {
      throw error
    }
  }

  const handleUpdate = async () => {
    if (!sosRequest) return
    if (!emergencyType) {
      Alert.alert("Missing Information", "Please select an emergency type.")
      return
    }
    if (!description.trim()) {
      Alert.alert("Missing Information", "Please provide a description.")
      return
    }
    setIsUpdating(true)
    try {
      let finalImageUrl = originalImageUrl
      if (imageUri && imageUri !== originalImageUrl) {
        setImageUploading(true)
        setUploadProgress(0)
        try {
          finalImageUrl = await uploadImageAsBase64(imageUri)
        } catch (error: any) {
          Alert.alert("Image Upload Error", error.message || "Failed to upload image. Continuing without image update.")
          finalImageUrl = originalImageUrl
        } finally {
          setImageUploading(false)
          setUploadProgress(0)
        }
      }
      await updateDoc(doc(db, "sos_requests", sosRequest.id), {
        emergencyType,
        alertLevel: alertLevel,
        urgency: alertLevel,
        description: description.trim(),
        imageUrl: finalImageUrl,
        updatedAt: Timestamp.now(),
        lastModified: new Date().toISOString(),
      })
      Alert.alert("Success", "SOS request updated successfully.")
      onUpdate()
      onClose()
    } catch (error: any) {
      Alert.alert("Update Error", error.message || "Failed to update SOS request.")
    } finally {
      setIsUpdating(false)
    }
  }

  const removeImage = () => setImageUri(null)

  if (!sosRequest) return null

  // Themed styles
  const themed = getThemedStyles(isDark)

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={themed.container}>
        <View style={themed.header}>
          <TouchableOpacity onPress={onClose} style={themed.closeButton}>
            <Ionicons name="close" size={24} color={isDark ? "#aaa" : "#666"} />
          </TouchableOpacity>
          <Text style={themed.headerTitle}>Edit SOS Request</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={themed.content} showsVerticalScrollIndicator={false}>
          {/* Emergency Type Selection */}
          <Text style={themed.sectionTitle}>Emergency Type</Text>
          <View style={themed.typeGrid}>
            {emergencyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  themed.typeButton,
                  emergencyType === type && themed.typeButtonActive,
                ]}
                onPress={() => setEmergencyType(type)}
              >
                <MaterialCommunityIcons
                  name={getIconForType(type)}
                  size={20}
                  color={emergencyType === type ? "#fff" : isDark ? "#bbb" : "#666"}
                />
                <Text style={[
                  themed.typeButtonText,
                  emergencyType === type && themed.typeButtonTextActive,
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alert Level Selection */}
          <Text style={themed.sectionTitle}>Alert Level</Text>
          <View style={themed.levelRow}>
            {alertLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  themed.levelButton,
                  alertLevel === level && themed.levelButtonActive,
                  alertLevel === level && level === "Low" && themed.lowLevel,
                  alertLevel === level && level === "Medium" && themed.mediumLevel,
                  alertLevel === level && level === "High" && themed.highLevel,
                ]}
                onPress={() => setAlertLevel(level)}
              >
                <Text style={[
                  themed.levelButtonText,
                  alertLevel === level && themed.levelButtonTextActive,
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={themed.sectionTitle}>Description</Text>
          <TextInput
            style={themed.descriptionInput}
            placeholder="Describe the emergency situation..."
            placeholderTextColor={isDark ? "#888" : "#999"}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Image Section */}
          <Text style={themed.sectionTitle}>Image (Optional)</Text>
          <TouchableOpacity style={themed.imagePickerButton} onPress={handlePickImage} disabled={imageUploading}>
            <Ionicons name="camera" size={24} color="#7C3AED" />
            <Text style={themed.imagePickerText}>
              {imageUploading ? "Uploading..." : imageUri ? "Change Image" : "Add Image"}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={themed.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={themed.imagePreview} resizeMode="cover" />

              {imageUploading && (
                <View style={themed.uploadOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                  {uploadProgress > 0 && <Text style={themed.progressText}>{Math.round(uploadProgress)}%</Text>}
                </View>
              )}

              {!imageUploading && (
                <TouchableOpacity onPress={removeImage} style={themed.removeImageButton}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Location Info (Read-only) */}
          <Text style={themed.sectionTitle}>Location (Cannot be changed)</Text>
          <View style={themed.locationContainer}>
            <Ionicons name="location" size={20} color="#3b82f6" />
            <Text style={themed.locationText}>
              Lat: {sosRequest.latitude.toFixed(6)}, Lon: {sosRequest.longitude.toFixed(6)}
            </Text>
          </View>
        </ScrollView>

        {/* Update Button */}
        <View style={themed.footer}>
          <TouchableOpacity
            style={[themed.updateButton, (isUpdating || imageUploading) && themed.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={isUpdating || imageUploading}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={themed.updateButtonText}>Update SOS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// Themed styles for light/dark mode
function getThemedStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#18181b" : "#f8f9fa",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#27272a" : "#e5e7eb",
    },
    closeButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#f3f4f6" : "#1f2937",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#e5e7eb" : "#374151",
      marginBottom: 12,
      marginTop: 20,
    },
    typeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    typeButton: {
      width: "30%",
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 2,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
    typeButtonActive: {
      backgroundColor: "#7C3AED",
      borderColor: "#7C3AED",
    },
    typeButtonText: {
      fontSize: 11,
      color: isDark ? "#bbb" : "#666",
      textAlign: "center",
      marginTop: 4,
      fontWeight: "500",
    },
    typeButtonTextActive: {
      color: "#fff",
    },
    levelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    levelButton: {
      flex: 1,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 4,
      borderWidth: 2,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
    levelButtonActive: {
      borderWidth: 2,
    },
    lowLevel: {
      backgroundColor: "#10b981",
      borderColor: "#10b981",
    },
    mediumLevel: {
      backgroundColor: "#f59e0b",
      borderColor: "#f59e0b",
    },
    highLevel: {
      backgroundColor: "#ef4444",
      borderColor: "#ef4444",
    },
    levelButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#bbb" : "#666",
    },
    levelButtonTextActive: {
      color: "#fff",
    },
    descriptionInput: {
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: isDark ? "#f3f4f6" : "#1f2937",
      minHeight: 100,
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      textAlignVertical: "top",
    },
    imagePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      borderStyle: "dashed",
    },
    imagePickerText: {
      marginLeft: 8,
      fontSize: 16,
      color: "#7C3AED",
      fontWeight: "500",
    },
    imagePreviewContainer: {
      marginTop: 12,
      alignItems: "center",
      position: "relative",
    },
    imagePreview: {
      width: 200,
      height: 150,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
    uploadOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    progressText: {
      color: "#fff",
      marginTop: 8,
      fontWeight: "bold",
    },
    removeImageButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      padding: 2,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#23232a" : "#f3f4f6",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
    locationText: {
      marginLeft: 8,
      fontSize: 14,
      color: isDark ? "#bbb" : "#6b7280",
      flex: 1,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderTopWidth: 1,
      borderTopColor: isDark ? "#27272a" : "#e5e7eb",
    },
    updateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#7C3AED",
      borderRadius: 12,
      padding: 16,
    },
    updateButtonDisabled: {
      opacity: 0.7,
    },
    updateButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
  })
}