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

const lightningSafetyRules = [
  {
    icon: "weather-lightning",
    text: "30-30 Rule: If thunder follows lightning within 30 seconds, go indoors. Wait 30 minutes after last thunder before going out"
  },
  {
    icon: "home-lightning-bolt",
    text: "Safe shelters: Fully enclosed buildings with wiring/plumbing (not sheds or open structures)"
  },
  {
    icon: "car-brake-alert",
    text: "If outdoors: Avoid open fields, hilltops, and isolated trees. Crouch low if caught outside"
  },
  {
    icon: "water-off",
    text: "Avoid plumbing and water sources during thunderstorms (lightning can travel through pipes)"
  },
  {
    icon: "power-plug-off",
    text: "Unplug electrical appliances to prevent surge damage (India's voltage fluctuations worsen this)"
  },
  {
    icon: "cellphone-off",
    text: "Avoid corded phones and electronic devices connected to power"
  },
  {
    icon: "umbrella-closed",
    text: "Never use umbrellas with metal parts during thunderstorms"
  }
];

const vulnerableActivities = [
  "Farming in open fields",
  "Construction work",
  "Bathing/showering",
  "Swimming/boating",
  "Golfing/cricket",
  "Mountain climbing",
  "Working with electrical equipment"
];

const firstAidSteps = [
  "Call 108 immediately (lightning victims don't carry charge)",
  "Begin CPR if needed (lightning often causes cardiac arrest)",
  "Treat burns with cool water (no ointments)",
  "Check for other injuries (broken bones, hearing damage)",
  "Keep victim warm and calm"
];

interface LightningSafetyProps {
  visible: boolean;
  onClose: () => void;
}

const LightningSafety = ({ visible, onClose }: LightningSafetyProps) => {
  const colorScheme = useColorScheme();
  const themeColor = '#FFC107'; // Amber for lightning

  const handleCallEmergency = () => {
    Linking.openURL('tel:108'); // Emergency number in most Indian states
  };

  const openIMD = () => {
    Linking.openURL('https://mausam.imd.gov.in/thunderstorm/');
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
              Lightning Safety (India)
            </Text>

            <View style={[styles.alertBanner, { backgroundColor: `${themeColor}20` }]}>
              <MaterialCommunityIcons name="weather-lightning" size={24} color={themeColor} />
              <Text style={[styles.alertText, { color: themeColor }]}>
                High-risk states: WB, Odisha, Jharkhand, MP, Maharashtra (Apr-June & Sept-Nov)
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Immediate Actions:
            </Text>
            {lightningSafetyRules.map((rule, idx) => (
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
                <Text style={[styles.columnTitle, { color: themeColor }]}>Risky Activities:</Text>
                {vulnerableActivities.map((activity, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="alert" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {activity}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: themeColor }]}>First Aid Steps:</Text>
                {firstAidSteps.map((step, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Ionicons name="medical" size={16} color={themeColor} />
                    <Text style={[styles.listText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Indian Monsoon Lightning:
            </Text>
            <View style={styles.infoBox}>
              <Text style={[styles.infoText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                • India sees ~2,500 lightning deaths annually (highest globally)
                {"\n"}• Pre-monsoon (Apr-May) most dangerous in East/Northeast
                {"\n"}• Post-monsoon (Oct-Nov) risky in South Peninsula
                {"\n"}• Install lightning arresters in rural homes
              </Text>
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
              onPress={openIMD}
            >
              <MaterialCommunityIcons name="weather-cloudy" size={18} color={themeColor} />
              <Text style={[styles.linkText, { color: themeColor }]}>
                IMD Thunderstorm Warnings
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
  infoBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
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

export default LightningSafety;