"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useColorScheme } from "@/hooks/useColorScheme"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore"

const modernTheme = {
  light: {
    background: "#f8fafc",
    cardBackground: "#ffffff",
    primary: "#3b82f6",
    primaryLight: "#dbeafe",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    inputBackground: "#f1f5f9",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    shadow: "rgba(0,0,0,0.1)",
    overlay: "rgba(0,0,0,0.5)",
  },
  dark: {
    background: "#0f172a",
    cardBackground: "#1e293b",
    primary: "#60a5fa",
    primaryLight: "#1e3a8a",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    inputBackground: "#334155",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    shadow: "rgba(0,0,0,0.3)",
    overlay: "rgba(0,0,0,0.7)",
  },
}

type ResourceRequest = {
  id: string
  resourceId: string
  resourceName: string
  quantity: number
  userId: string
  userName: string
  userPhone?: string
  userEmail?: string
  status: "pending" | "approved" | "rejected" | "fulfilled"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: any
  processedAt?: any
  processedBy?: string
  city: string
  category: string
  urgencyNote?: string
  deliveryAddress?: string
  contactNumber: string
}

const RequestsScreen = () => {
  const colorScheme = useColorScheme() ?? "light"
  const colors = modernTheme[colorScheme]
  const currentUser = auth.currentUser

  const [requests, setRequests] = useState<ResourceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null)
  const [processing, setProcessing] = useState(false)
  const [requestFilter, setRequestFilter] = useState("pending")
  const [employeeCity, setEmployeeCity] = useState<string>("")
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const snackbarAnim = useRef(new Animated.Value(0)).current
  const modalAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (snackbarVisible) {
      Animated.sequence([
        Animated.timing(snackbarAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(snackbarAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setSnackbarVisible(false))
    }
  }, [snackbarVisible])

  useEffect(() => {
    Animated.timing(modalAnim, {
      toValue: requestModalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [requestModalVisible])

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message)
    setSnackbarVisible(true)
  }

  useEffect(() => {
    const fetchEmployeeCity = async () => {
      if (!currentUser) return
      try {
        const employeeDoc = await import("firebase/firestore").then(({ doc, getDoc }) =>
          getDoc(doc(db, "employees", currentUser.uid))
        )
        if (employeeDoc.exists()) {
          const data = employeeDoc.data()
          setEmployeeCity(data.city || "DefaultCity")
        } else {
          setEmployeeCity("DefaultCity")
        }
      } catch (e) {
        setEmployeeCity("DefaultCity")
      }
    }
    fetchEmployeeCity()
  }, [currentUser])

  useEffect(() => {
    if (!employeeCity) return
    setLoading(true)
    const requestsQuery = query(
      collection(db, "requests"),
      where("city", "==", employeeCity),
      orderBy("createdAt", "desc"),
    )
    const unsub = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const data: ResourceRequest[] = []
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as ResourceRequest)
        })
        setRequests(data)
        setLoading(false)
        setRefreshing(false)
      },
      (error) => {
        console.error("Error fetching requests:", error)
        showSnackbar("Failed to load requests")
        setLoading(false)
        setRefreshing(false)
      },
    )
    return () => unsub()
  }, [employeeCity])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
  }, [])

  const openRequestModal = (request: ResourceRequest) => {
    setSelectedRequest(request)
    setRequestModalVisible(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "#ef4444"
      case "high":
        return "#f59e0b"
      case "medium":
        return "#3b82f6"
      case "low":
        return "#10b981"
      default:
        return colors.textSecondary
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      case "fulfilled":
        return "#8b5cf6"
      case "pending":
        return "#f59e0b"
      default:
        return colors.textSecondary
    }
  }

  const handleRequestAction = async (action: "approve" | "reject" | "fulfill") => {
    if (!selectedRequest) return
    setProcessing(true)
    try {
      const updateData: any = {
        status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "fulfilled",
        processedAt: new Date(),
        processedBy: currentUser?.uid,
      }
      await updateDoc(doc(db, "requests", selectedRequest.id), updateData)
      showSnackbar(`Request ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "fulfilled"}`)
      setRequestModalVisible(false)
    } catch (error) {
      console.error("Error processing request:", error)
      showSnackbar("Failed to process request")
    } finally {
      setProcessing(false)
    }
  }

  const filteredRequests = requests.filter((request) => {
    if (requestFilter === "all") return true
    return request.status === requestFilter
  })

  const renderRequestItem = ({ item }: { item: ResourceRequest }) => (
    <TouchableOpacity
      onPress={() => openRequestModal(item)}
      style={[styles.modernCard, { backgroundColor: colors.cardBackground }]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + "20" }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.requestContent}>
        <Text style={[styles.requestResourceName, { color: colors.text }]}>{item.resourceName}</Text>
        <Text style={[styles.requestQuantity, { color: colors.textSecondary }]}>Quantity: {item.quantity} units</Text>
        <Text style={[styles.requestUser, { color: colors.textSecondary }]}>
          Requested by: {item.userName || "Unknown User"}
        </Text>
        <Text style={[styles.requestContact, { color: colors.textSecondary }]}>Contact: {item.contactNumber}</Text>
        {item.urgencyNote && (
          <Text style={[styles.urgencyNote, { color: colors.warning }]}>Note: {item.urgencyNote}</Text>
        )}
        <Text style={[styles.requestTime, { color: colors.textSecondary }]}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : "N/A"}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {["all", "pending", "approved", "fulfilled", "rejected"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              {
                backgroundColor: requestFilter === filter ? colors.primary : colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setRequestFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, { color: requestFilter === filter ? "#fff" : colors.text }]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList<ResourceRequest>
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Request Modal */}
      <Modal
        visible={requestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modernModalContent,
              {
                backgroundColor: colors.cardBackground,
                opacity: modalAnim,
                transform: [{ scale: modalAnim }],
              },
            ]}
          >
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Request Details</Text>
                  <TouchableOpacity onPress={() => setRequestModalVisible(false)} style={styles.closeButton}>
                    <Feather name="x" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  <View style={styles.requestDetailCard}>
                    <View style={styles.requestDetailHeader}>
                      <Text style={[styles.requestDetailTitle, { color: colors.text }]}>
                        {selectedRequest.resourceName}
                      </Text>
                      <View
                        style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) + "20" }]}
                      >
                        <Text style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>
                          {selectedRequest.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.requestDetailGrid}>
                      <View style={styles.requestDetailItem}>
                        <MaterialIcons name="inventory" size={20} color={colors.textSecondary} />
                        <View style={styles.requestDetailContent}>
                          <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>Quantity</Text>
                          <Text style={[styles.requestDetailValue, { color: colors.text }]}>
                            {selectedRequest.quantity} units
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <MaterialIcons name="person" size={20} color={colors.textSecondary} />
                        <View style={styles.requestDetailContent}>
                          <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>Requester</Text>
                          <Text style={[styles.requestDetailValue, { color: colors.text }]}>
                            {selectedRequest.userName || "Unknown"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
                        <View style={styles.requestDetailContent}>
                          <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>Contact</Text>
                          <Text style={[styles.requestDetailValue, { color: colors.text }]}>
                            {selectedRequest.contactNumber}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <MaterialIcons name="flag" size={20} color={colors.textSecondary} />
                        <View style={styles.requestDetailContent}>
                          <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>Priority</Text>
                          <Text
                            style={[styles.requestDetailValue, { color: getPriorityColor(selectedRequest.priority) }]}
                          >
                            {selectedRequest.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
                        <View style={styles.requestDetailContent}>
                          <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>Requested</Text>
                          <Text style={[styles.requestDetailValue, { color: colors.text }]}>
                            {selectedRequest.createdAt?.toDate
                              ? selectedRequest.createdAt.toDate().toLocaleString()
                              : "N/A"}
                          </Text>
                        </View>
                      </View>
                      {selectedRequest.deliveryAddress && (
                        <View style={styles.requestDetailItem}>
                          <MaterialIcons name="location-on" size={20} color={colors.textSecondary} />
                          <View style={styles.requestDetailContent}>
                            <Text style={[styles.requestDetailLabel, { color: colors.textSecondary }]}>
                              Delivery Address
                            </Text>
                            <Text style={[styles.requestDetailValue, { color: colors.text }]}>
                              {selectedRequest.deliveryAddress}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    {selectedRequest.urgencyNote && (
                      <View style={[styles.urgencyCard, { backgroundColor: colors.warning + "10" }]}>
                        <MaterialIcons name="warning" size={20} color={colors.warning} />
                        <Text style={[styles.urgencyText, { color: colors.warning }]}>
                          {selectedRequest.urgencyNote}
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
                {(selectedRequest.status === "pending" || selectedRequest.status === "approved") && (
                  <View style={styles.requestActions}>
                    {selectedRequest.status === "pending" && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleRequestAction("reject")}
                          style={[styles.modernButton, styles.rejectButton]}
                          disabled={processing}
                          activeOpacity={0.7}
                        >
                          {processing ? (
                            <ActivityIndicator color="#ef4444" size="small" />
                          ) : (
                            <>
                              <MaterialIcons name="close" size={20} color="#ef4444" />
                              <Text style={styles.rejectButtonText}>Reject</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRequestAction("approve")}
                          style={[styles.modernButton, styles.approveButton]}
                          disabled={processing}
                          activeOpacity={0.7}
                        >
                          {processing ? (
                            <ActivityIndicator color="#10b981" size="small" />
                          ) : (
                            <>
                              <MaterialIcons name="check" size={20} color="#10b981" />
                              <Text style={styles.approveButtonText}>Approve</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                    {selectedRequest.status === "approved" && (
                      <TouchableOpacity
                        onPress={() => handleRequestAction("fulfill")}
                        style={[styles.modernButton, styles.fulfillButton]}
                        disabled={processing}
                        activeOpacity={0.7}
                      >
                        {processing ? (
                          <ActivityIndicator color="#8b5cf6" size="small" />
                        ) : (
                          <>
                            <MaterialIcons name="done-all" size={20} color="#8b5cf6" />
                            <Text style={styles.fulfillButtonText}>Mark as Fulfilled</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Snackbar */}
      {snackbarVisible && (
        <Animated.View
          style={[
            styles.modernSnackbar,
            {
              backgroundColor: colors.cardBackground,
              opacity: snackbarAnim,
              transform: [
                {
                  translateY: snackbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name="info" size={20} color={colors.primary} />
          <Text style={[styles.snackbarText, { color: colors.text }]}>{snackbarMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modernHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  filtersContainer: {
    maxHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  modernCard: {
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  requestContent: {
    marginTop: 8,
  },
  requestResourceName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  requestQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestUser: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestContact: {
    fontSize: 14,
    marginBottom: 4,
  },
  urgencyNote: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 8,
  },
  requestTime: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modernModalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "100%",
    minHeight: "100%",
    borderRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollView: {
    flex: 1,
    padding: 20,
  },
  requestDetailCard: {
    padding: 16,
    borderRadius: 16,
    width: 350,
    height: 50,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  requestDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  requestDetailTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  requestDetailGrid: {
    marginBottom: 16,
  },
  requestDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  requestDetailContent: {
    marginLeft: 12,
    flex: 1,
  },
  requestDetailLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  requestDetailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  urgencyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  modernButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  rejectButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#ef4444",
    marginRight: 12,
  },
  rejectButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 6,
  },
  approveButton: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#10b981",
    marginRight: 12,
  },
  approveButtonText: {
    color: "#10b981",
    fontWeight: "600",
    marginLeft: 6,
  },
  fulfillButton: {
    backgroundColor: "#f3e8ff",
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  fulfillButtonText: {
    color: "#8b5cf6",
    fontWeight: "600",
    marginLeft: 6,
  },
  modernSnackbar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  snackbarText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
})

export default RequestsScreen