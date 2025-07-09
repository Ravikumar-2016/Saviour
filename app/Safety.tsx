import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, TextInput, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

// Import all safety components
import ChemicalSafety from "../components/Safety/Chemical-Safety";
import CycloneSafety from "../components/Safety/Cyclone-Safety";
import EarthquakeSafety from "../components/Safety/Earthquake-Safety";
import ElectricalSafety from "../components/Safety/Electrical-Safety";
import ExtremeColdSafety from "../components/Safety/Extreme-Cold-Safety";
import ExtremeHeatSafety from "../components/Safety/Extreme-Heat-Safety";
import FireSafety from "../components/Safety/Fire-Safety";
import FirstAidTutorial from "../components/Safety/First-Aid-Tutorial";
import FloodSafety from "../components/Safety/Flood-Safety";
import LandslideSafety from "../components/Safety/Landslide-Safety";
import LightningSafety from "../components/Safety/Lightning-Safety";
import TsunamiSafety from "../components/Safety/Tsunami-Safety";

const { width } = Dimensions.get("window");

const safetyItems = [
  {
    key: "firstaid",
    label: "First Aid",
    icon: <Ionicons name="medkit" size={32} color="#4caf50" />,
    component: FirstAidTutorial,
    desc: "Essential first aid steps",
  },
  {
    key: "flood",
    label: "Flood",
    icon: <Ionicons name="water" size={32} color="#2196f3" />,
    component: FloodSafety,
    desc: "Flood safety rules & video",
  },
  {
    key: "earthquake",
    label: "Earthquake",
    icon: <Ionicons name="earth" size={32} color="#ff9800" />,
    component: EarthquakeSafety,
    desc: "Earthquake safety rules & video",
  },
  {
    key: "fire",
    label: "Fire",
    icon: <Ionicons name="flame" size={32} color="#e53935" />,
    component: FireSafety,
    desc: "Fire safety rules & video",
  },
  {
    key: "cyclone",
    label: "Cyclone",
    icon: <Ionicons name="cloudy" size={32} color="#00bcd4" />,
    component: CycloneSafety,
    desc: "Cyclone safety rules",
  },
  {
    key: "chemical",
    label: "Chemical",
    icon: <Ionicons name="flask" size={32} color="#8e24aa" />,
    component: ChemicalSafety,
    desc: "Chemical safety rules",
  },
  {
    key: "electrical",
    label: "Electrical",
    icon: <Ionicons name="flash" size={32} color="#ffd600" />,
    component: ElectricalSafety,
    desc: "Electrical safety rules",
  },
  {
    key: "lightning",
    label: "Lightning",
    icon: <Ionicons name="thunderstorm" size={32} color="#2979ff" />,
    component: LightningSafety,
    desc: "Lightning safety rules",
  },
  {
    key: "landslide",
    label: "Landslide",
    // Ionicons does not have "mountain", use MaterialCommunityIcons "terrain" as alternative
    icon: <MaterialCommunityIcons name="terrain" size={32} color="#6d4c41" />,
    component: LandslideSafety,
    desc: "Landslide safety rules",
  },
  {
    key: "tsunami",
    label: "Tsunami",
    // Ionicons does not have "wave", use FontAwesome5
    icon: <FontAwesome5 name="water" size={32} color="#0288d1" />,
    component: TsunamiSafety,
    desc: "Tsunami safety rules",
  },
  {
    key: "extremecold",
    label: "Extreme Cold",
    icon: <Ionicons name="snow" size={32} color="#00bcd4" />,
    component: ExtremeColdSafety,
    desc: "Extreme cold safety rules",
  },
  {
    key: "extremeheat",
    label: "Extreme Heat",
    icon: <Ionicons name="sunny" size={32} color="#ffb300" />,
    component: ExtremeHeatSafety,
    desc: "Extreme heat safety rules",
  },
];

const SafetyScreen = () => {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  const filteredItems = safetyItems.filter(item =>
    item.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  const openPopup = (key: string) => setVisibleKey(key);
  const closePopup = () => setVisibleKey(null);

  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#0F172A" : "#F8FAFC" }}>
      {/* Modern Search Bar */}
      <View style={[
        styles.searchBar,
        { backgroundColor: colorScheme === "dark" ? "#23272f" : "#fff", borderColor: colorScheme === "dark" ? "#23272f" : "#e0e0e0" }
      ]}>
        <Ionicons name="search" size={20} color={colorScheme === "dark" ? "#94A3B8" : "#64748B"} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search safety topics..."
          placeholderTextColor={colorScheme === "dark" ? "#94A3B8" : "#64748B"}
          style={[styles.searchInput, { color: colorScheme === "dark" ? "#fff" : "#222" }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Horizontal Scrollable Safety Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 16 }}
        style={{ marginTop: 18, marginBottom: 6 }}
      >
        {filteredItems.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.safetyCard,
              { backgroundColor: colorScheme === "dark" ? "#1E293B" : "#FFFFFF" }
            ]}
            onPress={() => openPopup(item.key)}
            activeOpacity={0.85}
          >
            {item.icon}
            <Text style={[
              styles.safetyCardTitle,
              { color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" }
            ]}>
              {item.label}
            </Text>
            <Text style={[
              styles.safetyCardDesc,
              { color: colorScheme === "dark" ? "#94A3B8" : "#64748B" }
            ]}>
              {item.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Modern thin horizontal scrollbar */}
      <View style={styles.thinScrollbar} />

      {/* Popups */}
      {safetyItems.map(item => {
        const Comp = item.component;
        return (
          <Comp
            key={item.key}
            visible={visibleKey === item.key}
            onClose={closePopup}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 2,
  },
  safetyCard: {
    width: 140,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyCardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
    textAlign: "center"
  },
  safetyCardDesc: {
    fontSize: 12,
    textAlign: "center"
  },
  thinScrollbar: {
    height: 3,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginHorizontal: 24,
    marginTop: 2,
    marginBottom: 8,
    opacity: 0.6,
  }
});

export default SafetyScreen;