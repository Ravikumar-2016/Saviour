import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

const COLLECTIONS = [
  { key: "users", label: "Users" },
  { key: "employees", label: "Employees" },
  { key: "requests", label: "Requests" },
  { key: "incident_reports", label: "Incident Reports" },
  { key: "resources", label: "Resources" },
  { key: "sos_requests", label: "SOS Requests" },
];

// Helper to prettify field names
function prettifyKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
}

// Helper to render field values nicely
function renderValue(value: any, themed: any) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      if (typeof value[0] === "string" || typeof value[0] === "number")
        return value.join(", ");
      return `(${value.length}) items`;
    }
    // For objects, show key: value pairs, but with better contrast
    return (
      <View style={{ marginLeft: 8, marginTop: 2 }}>
        {Object.entries(value).map(([k, v]) => (
          <View key={k} style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 2 }}>
            <Text style={[themed.label, { fontSize: 12, color: themed.subtleText.color }]}>
              {prettifyKey(k)}:{" "}
            </Text>
            <Text style={[themed.value, { fontSize: 12 }]}>{renderValue(v, themed)}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (typeof value === "string" && value.length > 60) {
    return value.slice(0, 60) + "...";
  }
  return String(value);
}

export default function ViewDataScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  const [adminCity, setAdminCity] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState(COLLECTIONS[0].key);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch admin city
  useEffect(() => {
    const fetchAdminCity = async () => {
      if (!user?.uid) return;
      const snap = await getDocs(query(collection(db, "admins"), where("__name__", "==", user.uid)));
      if (!snap.empty) {
        setAdminCity(snap.docs[0].data().city || null);
      }
    };
    fetchAdminCity();
  }, [user?.uid]);

  // Fetch data for selected collection and city
  useEffect(() => {
    if (!adminCity) return;
    const fetchData = async () => {
      setLoading(true);
      let q;
      if (
        ["users", "employees", "requests", "incident_reports", "resources", "sos_requests"].includes(
          selectedCollection
        )
      ) {
        q = query(collection(db, selectedCollection), where("city", "==", adminCity));
      } else {
        q = collection(db, selectedCollection);
      }
      const snap = await getDocs(q);
      setData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, [selectedCollection, adminCity]);

  // Filtered data by search
  const filteredData = data.filter((item) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return Object.entries(item)
      .filter(([k]) => k !== "id")
      .some(([, v]) =>
        typeof v === "string"
          ? v.toLowerCase().includes(searchLower)
          : typeof v === "number"
          ? String(v).includes(searchLower)
          : typeof v === "object" && v !== null
          ? JSON.stringify(v).toLowerCase().includes(searchLower)
          : false
      );
  });

  const themed = getThemedStyles(isDark);

  // Render item for each collection
  const renderItem = ({ item }: { item: any }) => (
    <View style={themed.card}>
      {Object.entries(item)
        .filter(([key]) => key !== "id")
        .map(([key, value]) => (
          <View key={key} style={themed.fieldRow}>
            <Text style={themed.label}>{prettifyKey(key)}:</Text>
            <Text style={themed.value}>{renderValue(value, themed)}</Text>
          </View>
        ))}
    </View>
  );

  return (
    <View style={themed.container}>
      {/* Sticky Filter and Search Bar */}
      <View style={themed.stickyBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={themed.filterRow}
          style={{ flexGrow: 0 }}
        >
          {COLLECTIONS.map((col) => (
            <TouchableOpacity
              key={col.key}
              style={[
                themed.filterChip,
                selectedCollection === col.key && themed.filterChipActive,
              ]}
              onPress={() => setSelectedCollection(col.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  themed.filterChipText,
                  selectedCollection === col.key && themed.filterChipTextActive,
                ]}
              >
                {col.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={themed.searchBarContainer}>
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#a1a1aa" : "#64748b"}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={themed.searchBar}
            placeholder={`Search ${COLLECTIONS.find((c) => c.key === selectedCollection)?.label || ""}...`}
            placeholderTextColor={isDark ? "#a1a1aa" : "#64748b"}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      {/* Data List */}
      {loading ? (
        <View style={themed.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#60a5fa" : "#3b82f6"} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={themed.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={{
                color: isDark ? "#a1a1aa" : "#64748b",
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No data found.
            </Text>
          }
        />
      )}
    </View>
  );
}

function getThemedStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#18181b" : "#f8fafc",
      paddingTop: Platform.OS === "android" ? 0 : 0,
    },
    stickyBar: {
      backgroundColor: isDark ? "#18181b" : "#f8fafc",
      zIndex: 10,
      elevation: 10,
      paddingTop: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderColor: isDark ? "#23232a" : "#e5e7eb",
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      minHeight: 48,
      gap: 8,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 16,
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#27272a" : "#e5e7eb",
      marginRight: 0,
      marginBottom: 4,
    },
    filterChipActive: {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
    },
    filterChipText: {
      fontSize: 14,
      color: isDark ? "#a1a1aa" : "#475569",
      fontWeight: "600",
    },
    filterChipTextActive: {
      color: "#fff",
    },
    searchBarContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 4,
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      padding: 16,
      paddingTop: 0,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: isDark ? "#23232a" : "#fff",
      borderRadius: 18,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 10,
      elevation: 3,
      marginHorizontal: 2,
    },
    fieldRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      flexWrap: "wrap",
    },
    label: {
      color: isDark ? "#cbd5e1" : "#334155",
      fontSize: 15,
      fontWeight: "700",
      marginRight: 8,
      minWidth: 110,
      marginBottom: 0,
    },
    value: {
      color: isDark ? "#f8fafc" : "#1e293b",
      fontSize: 15,
      fontWeight: "400",
      flexShrink: 1,
      flex: 1,
    },
    subtleText: {
      color: isDark ? "#94a3b8" : "#64748b",
    },
  });
}