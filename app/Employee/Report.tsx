import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import * as Location from "expo-location";
import { db } from "../../lib/firebase";

const CATEGORIES = ["Medical", "Fire", "Crime", "Other"];
const URGENCIES = ["Low", "Medium", "High"];
const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function IncidentReportScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = colorScheme;
  const s = styles(theme);

  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [urgency, setUrgency] = useState(URGENCIES[1]);
  const [anonymous, setAnonymous] = useState(false);
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [images, setImages] = useState<{ uri: string; base64: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setContact(firebaseUser?.phoneNumber || "");
    });
    return unsub;
  }, []);

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required.");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.6,
    });
    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        base64: asset.base64 || "",
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!desc.trim()) {
      Alert.alert("Description required", "Please describe the incident.");
      return;
    }
    if (!user && !anonymous) {
      Alert.alert("Not logged in", "Please log in or submit anonymously.");
      return;
    }

    setUploading(true);
    try {
      const photoBase64s = images.map(img => img.base64);

      await addDoc(collection(db, "incident_reports"), {
        employeeId: anonymous ? null : user?.uid,
        desc,
        category,
        urgency,
        anonymous,
        contact: anonymous ? null : contact,
        location,
        photoBase64s,
        createdAt: Timestamp.now(),
        status: "Pending Review",
      });

      setDesc("");
      setImages([]);
      setCategory(CATEGORIES[0]);
      setUrgency(URGENCIES[1]);
      setAnonymous(false);
      setContact(user?.phoneNumber || "");
      setLocation(null);
      Alert.alert("Success", "Incident report submitted!");
    } catch (e) {
      console.log("Incident report error:", e);
      Alert.alert("Error", "Failed to submit report.");
    }
    setUploading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView contentContainerStyle={s.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.header}>Incident Report</Text>

          <Text style={s.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[s.chip, category === cat && s.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.label}>Urgency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {URGENCIES.map((urg) => (
              <TouchableOpacity
                key={urg}
                style={[s.chip, urgency === urg && s.chipActive]}
                onPress={() => setUrgency(urg)}
              >
                <Text style={[s.chipText, urgency === urg && s.chipTextActive]}>{urg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.row}>
            <Text style={s.label}>Submit Anonymously</Text>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              thumbColor={anonymous ? Colors[theme].tint : "#ccc"}
              trackColor={{ false: "#ccc", true: Colors[theme].tint + "55" }}
            />
          </View>

          {!anonymous && (
            <>
              <Text style={s.label}>Contact Number</Text>
              <TextInput
                style={s.input}
                value={contact}
                onChangeText={setContact}
                placeholder="Contact Number"
                placeholderTextColor={Colors[theme].textMuted}
                keyboardType="phone-pad"
              />
            </>
          )}

          <View style={s.row}>
            <Text style={s.label}>Location</Text>
            <TouchableOpacity style={s.locBtn} onPress={fetchLocation}>
              <Ionicons name="location" size={20} color={Colors[theme].tint} />
              <Text style={{ color: Colors[theme].tint, marginLeft: 4 }}>
                {location ? "Update" : "Add"}
              </Text>
            </TouchableOpacity>
            {location && (
              <Text style={{ marginLeft: 8, color: Colors[theme].textMuted }}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>

          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, { minHeight: 80 }]}
            value={desc}
            onChangeText={setDesc}
            placeholder="Describe what happened..."
            placeholderTextColor={Colors[theme].textMuted}
            multiline
          />

          <Text style={s.label}>Attach Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {images.map((img, idx) => (
              <View key={idx} style={s.imgPreviewWrap}>
                <Image
                  source={{ uri: "data:image/jpeg;base64," + img.base64 }}
                  style={s.imgPreview}
                />
                <TouchableOpacity style={s.imgRemoveBtn} onPress={() => removeImage(idx)}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={s.imgAddBtn} onPress={pickImage}>
              <Ionicons name="add" size={28} color={Colors[theme].tint} />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={s.submitBtnText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (theme: "light" | "dark") =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 40,
      backgroundColor: Colors[theme].background,
    },
    card: {
      backgroundColor: Colors[theme].card,
      borderRadius: 18,
      margin: 16,
      padding: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      fontSize: 22,
      fontWeight: "bold",
      color: Colors[theme].tint,
      marginBottom: 18,
    },
    label: {
      fontWeight: "600",
      color: Colors[theme].text,
      marginBottom: 4,
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[theme].border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "ios" ? 12 : 8,
      fontSize: 15,
      color: Colors[theme].text,
      backgroundColor: Colors[theme].inputBackground || Colors[theme].background,
      marginBottom: 8,
    },
    chip: {
      backgroundColor: Colors[theme].inputBackground || "#f3f4f6",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: Colors[theme].border,
      marginRight: 8,
    },
    chipActive: {
      backgroundColor: Colors[theme].tint,
      borderColor: Colors[theme].tint,
    },
    chipText: {
      fontSize: 14,
      color: Colors[theme].text,
    },
    chipTextActive: {
      color: "#fff",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginTop: 4,
    },
    locBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[theme].inputBackground || "#f3f4f6",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginLeft: 8,
    },
    imgPreviewWrap: {
      position: "relative",
      marginRight: 8,
    },
    imgPreview: {
      width: 70,
      height: 70,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    imgRemoveBtn: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "#fff",
      borderRadius: 12,
      elevation: 2,
    },
    imgAddBtn: {
      width: 70,
      height: 70,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors[theme].tint,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[theme].inputBackground || "#f3f4f6",
    },
    submitBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[theme].tint,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 18,
      marginTop: 18,
      alignSelf: "flex-end",
    },
    submitBtnText: {
      color: "#fff",
      fontWeight: "bold",
      marginLeft: 8,
      fontSize: 15,
    },
  });
