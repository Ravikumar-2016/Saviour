"use client"

import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  getFirestore,
  collection,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore"
import { getAuth } from "firebase/auth"
import SOSEditModal from "@/components/Modals/SOSEditModal"

const { width } = Dimensions.get("window")
const isTablet = width >= 768

const EMERGENCY_TYPES = [
  "All",
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

const TYPE_ICONS: Record<string, any> = {
  "Medical Emergency": "medical-bag",
  "Fire Outbreak": "fire",
  "Armed Robbery": "pistol",
  "Car Accident": "car-crash",
  "Domestic Violence": "account-group",
  "Natural Disaster": "weather-hurricane",
  "Missing Person": "account-search",
  "Public Disturbance": "account-alert",
  Other: "alert-circle",
}

const LEVEL_COLORS: Record<string, string> = {
  High: "#ef4444",
  Medium: "#fbbf24",
  Low: "#3b82f6",
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type SOSRequest = {
  id: string
  userId: string
  latitude: number
  longitude: number
  emergencyType: string
  description: string
  urgency: "High" | "Medium" | "Low"
  createdAt: Timestamp
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

export default function EmergencyFeedScreen() {
  const colorScheme = useColorScheme() ?? "light"
  const [view, setView] = useState<"list" | "map">(isTablet ? "list" : "list")
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([])
  const [sosImages, setSosImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [selectedSOS, setSelectedSOS] = useState<SOSRequest | null>(null)
  const [editingSOS, setEditingSOS] = useState<SOSRequest | null>(null)
  const [typeFilter, setTypeFilter] = useState("All")
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const mapRef = useRef<MapView>(null)

  // Get current user
  const auth = getAuth()
  const currentUser = auth.currentUser

  // --- Fetch User Location ---
  useEffect(() => {
    ;(async () => {
      const { status } = await import("expo-location").then((m) => m.requestForegroundPermissionsAsync())
      if (status !== "granted") {
        setLoading(false)
        return
      }
      const location = await import("expo-location").then((m) => m.getCurrentPositionAsync({}))
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      setLoading(false)
    })()
  }, [])

  // --- Firestore Listener for SOS Requests ---
  useEffect(() => {
    const db = getFirestore()
    const q = collection(db, "sos_requests")
    const unsub = onSnapshot(q, (snapshot) => {
      const allSOS: SOSRequest[] = []
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        allSOS.push({
          id: docSnap.id,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          emergencyType: data.emergencyType,
          description: data.description,
          urgency: data.urgency,
          createdAt: data.createdAt,
          isPublic: data.isPublic,
          senderName: data.senderName,
          senderContact: data.senderContact,
          status: data.status,
          responderId: data.responderId,
          responderName: data.responderName,
          responderRole: data.responderRole,
          address: data.address,
          imageUrl: data.imageUrl,
        })
      })
      setSosRequests(allSOS)
    })
    return () => unsub()
  }, [])

  // --- Fetch SOS Images ---
  useEffect(() => {
    const db = getFirestore()
    const q = collection(db, "sos_images")
    const unsub = onSnapshot(q, (snapshot) => {
      const images: Record<string, string> = {}
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.sosId && data.imageData) {
          images[data.sosId] = data.imageData
        }
      })
      setSosImages(images)
    })
    return () => unsub()
  }, [])

  // --- Filtering ---
  const filteredSOS = sosRequests.filter((sos) => (typeFilter === "All" ? true : sos.emergencyType === typeFilter))

  // --- Map Region ---
  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : {
        latitude: 28.6139,
        longitude: 77.209,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }

  // --- Marker Press ---
  const handleMarkerPress = (sos: SOSRequest) => {
    setSelectedSOS(sos)
  }

  // --- Check if current user is the SOS creator ---
  const isSOSCreator = (sos: SOSRequest) => {
    return currentUser && currentUser.uid === sos.userId
  }

  // --- Respond Action ---
  const handleRespond = async (sos: SOSRequest) => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "You must be logged in to respond.")
      return
    }

    // Prevent SOS creator from responding to their own SOS
    if (isSOSCreator(sos)) {
      Alert.alert("Action Not Allowed", "You cannot respond to your own SOS request.")
      return
    }

    try {
      const db = getFirestore()
      // Fetch user profile from appropriate collection
      let userDoc = await getDoc(doc(db, "users", currentUser.uid))
      let userData = userDoc.exists() ? userDoc.data() : null
      let responderRole = "user"

      // If not found in users, check employees
      if (!userData) {
        userDoc = await getDoc(doc(db, "employees", currentUser.uid))
        userData = userDoc.exists() ? userDoc.data() : null
        responderRole = "employee"
      }

      // If not found in employees, check admins
      if (!userData) {
        userDoc = await getDoc(doc(db, "admins", currentUser.uid))
        userData = userDoc.exists() ? userDoc.data() : null
        responderRole = "admin"
      }

      const responderName =
        userData?.fullName || userData?.name || currentUser.displayName || currentUser.email || "Unknown"

      // Update SOS with responder info
      await updateDoc(doc(db, "sos_requests", sos.id), {
        status: "responded",
        responderId: currentUser.uid,
        responderName,
        responderRole,
        respondedAt: Timestamp.now(),
      })

      // Add notification
      await addDoc(collection(db, "notifications"), {
        userId: sos.userId,
        sosId: sos.id,
        type: "sos_responded",
        message: `Your SOS has been accepted and responded to. Help is on the way from ${responderName} (${responderRole}).`,
        responderId: currentUser.uid,
        responderName,
        responderRole,
        createdAt: Timestamp.now(),
        read: false,
      })

      Alert.alert("Response Sent", "You have successfully responded to this SOS request.")
      setSelectedSOS(null)
    } catch (e: any) {
      Alert.alert("Error", "Failed to respond to SOS. " + (e?.message || ""))
    }
  }

  // --- Update SOS ---
  const handleUpdateSOS = (sos: SOSRequest) => {
    if (!isSOSCreator(sos)) {
      Alert.alert("Permission Denied", "You can only update your own SOS requests.")
      return
    }
    setSelectedSOS(null)
    setEditingSOS(sos)
  }

  // --- Delete SOS ---
  const handleDeleteSOS = async (sos: SOSRequest) => {
    if (!isSOSCreator(sos)) {
      Alert.alert("Permission Denied", "You can only delete your own SOS requests.")
      return
    }

    Alert.alert("Delete SOS", "Are you sure you want to delete this SOS request? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const db = getFirestore()
            await deleteDoc(doc(db, "sos_requests", sos.id))

            // Also delete associated image if exists
            if (sosImages[sos.id]) {
              const imageQuery = collection(db, "sos_images")
              const imageSnapshot = await getDoc(doc(imageQuery, sos.id))
              if (imageSnapshot.exists()) {
                await deleteDoc(doc(db, "sos_images", sos.id))
              }
            }

            Alert.alert("Success", "SOS request deleted successfully.")
            setSelectedSOS(null)
          } catch (e: any) {
            Alert.alert("Error", "Failed to delete SOS. " + (e?.message || ""))
          }
        },
      },
    ])
  }

  // --- Show Image Modal ---
  const showImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageModalVisible(true)
  }

  // --- Handle SOS Update Complete ---
  const handleSOSUpdateComplete = () => {
    setEditingSOS(null)
    // The real-time listener will automatically update the list
  }

  // --- UI ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Live Monitor</Text>
        <View style={styles.headerTabs}>
          <TouchableOpacity
            style={[styles.tabBtn, view === "list" && styles.tabBtnActive]}
            onPress={() => setView("list")}
          >
            <Ionicons name="list" size={20} color={view === "list" ? "#2563eb" : "#888"} />
            <Text style={[styles.tabBtnText, view === "list" && styles.tabBtnTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, view === "map" && styles.tabBtnActive]}
            onPress={() => setView("map")}
          >
            <Ionicons name="map" size={20} color={view === "map" ? "#2563eb" : "#888"} />
            <Text style={[styles.tabBtnText, view === "map" && styles.tabBtnTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters with vertical text */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {EMERGENCY_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, typeFilter === type && styles.filterChipActive]}
            onPress={() => setTypeFilter(type)}
          >
            <Text
              style={[styles.verticalRotatedText, { color: typeFilter === type ? "#fff" : "#222" }]}
              numberOfLines={1}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List View */}
      {view === "list" && (
        <FlatList
          data={filteredSOS.sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.())}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.emergencyCard, { borderLeftColor: LEVEL_COLORS[item.urgency] || "#2563eb" }]}
              onPress={() => handleMarkerPress(item)}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialCommunityIcons
                  name={TYPE_ICONS[item.emergencyType] || "alert-circle"}
                  size={22}
                  color={LEVEL_COLORS[item.urgency] || "#2563eb"}
                />
                <Text style={styles.emergencyType}>{item.emergencyType}</Text>
                <Text style={[styles.levelTag, { color: LEVEL_COLORS[item.urgency] || "#2563eb" }]}>
                  {item.urgency}
                </Text>
                <Text style={styles.statusTag}>{item.status || "Open"}</Text>
              </View>
              <Text style={styles.emergencyUser}>
                <Ionicons name="person" size={14} color="#888" /> {item.senderName || "Unknown"}
                {isSOSCreator(item) && <Text style={styles.yourSOSTag}> (Your SOS)</Text>}
              </Text>
              {item.address && (
                <Text style={styles.emergencyAddress}>
                  <Ionicons name="location" size={14} color="#3b82f6" /> {item.address}
                </Text>
              )}
              <Text style={styles.emergencyDesc}>{item.description}</Text>
              <Text style={styles.emergencyTime}>
                <Ionicons name="time" size={14} color="#888" />{" "}
                {item.createdAt?.toDate ? timeAgo(item.createdAt.toDate()) : ""}
              </Text>

              {/* Image Preview */}
              {(sosImages[item.id] || item.imageUrl) && (
                <TouchableOpacity
                  style={styles.imagePreviewContainer}
                  onPress={() => showImageModal(sosImages[item.id] || item.imageUrl!)}
                >
                  <Image
                    source={{ uri: sosImages[item.id] || item.imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Controls */}
              <View style={styles.actionRow}>
                {isSOSCreator(item) ? (
                  // Show Update/Delete for SOS creator
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#3b82f622" }]}
                      onPress={() => handleUpdateSOS(item)}
                    >
                      <Ionicons name="create" size={18} color="#3b82f6" />
                      <Text style={[styles.actionText, { color: "#3b82f6" }]}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#ef444422" }]}
                      onPress={() => handleDeleteSOS(item)}
                    >
                      <Ionicons name="trash" size={18} color="#ef4444" />
                      <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Show Respond for others (if not already responded)
                  (!item.responderId || item.status !== "responded") && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: "#22c55e22" }]}
                      onPress={() => handleRespond(item)}
                    >
                      <Ionicons name="checkmark" size={18} color="#22c55e" />
                      <Text style={[styles.actionText, { color: "#22c55e" }]}>Accept & Respond</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {item.responderId && item.status === "responded" && (
                <Text style={{ color: "#22c55e", fontWeight: "bold", marginTop: 6 }}>
                  Responded by {item.responderName || "Employee"}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#888", textAlign: "center", marginTop: 40 }}>No emergencies found.</Text>
          }
        />
      )}

      {/* Map View */}
      {view === "map" && (
        <View style={styles.mapContainer}>
          {loading || !userLocation ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
              <Text>Loading map...</Text>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={{ flex: 1, borderRadius: 16 }}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton
            >
              {filteredSOS.map((item) => (
                <Marker
                  key={item.id}
                  coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                  pinColor={LEVEL_COLORS[item.urgency]}
                  onPress={() => handleMarkerPress(item)}
                >
                  <View style={[styles.markerPin, { backgroundColor: LEVEL_COLORS[item.urgency] || "#2563eb" }]}>
                    <MaterialCommunityIcons
                      name={TYPE_ICONS[item.emergencyType] || "alert-circle"}
                      size={22}
                      color="#fff"
                    />
                    {(sosImages[item.id] || item.imageUrl) && (
                      <View style={styles.markerImageIndicator}>
                        <Ionicons name="image" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      )}

      {/* Emergency Detail Modal */}
      <Modal visible={!!selectedSOS} transparent animationType="slide" onRequestClose={() => setSelectedSOS(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setSelectedSOS(null)}
              style={{ position: "absolute", right: 10, top: 10, zIndex: 10 }}
            >
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
            {selectedSOS && (
              <>
                <Text style={styles.modalTitle}>{selectedSOS.emergencyType}</Text>
                <Text style={styles.modalLevel}>
                  <Text style={{ color: LEVEL_COLORS[selectedSOS.urgency], fontWeight: "bold" }}>
                    {selectedSOS.urgency}
                  </Text>{" "}
                  · {selectedSOS.status || "Open"}
                </Text>
                <Text style={styles.modalUser}>
                  <Ionicons name="person" size={16} color="#888" /> {selectedSOS.senderName || "Unknown"}
                  {isSOSCreator(selectedSOS) && <Text style={styles.yourSOSTag}> (Your SOS)</Text>}
                </Text>
                {selectedSOS.address && (
                  <Text style={styles.modalAddress}>
                    <Ionicons name="location" size={16} color="#3b82f6" /> {selectedSOS.address}
                  </Text>
                )}
                <Text style={styles.modalDesc}>{selectedSOS.description}</Text>
                <Text style={styles.modalTime}>
                  <Ionicons name="time" size={16} color="#888" />{" "}
                  {selectedSOS.createdAt?.toDate ? timeAgo(selectedSOS.createdAt.toDate()) : ""}
                </Text>

                {/* Image in Modal */}
                {(sosImages[selectedSOS.id] || selectedSOS.imageUrl) && (
                  <TouchableOpacity
                    style={styles.modalImageContainer}
                    onPress={() => showImageModal(sosImages[selectedSOS.id] || selectedSOS.imageUrl!)}
                  >
                    <Image
                      source={{ uri: sosImages[selectedSOS.id] || selectedSOS.imageUrl }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="expand" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                )}

                {/* Action Buttons */}
                <View style={styles.modalActionRow}>
                  {isSOSCreator(selectedSOS) ? (
                    // Show Update/Delete for SOS creator
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#3b82f622", marginTop: 18 }]}
                        onPress={() => handleUpdateSOS(selectedSOS)}
                      >
                        <Ionicons name="create" size={18} color="#3b82f6" />
                        <Text style={[styles.actionText, { color: "#3b82f6" }]}>Update</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#ef444422", marginTop: 18 }]}
                        onPress={() => handleDeleteSOS(selectedSOS)}
                      >
                        <Ionicons name="trash" size={18} color="#ef4444" />
                        <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Show Respond for others (if not already responded)
                    (!selectedSOS.responderId || selectedSOS.status !== "responded") && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: "#22c55e22", marginTop: 18 }]}
                        onPress={() => handleRespond(selectedSOS)}
                      >
                        <Ionicons name="checkmark" size={18} color="#22c55e" />
                        <Text style={[styles.actionText, { color: "#22c55e" }]}>Accept & Respond</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                {selectedSOS.responderId && selectedSOS.status === "responded" && (
                  <Text style={{ color: "#22c55e", fontWeight: "bold", marginTop: 18 }}>
                    Responded by {selectedSOS.responderName || "Employee"}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* SOS Edit Modal */}
      <SOSEditModal
        visible={!!editingSOS}
        sosRequest={editingSOS}
        onClose={() => setEditingSOS(null)}
        onUpdate={handleSOSUpdateComplete}
      />

      {/* Image Full Screen Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity style={styles.imageModalCloseButton} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  verticalRotatedText: {
    transform: [{ rotate: "-90deg" }],
    fontSize: 13,
    lineHeight: 15,
    textAlign: "center",
    minWidth: 30,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  headerTabs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginLeft: 8,
  },
  tabBtnActive: {
    backgroundColor: "#dbeafe",
  },
  tabBtnText: {
    marginLeft: 4,
    color: "#888",
    fontWeight: "bold",
  },
  tabBtnTextActive: {
    color: "#2563eb",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
  },
  emergencyCard: {
    borderRadius: 14,
    borderLeftWidth: 6,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  emergencyType: {
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
    marginRight: 8,
    color: "#222",
  },
  levelTag: {
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 8,
  },
  statusTag: {
    backgroundColor: "#f1f5f9",
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  emergencyUser: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  yourSOSTag: {
    color: "#7C3AED",
    fontWeight: "bold",
  },
  emergencyAddress: {
    color: "#3b82f6",
    fontSize: 13,
    marginTop: 2,
  },
  emergencyDesc: {
    color: "#222",
    fontSize: 13,
    marginTop: 2,
  },
  emergencyTime: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: "relative",
    alignSelf: "flex-start",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  actionText: {
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 320,
    backgroundColor: "#eee",
  },
  markerPin: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 2,
    position: "relative",
  },
  markerImageIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: isTablet ? 420 : "90%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    elevation: 6,
    alignItems: "flex-start",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 6,
  },
  modalLevel: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalUser: {
    color: "#888",
    fontSize: 15,
    marginBottom: 2,
  },
  modalAddress: {
    color: "#3b82f6",
    fontSize: 15,
    marginBottom: 2,
  },
  modalDesc: {
    color: "#222",
    fontSize: 15,
    marginBottom: 2,
  },
  modalTime: {
    color: "#888",
    fontSize: 15,
    marginBottom: 12,
  },
  modalImageContainer: {
    marginTop: 12,
    position: "relative",
    alignSelf: "center",
  },
  modalImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullScreenImage: {
    width: "90%",
    height: "70%",
  },
})
