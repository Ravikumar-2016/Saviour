"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useColorScheme } from "@/hooks/useColorScheme"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"

type IncidentReport = {
  id: string
  anonymous: boolean
  category: string
  contact: string
  createdAt: any
  desc: string
  employeeId: string
  location?: { latitude: number; longitude: number }
  photoUrls?: string[]
  status: string
  urgency: string
}

const FILTERS = [
  { label: "All", value: "all", icon: "apps" },
  { label: "Medical", value: "Medical", icon: "medkit" },
  { label: "Fire", value: "Fire", icon: "fire" },
  { label: "Crime", value: "Crime", icon: "police-badge" },
  { label: "Other", value: "Other", icon: "dots-horizontal" },
]

const RecentReportsScreen = () => {
  const colorScheme = useColorScheme() ?? "light"
  const isDark = colorScheme === "dark"
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, "incident_reports"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const data: IncidentReport[] = []
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as IncidentReport)
        })
        setReports(data)
      } catch (e) {
        setReports([])
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const themed = getThemedStyles(isDark)

  // Filtering and searching
  const filteredReports = reports.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "Crime"
        ? ["Crime", "Armed Robbery", "Theft", "Violence", "Police"].some((cat) =>
            item.category?.toLowerCase().includes(cat.toLowerCase())
          )
        : item.category?.toLowerCase() === filter.toLowerCase()
    const matchesSearch =
      search.trim().length === 0 ||
      item.desc?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.status?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const renderImages = (photoUrls?: string[]) => {
    if (!photoUrls || photoUrls.length === 0) return null
    return (
      <View style={themed.imageRow}>
        {photoUrls.map((url, idx) => (
          <Image
            key={idx}
            source={{ uri: url }}
            style={themed.image}
            resizeMode="cover"
          />
        ))}
      </View>
    )
  }

  const renderItem = ({ item }: { item: IncidentReport }) => (
    <View style={themed.card}>
      <Text style={themed.value}>{item.desc}</Text>
      {renderImages(item.photoUrls)}
      <Text style={themed.label}>
        Category: <Text style={themed.value}>{item.category}</Text>
      </Text>
      <Text style={themed.label}>
        Urgency: <Text style={themed.value}>{item.urgency}</Text>
      </Text>
      <Text style={themed.label}>
        Status: <Text style={themed.value}>{item.status}</Text>
      </Text>
      <Text style={themed.label}>
        Contact: <Text style={themed.value}>{item.contact}</Text>
      </Text>
      <Text style={themed.label}>
        Anonymous: <Text style={themed.value}>{item.anonymous ? "Yes" : "No"}</Text>
      </Text>
      <Text style={themed.label}>
        Employee ID: <Text style={themed.value}>{item.employeeId}</Text>
      </Text>
      {item.location && (
        <Text style={themed.label}>
          Location:{" "}
          <Text style={themed.value}>
            {item.location.latitude}, {item.location.longitude}
          </Text>
        </Text>
      )}
      <Text style={themed.label}>
        Created:{" "}
        <Text style={themed.value}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleString()
            : String(item.createdAt)}
        </Text>
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={themed.container}>
      {/* Search Bar */}
      <View style={themed.searchBarContainer}>
        <Ionicons
          name="search"
          size={20}
          color={isDark ? "#a1a1aa" : "#64748b"}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={themed.searchBar}
          placeholder="Search reports..."
          placeholderTextColor={isDark ? "#a1a1aa" : "#64748b"}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Filters */}
      <View style={themed.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              themed.filterChip,
              filter === f.value && themed.filterChipActive,
            ]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            {f.icon === "fire" ? (
              <MaterialCommunityIcons
                name="fire"
                size={16}
                color={filter === f.value ? "#fff" : isDark ? "#fbbf24" : "#f59e0b"}
                style={{ marginRight: 4 }}
              />
            ) : f.icon === "medkit" ? (
              <Ionicons
                name="medkit"
                size={16}
                color={filter === f.value ? "#fff" : isDark ? "#34d399" : "#10b981"}
                style={{ marginRight: 4 }}
              />
            ) : f.icon === "police-badge" ? (
              <MaterialCommunityIcons
                name="police-badge"
                size={16}
                color={filter === f.value ? "#fff" : isDark ? "#60a5fa" : "#3b82f6"}
                style={{ marginRight: 4 }}
              />
            ) : f.icon === "dots-horizontal" ? (
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={16}
                color={filter === f.value ? "#fff" : isDark ? "#a1a1aa" : "#64748b"}
                style={{ marginRight: 4 }}
              />
            ) : (
              <Ionicons
                name="apps"
                size={16}
                color={filter === f.value ? "#fff" : isDark ? "#a1a1aa" : "#64748b"}
                style={{ marginRight: 4 }}
              />
            )}
            <Text
              style={[
                themed.filterChipText,
                filter === f.value && themed.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* List */}
      {loading ? (
        <View style={themed.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={themed.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: isDark ? "#a1a1aa" : "#64748b", textAlign: "center", marginTop: 40 }}>
              No reports found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  )
}

function getThemedStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#18181b" : "#f8fafc",
    },
    searchBarContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      margin: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    searchBar: {
      flex: 1,
      fontSize: 16,
      color: isDark ? "#f3f4f6" : "#1e293b",
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      marginBottom: 8,
      marginTop: 0,
      marginLeft: 4,
      marginRight: 4,
      flexWrap: "wrap",
      gap: 4,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
    filterChipActive: {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
    },
    filterChipText: {
      fontSize: 13,
      color: isDark ? "#a1a1aa" : "#475569",
      fontWeight: "600",
    },
    filterChipTextActive: {
      color: "#fff",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      padding: 16,
      paddingTop: 0,
    },
    card: {
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    label: {
      color: isDark ? "#a1a1aa" : "#475569",
      fontSize: 13,
      marginTop: 4,
    },
    value: {
      color: isDark ? "#f3f4f6" : "#1e293b",
      fontSize: 15,
      fontWeight: "500",
    },
    imageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      marginBottom: 4,
      gap: 8,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: isDark ? "#18181b" : "#f3f4f6",
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
    },
  })
}

export default RecentReportsScreen