import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import axios from "axios";
import { doc, getDoc, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

type QuickAction = {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  iconSet: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome" | "Feather";
};

export default function EmployeeHomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState({ total: 0, pending: 0, active: 0, recent: [] as any[] });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  // Quick actions for employee
  const quickActions: QuickAction[] = [
    {
      id: "1",
      title: "Resources",
      icon: "box",
      color: "#2ED573",
      route: "/Employee-Resources",
      iconSet: "Feather",
    },
    {
      id: "2",
      title: "Team Chat",
      icon: "message-circle",
      color: "#6E45E2",
      route: "/Employee-Chat",
      iconSet: "Feather",
    },
  ];

  // Fetch employee profile (show fullName if available)
  const fetchEmployeeProfile = async (uid: string) => {
    try {
      const empRef = doc(db, "employees", uid);
      const empSnap = await getDoc(empRef);
      if (empSnap.exists()) {
        setEmployeeProfile(empSnap.data());
      } else {
        setEmployeeProfile(null);
      }
    } catch (e) {
      setEmployeeProfile(null);
    }
  };

  // Fetch user stats (for employees, show only users they manage or city-wide)
  const fetchStats = async () => {
    // Users
    const usersQ = query(collection(db, "users"), where("role", "==", "user"));
    const usersSnap = await getDocs(usersQ);
    let total = 0, pending = 0, active = 0;
    let recentUsers: any[] = [];
    usersSnap.forEach(doc => {
      total++;
      const d = doc.data();
      if (d.status === "pending") pending++;
      if (d.status === "active") active++;
      recentUsers.push({ id: doc.id, ...d });
    });
    // Sort by createdAt desc and take 5
    recentUsers = recentUsers
      .filter(u => u.createdAt)
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      .slice(0, 5);
    setUserStats({ total, pending, active, recent: recentUsers });
  };

  // Fetch recent requests (only those by this employee or city-wide)
  const fetchRecentRequests = async () => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"), limit(5));
    const snap = await getDocs(q);
    setRecentRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch recent reports (if any for employees)
  const fetchRecentReports = async () => {
    const q = query(collection(db, "incident_reports"), orderBy("createdAt", "desc"), limit(5));
    const snap = await getDocs(q);
    setRecentReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch weather and all employee data
  const fetchAll = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);

      // Weather
      const apiKey = "475dad9f469397c42f28ed2ce92b2537";
      try {
        const weatherResp = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${apiKey}`
        );
        setWeather(weatherResp.data);
      } catch (err) {
        setWeather(null);
      }

      // Employee profile
      if (user?.uid) await fetchEmployeeProfile(user.uid);

      // Stats and recent data
      await fetchStats();
      await fetchRecentRequests();
      await fetchRecentReports();
    } catch (e) {
      // Handle error
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
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
      case "FontAwesome":
        return <FontAwesome name={iconName as any} size={size} color={color} />;
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

  // Helper for 2-column quick actions
  const getQuickActionRows = () => {
    const rows = [];
    for (let i = 0; i < quickActions.length; i += 2) {
      rows.push(quickActions.slice(i, i + 2));
    }
    return rows;
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
        {/* Header with greeting */}
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
              </Text>
              <Text style={{ 
                fontSize: isTablet ? 28 : 24, 
                fontWeight: "bold", 
                color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" 
              }}>
                {employeeProfile?.fullName
                  ? employeeProfile.fullName
                  : user?.email
                    ? user.email.split('@')[0]
                    : "Employee"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Weather Card */}
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

        {/* Quick Actions (2 columns) */}
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
            gap: 14,
            marginBottom: 24,
            paddingHorizontal: 24,
          }}>
            {getQuickActionRows().map((row, idx) => (
              <View key={idx} style={{ flexDirection: "row", gap: 14 }}>
                {row.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => router.push(action.route as any)}
                    style={{
                      flex: 1,
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
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* User Overview */}
        <Animated.View entering={FadeIn.delay(300).duration(600)}>
          <View style={{
            marginHorizontal: 24,
            marginBottom: 24,
            flexDirection: "row",
            gap: 16,
            flexWrap: "wrap"
          }}>
            {/* Users */}
            <LinearGradient
              colors={['#6E45E2', '#89D4CF']}
              style={{
                flex: 1,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                minWidth: 160,
                marginRight: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="users" size={24} color="#fff" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Users</Text>
              <Text style={{ color: "#fff", fontSize: 14, marginTop: 4 }}>Total: {userStats.total}</Text>
              <Text style={{ color: "#fff", fontSize: 14 }}>Pending: {userStats.pending}</Text>
              <Text style={{ color: "#fff", fontSize: 14 }}>Active: {userStats.active}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Recent User Registrations */}
        <Animated.View entering={FadeIn.delay(350).duration(600)}>
          <View style={{
            marginHorizontal: 24,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Text style={{
              fontWeight: "600",
              fontSize: 18,
              color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A"
            }}>
              Recent User Registrations
            </Text>
          </View>
          <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
            {userStats.recent.length === 0 ? (
              <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B" }}>No recent users.</Text>
            ) : (
              userStats.recent.map((u) => (
                <View key={u.id} style={{
                  backgroundColor: colorScheme === "dark" ? "#232946" : "#F3F6FD",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <View>
                    <Text style={{ fontWeight: "bold", color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" }}>
                      {u.name || u.fullName || u.email || "User"}
                    </Text>
                    <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B", fontSize: 13 }}>
                      {u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : ""}
                    </Text>
                  </View>
                  <Text style={{ color: "#6E45E2", fontWeight: "bold", fontSize: 13 }}>
                    {u.createdAt?.toDate
                      ? u.createdAt.toDate().toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Recent Requests */}
        <Animated.View entering={FadeIn.delay(400).duration(600)}>
          <View style={{
            marginHorizontal: 24,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Text style={{
              fontWeight: "600",
              fontSize: 18,
              color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A"
            }}>
              Recent Requests
            </Text>
            <TouchableOpacity onPress={() => router.push("/Requests" as any)}>
              <Text style={{
                color: "#6E45E2",
                fontSize: 14,
                fontWeight: "500"
              }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
            {recentRequests.length === 0 ? (
              <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B" }}>No recent requests.</Text>
            ) : (
              recentRequests.map((req) => (
                <View key={req.id} style={{
                  backgroundColor: colorScheme === "dark" ? "#232946" : "#F3F6FD",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <View>
                    <Text style={{ fontWeight: "bold", color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" }}>
                      {req.resourceName || req.type || "Request"}
                    </Text>
                    <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B", fontSize: 13 }}>
                      {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : ""}
                      {req.quantity ? ` • Qty: ${req.quantity}` : ""}
                    </Text>
                  </View>
                  <Text style={{ color: "#6E45E2", fontWeight: "bold", fontSize: 13 }}>
                    {req.createdAt?.toDate
                      ? req.createdAt.toDate().toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Recent Reports */}
        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <View style={{
            marginHorizontal: 24,
            marginBottom: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Text style={{
              fontWeight: "600",
              fontSize: 18,
              color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A"
            }}>
              Recent Reports
            </Text>
            <TouchableOpacity onPress={() => router.push("/Recent-Reports" as any)}>
              <Text style={{
                color: "#6E45E2",
                fontSize: 14,
                fontWeight: "500"
              }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
            {recentReports.length === 0 ? (
              <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B" }}>No recent reports.</Text>
            ) : (
              recentReports.map((rep) => (
                <View key={rep.id} style={{
                  backgroundColor: colorScheme === "dark" ? "#232946" : "#F3F6FD",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <View>
                    <Text style={{ fontWeight: "bold", color: colorScheme === "dark" ? "#F8FAFC" : "#0F172A" }}>
                      {rep.category || rep.title || "Report"}
                    </Text>
                    <Text style={{ color: colorScheme === "dark" ? "#94A3B8" : "#64748B", fontSize: 13 }}>
                      {rep.status ? rep.status.charAt(0).toUpperCase() + rep.status.slice(1) : ""}
                    </Text>
                  </View>
                  <Text style={{ color: "#FF4757", fontWeight: "bold", fontSize: 13 }}>
                    {rep.createdAt?.toDate
                      ? rep.createdAt.toDate().toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}