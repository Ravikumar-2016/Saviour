import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Linking
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const tsunamiSafetyRules = [
  {
    icon: "alert-octagon",
    text: "Recognize natural warnings: Strong earthquake, unusual sea level changes, loud ocean roar"
  },
  {
    icon: "run-fast",
    text: "Don't wait for official alerts - immediately move inland/to higher ground (at least 15m elevation)"
  },
  {
    icon: "sign-direction",
    text: "Know your community's evacuation routes and safe zones (marked with blue boards in coastal areas)"
  },
  {
    icon: "clock-alert",
    text: "Remember: Tsunamis can arrive within minutes in India (e.g., 2004 tsunami reached Tamil Nadu in 2 hours)"
  },
  {
    icon: "home-alert",
    text: "Move to upper floors of concrete buildings if you can't evacuate inland (vertical evacuation)"
  },
  {
    icon: "waves",
    text: "Never go to the coast to watch a tsunami - first wave may not be the largest"
  },
  {
    icon: "radio",
    text: "Monitor All India Radio (AIR) 104 FM for official updates after initial evacuation"
  }
];

const tsunamiKitItems = [
  "Life jackets for each family member",
  "Waterproof document bag (Aadhaar, insurance)",
  "Emergency cash (small denominations)",
  "Portable NOAA weather radio",
  "High-energy snacks (3-day supply)",
  "Medicines + first aid kit",
  "Whistle + flashlight",
  "Extra batteries + power bank"
];

interface TsunamiSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const TsunamiSafety = ({ visible, onClose }: TsunamiSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#00ACC1'; // Teal for tsunami

  const handleCallEmergency = () => {
    Linking.openURL('tel:1070'); // NDMA Disaster Helpline
  };

  const openINCOIS = () => {
    Linking.openURL('https://incois.gov.in/tsunami');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, colorScheme === 'dark' ? styles.dark : styles.light]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={colorScheme === 'dark' ? '#fff' : '#222'} />
          </TouchableOpacity>
          
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: themeColor }]}>
              Tsunami Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="waves" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                High-risk zones: Tamil Nadu, AP, Kerala, Odisha, Andaman & Nicobar
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Immediate Response:
            </Text>
            {tsunamiSafetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <MaterialCommunityIcons 
                  name={rule.icon as any}
                  size={22} 
                  color={themeColor} 
                  style={{ marginRight: 10 }} 
                />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule.text}
                </Text>
              </View>
            ))}

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Tsunami Go-Bag:
            </Text>
            <View style={styles.kitGrid}>
              {tsunamiKitItems.map((item, idx) => (
                <View key={idx} style={styles.kitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={themeColor} />
                  <Text style={[styles.kitText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.phaseContainer}>
              <Text style={[styles.phaseTitle, { color: themeColor }]}>Before</Text>
              <Text style={[styles.phaseText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                • Know evacuation routes and safe zones
                {"\n"}• Participate in community drills (held annually on Nov 5 in India)
              </Text>

              <Text style={[styles.phaseTitle, { color: themeColor, marginTop: 12 }]}>During</Text>
              <Text style={[styles.phaseText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                • Move inland immediately (don't wait for official warning)
                {"\n"}• Climb to upper floors if trapped
              </Text>

              <Text style={[styles.phaseTitle, { color: themeColor, marginTop: 12 }]}>After</Text>
              <Text style={[styles.phaseText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                • Wait for official 'all clear' before returning
                {"\n"}• Avoid floodwaters - may contain hazards
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: themeColor }]}
              onPress={handleCallEmergency}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Disaster Helpline: 1070</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkButton, { borderColor: themeColor }]}
              onPress={openINCOIS}
            >
              <MaterialCommunityIcons name="web" size={18} color={themeColor} />
              <Text style={[styles.linkText, { color: themeColor }]}>
                INCOIS Tsunami Warnings
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '85%',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  light: {
    backgroundColor: '#fff',
  },
  dark: {
    backgroundColor: '#23272f',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 6,
  },
  content: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  alertText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  kitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  kitItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kitText: {
    fontSize: 14,
    marginLeft: 6,
  },
  phaseContainer: {
    marginTop: 16,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseText: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  linkText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default TsunamiSafety;