import React, { useEffect, useState } from "react"
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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { useColorScheme } from "@/hooks/useColorScheme"
import { db, auth } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useNavigation } from "expo-router"
import { useLayoutEffect } from "react"

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
  },
}

type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: string
  resourceId?: string
  requestId?: string
  createdAt: any
  read: boolean
  city: string
}

const NotificationsScreen = () => {
  const colorScheme = useColorScheme() ?? "light"
  const colors = modernTheme[colorScheme]
  const currentUser = auth.currentUser
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Notifications",
      headerBackTitle: "Back",
      headerTitleAlign: "center",
    })
  }, [navigation])

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
          data.push({ id: doc.id, ...doc.data() } as Notification)
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

  const unreadCount = notifications.filter((n) => !n.read).length

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => markNotificationAsRead(item.id)}
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          borderLeftWidth: 4,
          borderLeftColor: item.read ? colors.border : colors.primary,
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
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "N/A"}
        </Text>
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
              <MaterialIcons name="notifications" size={64} color={colors.textSecondary} />
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
})

export default NotificationsScreen