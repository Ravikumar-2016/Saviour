import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import axios from "axios";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Import Safety Popups
import FloodSafety from "../../components/Safety/Flood-Safety";
import EarthquakeSafety from "../../components/Safety/Earthquake-Safety";
import FirstAidTutorial from "../../components/Safety/First-Aid-Tutorial";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

type QuickAction = {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  iconSet: "Ionicons" | "Feather";
};

const NotificationIcon = ({
  unseenCount,
  onPress,
  theme,
}: {
  unseenCount: number;
  onPress: () => void;
  theme: string;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={{ 
      marginLeft: 12,
      position: 'relative'
    }}
  >
    <LinearGradient
      colors={['#6E45E2', '#89D4CF']}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="notifications-outline" size={22} color="#fff" />
    </LinearGradient>
    {unseenCount > 0 && (
      <View
        style={{
          position: "absolute",
          right: -4,
          top: -4,
          backgroundColor: "#FF4757",
          borderRadius: 10,
          width: 20,
          height: 20,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: theme === "dark" ? "#181a20" : "#fff"
        }}
      >
        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>{unseenCount}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [sosRaised, setSosRaised] = useState(0);
  const [helpProvided, setHelpProvided] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  // Safety Popups
  const [showFirstAid, setShowFirstAid] = useState(false);
  const [showFlood, setShowFlood] = useState(false);
  const [showEarthquake, setShowEarthquake] = useState(false);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Create SOS",
      icon: "plus",
      color: "#FF4757",
      route: "/sos",
      iconSet: "Feather",
    },
    {
      id: "2",
      title: "View Map",
      icon: "map",
      color: "#1E90FF",
      route: "/map",
      iconSet: "Feather",
    },
    {
      id: "3",
      title: "Resources",
      icon: "book",
      color: "#2ED573",
      route: "/Resources",
      iconSet: "Feather",
    },
    {
      id: "4",
      title: "Community",
      icon: "users",
      color: "#FFA502",
      route: "/chat",
      iconSet: "Feather",
    },
  ];

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        setProfile(null);
      }
    } catch (e) {
      setProfile(null);
    }
  };

  // Fetch SOS stats
  const fetchSosStats = async (uid: string) => {
    try {
      // SOS Raised: where userId == uid
      const sosRaisedQuery = query(
        collection(db, "sos_requests"),
        where("userId", "==", uid)
      );
      const sosRaisedSnap = await getDocs(sosRaisedQuery);
      setSosRaised(sosRaisedSnap.size);

      // Help Provided: where acceptedBy == uid and status == "accepted" or "responded"
      const helpProvidedQuery = query(
        collection(db, "sos_requests"),
        where("acceptedBy", "==", uid),
        where("status", "in", ["accepted", "responded"])
      );
      const helpProvidedSnap = await getDocs(helpProvidedQuery);
      setHelpProvided(helpProvidedSnap.size);
    } catch (e) {
      setSosRaised(0);
      setHelpProvided(0);
    }
  };

  // Fetch all data
  const fetchAll = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission is needed for app functionality.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);

      // Save location to Firestore under 'weather' collection (document id = user.uid)
      if (user) {
        const weatherRef = doc(db, "weather", user.uid);
        await setDoc(weatherRef, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          lastLocationUpdate: new Date(),
        });
      }

      // Fetch latest location from Firestore (weather collection)
      let latestCoords = coords;
      if (user) {
        const weatherRef = doc(db, "weather", user.uid);
        const docSnap = await getDoc(weatherRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.latitude && data.longitude) {
            latestCoords = { latitude: data.latitude, longitude: data.longitude };
            setLocation(latestCoords);
          }
        }
      }

      // Fetch weather using OpenWeatherMap API
      const apiKey = "475dad9f469397c42f28ed2ce92b2537";
      try {
        const weatherResp = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latestCoords.latitude}&lon=${latestCoords.longitude}&units=metric&appid=${apiKey}`
        );
        setWeather(weatherResp.data);
      } catch (err) {
        setWeather(null);
      }

      // Fetch user profile from Firestore
      if (user?.uid) {
        await fetchUserProfile(user.uid);
        await fetchSosStats(user.uid);
      }

      setNotifCount(0);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const renderIcon = (iconSet: string, iconName: string, size: number, color: string) => {
    switch (iconSet) {
      case "Ionicons":
        return <Ionicons name={iconName as any} size={size} color={color} />;
      case "Feather":
        return <Feather name={iconName as any} size={size} color={color} />;
      default:
        return <Ionicons name="alert-circle" size={size} color={color} />;
    }
  };

  const getWeatherGradient = () => {
    if (!weather) return ['#6E45E2', '#89D4CF'];
    const weatherMain = weather.weather[0].main.toLowerCase();
    if (weatherMain.includes('rain')) return ['#4B79CF', '#4B79CF'];
    if (weatherMain.includes('cloud')) return ['#B7B7B7', '#5C5C5C'];
    if (weatherMain.includes('sun') || weatherMain.includes('clear')) return ['#FF7E5F', '#FEB47B'];
    return ['#6E45E2', '#89D4CF'];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === "dark" ? "#0F172A" : "#F8FAFC" }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#6E45E2']}
            tintColor={'#6E45E2'}
          />
        }
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        alwaysBounceVertical
      >
        {/* Header with greeting and notification */}
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center", 
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16
          }}>
            <View>
              <Text style={{ 
                fontSize: 14, 
                color: colorScheme === "dark" ? "#94A3B8" : "#64748B",
                marginBottom: 4
              }}>
                {greeting()}
                {profile?.fullName ? `, ${profile.fullName}` : ""}
              </Text>
              <Text style={{ 
                fontSize: isTablet ? 28 : 24, 
                fontWeight: "bold", 
                color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" 
              }}>
                Welcome back!
              </Text>
            </View>
            <NotificationIcon
              unseenCount={notifCount}
              onPress={() => router.push("/Notifications")}
              theme={colorScheme}
            />
          </View>
        </Animated.View>

        {/* Weather Card (clickable) */}
        <Animated.View entering={FadeIn.delay(100).duration(600)}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/Weather-Forecast")}
          >
            <LinearGradient
              colors={getWeatherGradient() as any}
              style={{
                borderRadius: 24,
                padding: 20,
                marginHorizontal: 24,
                marginBottom: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 8
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {weather && weather.weather && weather.weather[0] ? (
                <>
                  <View>
                    <Text style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      color: "#fff",
                      marginBottom: 4
                    }}>
                      {weather.name}
                    </Text>
                    <Text style={{
                      fontSize: 32,
                      fontWeight: '800',
                      color: "#fff",
                      marginBottom: 4
                    }}>
                      {Math.round(weather.main.temp)}°C
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)"
                    }}>
                      {weather.weather[0].description}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 4
                    }}>
                      Lat: {location?.latitude?.toFixed(4)}, Lon: {location?.longitude?.toFixed(4)}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                  />
                </>
              ) : (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ color: "#fff" }}>Weather unavailable</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <Text style={{
            fontWeight: "600",
            fontSize: 18,
            marginBottom: 16,
            marginHorizontal: 24,
            color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A"
          }}>
            Quick Actions
          </Text>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12
          }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                style={{
                  width: (width - 72) / 2,
                  backgroundColor: colorScheme === "dark" ? "#1E293B" : "#FFFFFF",
                  borderRadius: 16,
                  padding: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${action.color}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12
                }}>
                  {renderIcon(action.iconSet, action.icon, 24, action.color)}
                </View>
                <Text style={{
                  fontWeight: "600",
                  color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A",
                  textAlign: "center"
                }}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Safety Stats */}
        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <View style={{
            marginTop: 24,
            marginBottom: 16,
            marginHorizontal: 24
          }}>
            <Text style={{
              fontWeight: "600",
              fontSize: 18,
              color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A",
              marginBottom: 8
            }}>
              Your Safety Stats
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 16 }}
            style={{ marginBottom: 6 }}
          >
            {/* SOS Raised Card */}
            <LinearGradient
              colors={['#FF4757', '#FF6B81']}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="alert-triangle" size={24} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={styles.statsCardLabel}>
                SOS Raised
              </Text>
              <Text style={styles.statsCardValue}>
                {sosRaised}
              </Text>
            </LinearGradient>

            {/* Help Provided Card */}
            <LinearGradient
              colors={['#2ED573', '#7BED9F']}
              style={styles.statsCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="heart" size={24} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={styles.statsCardLabel}>
                Help Provided
              </Text>
              <Text style={styles.statsCardValue}>
                {helpProvided}
              </Text>
            </LinearGradient>
          </ScrollView>
          {/* Modern thin horizontal scrollbar */}
          <View style={styles.thinScrollbar} />
        </Animated.View>

        {/* Safety Section */}
        <Animated.View entering={FadeIn.delay(700).duration(600)}>
          <View style={{
            marginTop: 24,
            marginBottom: 16,
            marginHorizontal: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Text style={{
              fontWeight: "600",
              fontSize: 18,
              color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A"
            }}>
              Safety Updates
            </Text>
            <TouchableOpacity onPress={() => router.push("/Safety")}>
              <Text style={{
                color: "#6E45E2",
                fontSize: 14,
                fontWeight: "500"
              }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 24, paddingRight: 8, gap: 16 }}
            style={{ marginBottom: 6 }}
          >
            {/* First Aid Tutorial Card */}
            <TouchableOpacity
              style={styles.safetyCard}
              onPress={() => setShowFirstAid(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="medkit" size={32} color="#4caf50" style={{ marginBottom: 10 }} />
              <Text style={styles.safetyCardTitle}>First Aid Tutorial</Text>
              <Text style={styles.safetyCardDesc}>Learn essential first aid steps</Text>
            </TouchableOpacity>
            {/* Flood Safety Card */}
            <TouchableOpacity
              style={styles.safetyCard}
              onPress={() => setShowFlood(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="water" size={32} color="#2196f3" style={{ marginBottom: 10 }} />
              <Text style={styles.safetyCardTitle}>Flood Safety</Text>
              <Text style={styles.safetyCardDesc}>Flood safety rules & video</Text>
            </TouchableOpacity>
            {/* Earthquake Safety Card */}
            <TouchableOpacity
              style={styles.safetyCard}
              onPress={() => setShowEarthquake(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="earth" size={32} color="#ff9800" style={{ marginBottom: 10 }} />
              <Text style={styles.safetyCardTitle}>Earthquake Safety</Text>
              <Text style={styles.safetyCardDesc}>Earthquake safety rules & video</Text>
            </TouchableOpacity>
          </ScrollView>
          {/* Modern thin horizontal scrollbar */}
          <View style={styles.thinScrollbar} />
        </Animated.View>

        {/* Safety Popups */}
        <FirstAidTutorial visible={showFirstAid} onClose={() => setShowFirstAid(false)} />
        <FloodSafety visible={showFlood} onClose={() => setShowFlood(false)} />
        <EarthquakeSafety visible={showEarthquake} onClose={() => setShowEarthquake(false)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    marginRight: 12,
  },
  statsCardLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  statsCardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  safetyCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  safetyCardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginBottom: 2,
    textAlign: "center"
  },
  safetyCardDesc: {
    fontSize: 12,
    color: "#666",
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