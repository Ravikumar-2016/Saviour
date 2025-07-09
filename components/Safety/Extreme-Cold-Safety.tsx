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

const coldSafetyRules = [
  {
    icon: "thermometer-low",
    text: "Layer clothing: Cotton (inner), Wool (middle), Windproof (outer) - especially in hill stations"
  },
  {
    icon: "home-thermometer",
    text: "Maintain room temperature at 18-20°C to prevent hypothermia (use safe heating methods)"
  },
  {
    icon: "weather-hail",
    text: "Watch for frostbite signs: White/waxy skin, numbness on fingers/toes/nose/ears"
  },
  {
    icon: "food-drumstick",
    text: "Eat warm, high-calorie foods (nuts, ghee, dried fruits) and drink warm fluids frequently"
  },
  {
    icon: "car-brake-alert",
    text: "Winterize vehicles: Check antifreeze, keep fuel tank half-full, carry emergency kit"
  },
  {
    icon: "pipe-disconnected",
    text: "Prevent frozen pipes: Let faucets drip slightly during extreme cold in North India"
  },
  {
    icon: "medical-bag",
    text: "Recognize hypothermia: Shivering, slurred speech, drowsiness (urgent warming needed)"
  }
];

const vulnerableGroups = [
  "Elderly (especially with poor circulation)",
  "Homeless/street dwellers",
  "Infants (lose heat quickly)",
  "Outdoor workers",
  "People with chronic illnesses",
  "High-altitude travelers",
  "Mountain villagers"
];

const winterKitItems = [
  "Thermal blankets",
  "Hand/foot warmers",
  "Portable heater (safe type)",
  "Insulated water bottle",
  "High-energy snacks",
  "Extra medicines",
  "Battery-powered radio",
  "Rock salt for icy walkways"
];

interface ColdSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const ColdSafety = ({ visible, onClose }: ColdSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#2196F3'; // Blue for cold alerts

  const handleCallEmergency = () => {
    Linking.openURL('tel:108'); // Emergency number in northern states
  };

  const openIMD = () => {
    Linking.openURL('https://mausam.imd.gov.in/coldwave/');
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
              Extreme Cold Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="snowflake" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                IMD Coldwave Threshold: ≤10°C Plains / ≤0°C Hills / 4.5°C below normal
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Protection Strategies:
            </Text>
            {coldSafetyRules.map((rule, idx) => (
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
                <Text style={[styles.columnTitle, { color: themeColor }]}>Winter Kit:</Text>
                {winterKitItems.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="checkmark-circle" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.emergencySection}>
              <Text style={[styles.emergencyTitle, { color: themeColor }]}>
                Hypothermia First Aid:
              </Text>
              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>1</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Move to warm place (avoid direct heat source)
                  </Text>
                </View>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>2</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Remove wet clothing, wrap in dry blankets
                  </Text>
                </View>
                <View style={styles.step}>
                  <Text style={[styles.stepNumber, { backgroundColor: themeColor }]}>3</Text>
                  <Text style={[styles.stepText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                    Give warm, sweet drinks (no alcohol)
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

            <View style={styles.tipBox}>
              <MaterialCommunityIcons name="home-heart" size={20} color={themeColor} />
              <Text style={[styles.tipText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                For traditional homes in Kashmir/Ladakh: Use kangri (fire pot) safely with proper ventilation to prevent carbon monoxide poisoning
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: themeColor }]}
              onPress={handleCallEmergency}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Cold Helpline: 108</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkButton, { borderColor: themeColor }]}
              onPress={openIMD}
            >
              <MaterialCommunityIcons name="weather-cloudy" size={18} color={themeColor} />
              <Text style={[styles.linkText, { color: themeColor }]}>
                IMD Coldwave Alerts
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Check on elderly neighbors daily during cold waves - especially in North Indian cities
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
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
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

export default ColdSafety;