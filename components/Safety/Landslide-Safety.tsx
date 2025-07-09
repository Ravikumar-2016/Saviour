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

const landslideSafetyRules = [
  {
    icon: "home-alert",
    text: "Watch for warning signs: New cracks in walls/roads, tilting trees, sudden water flow changes"
  },
  {
    icon: "calendar-alert",
    text: "Be extra alert during monsoon (June-Sept) and after earthquakes in hilly areas"
  },
  {
    icon: "sign-direction",
    text: "Know evacuation routes to stable ground (usually perpendicular to landslide path)"
  },
  {
    icon: "weather-pouring",
    text: "Listen for unusual sounds like trees cracking or boulders knocking during heavy rain"
  },
  {
    icon: "home-export",
    text: "If indoors during landslide: Stay inside, take cover under sturdy furniture"
  },
  {
    icon: "run-fast",
    text: "If outdoors: Move quickly to nearest high ground away from slide path"
  },
  {
    icon: "car-brake-alert",
    text: "If driving: Watch for collapsed pavement, mud, fallen rocks - abandon vehicle if needed"
  }
];

const vulnerableAreas = [
  "Houses near steep slopes",
  "Areas where landslides occurred before",
  "Valleys near mountain slopes",
  "Road cuts in hilly terrain",
  "River banks and erosion areas"
];

const preparednessItems = [
  "Emergency contact list (local authorities)",
  "Battery-powered radio",
  "First aid kit + essential medicines",
  "Sturdy shoes + gloves",
  "Whistle for signaling",
  "Important documents (waterproof bag)",
  "Cash (ATMs may be inaccessible)"
];

interface LandslideSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const LandslideSafety = ({ visible, onClose }: LandslideSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#8D6E63'; // Brown for landslides

  const handleCallEmergency = () => {
    Linking.openURL('tel:108'); // Emergency number in most Indian states
  };

  const openNDMA = () => {
    Linking.openURL('https://ndma.gov.in/Natural-Hazards/Landslides');
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
              Landslide Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="alert" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                High-risk zones: Himalayas, Western Ghats, Northeast India
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Immediate Response:
            </Text>
            {landslideSafetyRules.map((rule, idx) => (
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
                <Text style={[styles.columnTitle, { color: themeColor }]}>Vulnerable Areas:</Text>
                {vulnerableAreas.map((area, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="alert-circle" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {area}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: themeColor }]}>Preparedness Kit:</Text>
                {preparednessItems.map((item, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="checkmark-circle" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Preventive Measures:
            </Text>
            <View style={styles.preventionContainer}>
              <View style={styles.preventionItem}>
                <MaterialCommunityIcons name="home-edit" size={20} color={themeColor} />
                <Text style={[styles.preventionText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  Plant deep-rooted vegetation on slopes
                </Text>
              </View>
              <View style={styles.preventionItem}>
                <MaterialCommunityIcons name="pipe" size={20} color={themeColor} />
                <Text style={[styles.preventionText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  Proper drainage to reduce water flow
                </Text>
              </View>
              <View style={styles.preventionItem}>
                <MaterialCommunityIcons name="wall" size={20} color={themeColor} />
                <Text style={[styles.preventionText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  Retaining walls for unstable slopes
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: themeColor }]}
              onPress={handleCallEmergency}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Emergency: 108</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkButton, { borderColor: themeColor }]}
              onPress={openNDMA}
            >
              <MaterialCommunityIcons name="web" size={18} color={themeColor} />
              <Text style={[styles.linkText, { color: themeColor }]}>
                NDMA Landslide Guidelines
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
  preventionContainer: {
    marginTop: 12,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preventionText: {
    fontSize: 14,
    marginLeft: 8,
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

export default LandslideSafety;