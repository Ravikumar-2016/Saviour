import React, { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  AppState,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { useColorScheme } from "@/hooks/useColorScheme"
import { db, auth } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, serverTimestamp, limit } from "firebase/firestore"
import { useNavigation, useRouter } from "expo-router"
import { useLayoutEffect } from "react"
import * as Haptics from "expo-haptics"

const { width, height } = Dimensions.get("window")

const modernTheme = {
  light: {
    background: "#f8fafc",
    cardBackground: "#ffffff",
    primary: "#3b82f6",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    error: "#ef4444",
    shadow: "rgba(0,0,0,0.1)",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6"
  },
  dark: {
    background: "#0f172a",
    cardBackground: "#1e293b",
    primary: "#60a5fa",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
    error: "#f87171",
    shadow: "rgba(0,0,0,0.3)",
    success: "#4ade80",
    warning: "#fbbf24",
    info: "#60a5fa"
  },
}

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  resourceId?: string
  requestId?: string
  createdAt: any
  read: boolean
  city: string
}

// Global notification state that can be accessed from anywhere
export let globalNotificationQueue: Notification[] = [];
export let addToNotificationQueue: ((notification: Notification) => void) | null = null;

const NotificationsScreen = () => {
  const colorScheme = useColorScheme() ?? "light"
  const colors = modernTheme[colorScheme]
  const currentUser = auth.currentUser
  const navigation = useNavigation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const appState = useRef(AppState.currentState)
  
  // Animation references
  const toastAnimation = useRef(new Animated.Value(-(insets.top + 100))).current
  const opacityAnimation = useRef(new Animated.Value(0)).current
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeToast, setActiveToast] = useState<Notification | null>(null)
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([])
  
  // Set up the global notification handler
  useEffect(() => {
    addToNotificationQueue = (notification: Notification) => {
      setNotificationQueue(prev => [...prev, notification])
      globalNotificationQueue.push(notification)
    }
    
    return () => {
      addToNotificationQueue = null
    }
  }, [])
  
  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground, refresh notifications
        handleRefresh()
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Notifications",
      headerBackTitle: "Back",
      headerTitleAlign: "center",
    })
  }, [navigation])

  // Fetch notifications from Firestore
  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    )
    const unsub = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const data: Notification[] = []
        snapshot.forEach((doc) => {
          const notificationData = { id: doc.id, ...doc.data() } as Notification
          data.push(notificationData)
          
          // Check for new notifications
          const isNew = !notificationData.read && 
            notificationData.createdAt && 
            Date.now() - notificationData.createdAt.toDate().getTime() < 10000 // Less than 10 seconds old
            
          if (isNew) {
            addToNotificationQueue?.(notificationData)
          }
        })
        setNotifications(data)
        setLoading(false)
        setRefreshing(false)
      },
      () => {
        setLoading(false)
        setRefreshing(false)
      }
    )
    return () => unsub()
  }, [currentUser])

  // Process the notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && !activeToast) {
      const nextNotification = notificationQueue[0]
      showToastNotification(nextNotification)
      setNotificationQueue(prev => prev.slice(1))
      
      // Trigger haptic feedback for new notifications
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(
          nextNotification.type === 'error' 
            ? Haptics.NotificationFeedbackType.Error 
            : Haptics.NotificationFeedbackType.Success
        )
      }
    }
  }, [notificationQueue, activeToast])

  const showToastNotification = (notification: Notification) => {
    setActiveToast(notification)
    
    // Animate in
    Animated.parallel([
      Animated.timing(toastAnimation, {
        toValue: insets.top,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start()
    
    // Auto dismiss after 4 seconds
    setTimeout(hideToastNotification, 4000)
  }
  
  const hideToastNotification = () => {
    Animated.parallel([
      Animated.timing(toastAnimation, {
        toValue: -(insets.top + 100),
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setActiveToast(null)
    })
  }

  const handleRefresh = () => setRefreshing(true)

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: serverTimestamp(),
      })
    } catch (error) {
      // ignore
    }
  }
  
  const handleToastPress = () => {
    if (activeToast) {
      markNotificationAsRead(activeToast.id)
      hideToastNotification()
      
      // Navigate to relevant screen if there's a resourceId
      if (activeToast.resourceId) {
        router.push(`/details/${activeToast.resourceId}` as any)
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  
  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'error': return colors.error
      case 'success': return colors.success
      case 'warning': return colors.warning
      default: return colors.info
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => {
        markNotificationAsRead(item.id)
        // Navigate to relevant screen if there's a resourceId
        if (item.resourceId) {
          router.push(`/details/${item.resourceId}` as any)
        }
      }}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderLeftWidth: 4,
          borderLeftColor: item.read ? colors.border : getNotificationColor(item.type),
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          {!item.read && <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{item.message}</Text>
        <View style={styles.notificationFooter}>
          {item.city && (
            <View style={styles.cityContainer}>
              <MaterialIcons name="location-on" size={14} color={colors.textSecondary} />
              <Text style={[styles.cityText, { color: colors.textSecondary }]}>{item.city}</Text>
            </View>
          )}
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error" size={64} color={colors.error} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Authentication Required</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Please log in to view notifications.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      
      {/* Toast notification */}
      {activeToast && (
        <Animated.View 
          style={[
            styles.toastContainer,
            { 
              backgroundColor: colors.cardBackground,
              borderLeftColor: getNotificationColor(activeToast.type),
              transform: [{ translateY: toastAnimation }],
              opacity: opacityAnimation,
              shadowColor: colors.shadow
            }
          ]}
        >
          <TouchableOpacity style={styles.toastContent} onPress={handleToastPress}>
            <View style={styles.toastIconContainer}>
              <MaterialIcons 
                name={
                  activeToast.type === 'error' ? 'error' : 
                  activeToast.type === 'success' ? 'check-circle' :
                  activeToast.type === 'warning' ? 'warning' : 'notifications'
                } 
                size={24} 
                color={getNotificationColor(activeToast.type)} 
              />
            </View>
            <View style={styles.toastTextContainer}>
              <Text style={[styles.toastTitle, { color: colors.text }]} numberOfLines={1}>
                {activeToast.title}
              </Text>
              <Text style={[styles.toastMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                {activeToast.message}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={(e) => {
              e.stopPropagation()
              hideToastNotification()
            }}>
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      <View style={styles.iconRow}>
        <MaterialIcons
          name="notifications"
          size={32}
          color={colors.primary}
        />
        {unreadCount > 0 && (
          <View style={[styles.iconBadge, { backgroundColor: colors.error }]}>
            <Text style={styles.iconBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList<Notification>
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-off" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                You have no notifications at this time.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    position: "relative",
  },
  iconBadge: {
    position: "absolute",
    left: 38,
    top: 12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  iconBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  card: {
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: { padding: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityText: {
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Toast notification styles
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    zIndex: 1000,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 8,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  toastIconContainer: {
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
})

export default NotificationsScreen