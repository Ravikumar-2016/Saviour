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

// Update icon names to use valid MaterialCommunityIcons names
const cycloneSafetyRules = [
  {
    icon: "home-circle-outline",
    text: "Reinforce your roof with storm shutters or wooden panels"
  },
  {
    icon: "weather-hurricane",
    text: "Identify the safest room (usually windowless interior room on lower floor)"
  },
  {
    icon: "food-apple-outline",
    text: "Store 3-day supply of dry food and 3 liters water per person daily"
  },
  {
    icon: "flash-outline",
    text: "Turn off electricity and gas mains when cyclone approaches"
  },
  {
    icon: "car-outline",
    text: "Park vehicles under cover, away from trees/power lines"
  },
  {
    icon: "alert-circle-outline",
    text: "Learn community warning signals and evacuation routes"
  },
  {
    icon: "phone-outline",
    text: "Keep mobile charged with emergency numbers saved"
  },
  {
    icon: "waves",
    text: "If in coastal area, move to higher ground immediately when warned"
  }
];

const cycloneKitItems = [
  "Torch with extra batteries",
  "First aid kit + medicines",
  "Important documents (waterproof bag)",
  "Cash (ATMs may not work)",
  "Emergency contact list",
  "Multi-tool/knife",
  "Portable phone charger",
  "Non-perishable food",
  "Water purification tablets"
];

interface CycloneSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const CycloneSafety = ({ visible, onClose }: CycloneSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#2196F3'; // Blue for cyclones

  const handleCallEmergency = () => {
    Linking.openURL('tel:1078'); // NDMA Helpline for cyclones
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
              Cyclone Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="weather-hurricane" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                IMD Color Codes: Yellow (Watch), Orange (Alert), Red (Take Action)
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Before Cyclone Season:
            </Text>
            {cycloneSafetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <MaterialCommunityIcons 
                  name={rule.icon as any} // Type assertion as workaround
                  size={22} 
                  color={themeColor} 
                  style={{ marginRight: 10 }} 
                />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule.text}
                </Text>
              </View>
            ))}

            {/* Rest of the component remains the same */}
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Emergency Kit Essentials:
            </Text>
            <View style={styles.kitGrid}>
              {cycloneKitItems.map((item, idx) => (
                <View key={idx} style={styles.kitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={themeColor} />
                  <Text style={[styles.kitText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              During Cyclone:
            </Text>
            <View style={styles.dosDonts}>
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: '#4CAF50' }]}>DO:</Text>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={18} color="#4CAF50" />
                  <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Stay indoors away from windows
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="checkmark" size={18} color="#4CAF50" />
                  <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Listen to All India Radio updates
                  </Text>
                </View>
              </View>
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: '#F44336' }]}>DON'T:</Text>
                <View style={styles.listItem}>
                  <Ionicons name="close" size={18} color="#F44336" />
                  <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Go outside during eye of storm
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Ionicons name="close" size={18} color="#F44336" />
                  <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Touch loose electrical wires
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: themeColor }]}
              onPress={handleCallEmergency}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>NDMA Helpline: 1078</Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Track cyclones on mausam.imd.gov.in or via IMD mobile app
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxHeight: '92%',
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
  dosDonts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  column: {
    width: '48%',
  },
  columnTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  listText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
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
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default CycloneSafety;