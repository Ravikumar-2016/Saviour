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

const heatSafetyRules = [
  {
    icon: "thermometer-alert",
    text: "Stay indoors between 12pm-4pm when temperatures peak (especially May-June)"
  },
  {
    icon: "water",
    text: "Drink 2-3 liters of water daily (even if not thirsty) - avoid alcohol/caffeine"
  },
  {
    icon: "hat-fedora",
    text: "Wear light-colored, loose cotton clothes with wide-brimmed hats outdoors"
  },
  {
    icon: "fan",
    text: "Use damp cloths on neck/wrists and take cool showers to lower body temperature"
  },
  {
    icon: "home-thermometer",
    text: "Keep living spaces cool: Use curtains, cross-ventilation, and damp sheets"
  },
  {
    icon: "car-brake-alert",
    text: "Never leave children/pets in parked vehicles (temperature rises rapidly)"
  },
  {
    icon: "medical-bag",
    text: "Recognize heatstroke signs: High body temp, confusion, dry skin, rapid pulse"
  }
];

const vulnerableGroups = [
  "Outdoor workers (construction, farming)",
  "Elderly (65+ years)",
  "Children under 5",
  "Pregnant women",
  "People with chronic illnesses",
  "Street dwellers",
  "Athletes training outdoors"
];

const coolingSolutions = [
  "DIY cooler: Wet towel + fan",
  "Potted plants for shade",
  "Reflective window films",
  "Cooling peppermint spray",
  "Pulpy fruits (watermelon, cucumber)",
  "Cotton curtains soaked in water",
  "Stay on lower floors (heat rises)"
];

interface HeatSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const HeatSafety = ({ visible, onClose }: HeatSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#FF5722'; // Orange-red for heat alerts

  const handleCallEmergency = () => {
    Linking.openURL('tel:108'); // Emergency number in most Indian states
  };

  const openIMD = () => {
    Linking.openURL('https://mausam.imd.gov.in/heatwave/');
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
              Extreme Heat Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="thermometer-high" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                IMD Heatwave Threshold: ≥40°C Plains / ≥30°C Hills / 4.5°C above normal
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Survival Strategies:
            </Text>
            {heatSafetyRules.map((rule, idx) => (
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

            <View style={styles.twoColumnSection}>
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: themeColor }]}>High-Risk Groups:</Text>
                {vulnerableGroups.map((group, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="alert" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {group}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: themeColor }]}>Low-Cost Cooling:</Text>
                {coolingSolutions.map((solution, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="snow" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {solution}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.emergencySection}>
              <Text style={[styles.emergencyTitle, { color: themeColor }]}>
                Heatstroke First Aid:
              </Text>
              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>1</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Move to shade, remove excess clothing
                  </Text>
                </View>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>2</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Cool with wet cloths/ice packs (neck, armpits, groin)
                  </Text>
                </View>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>3</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Hydrate with ORS/lemon water (no alcohol)
                  </Text>
                </View>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>4</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Seek medical help immediately
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: themeColor }]}
              onPress={handleCallEmergency}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Heat Helpline: 108</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkButton, { borderColor: themeColor }]}
              onPress={openIMD}
            >
              <MaterialCommunityIcons name="weather-sunny" size={18} color={themeColor} />
              <Text style={[styles.linkText, { color: themeColor }]}>
                IMD Heatwave Alerts
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Check on neighbors during heatwaves - especially elderly living alone
            </Text>
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
  twoColumnSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  column: {
    width: '48%',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  emergencySection: {
    marginTop: 16,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepsContainer: {
    gap: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
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

export default HeatSafety;