import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const fireSafetyRules = [
  "Install smoke alarms on every level of your home and test them monthly.",
  "Create and practice a fire escape plan with two ways out of every room.",
  "Never leave cooking unattended - it's the #1 cause of home fires.",
  "Keep flammable items at least 3 feet away from heat sources like stoves and heaters.",
  "Stop, Drop, and Roll if your clothes catch fire.",
  "In case of fire, crawl low under smoke to escape - cleaner air is near the floor.",
  "Never use water on grease fires - use a lid or fire extinguisher instead.",
  "Learn how to use a fire extinguisher (PASS method: Pull, Aim, Squeeze, Sweep).",
  "Check electrical cords for damage and don't overload outlets.",
  "If trapped, seal doors/vents with wet cloth and signal from window.",
  "Never re-enter a burning building - wait for firefighters.",
  "Keep matches/lighters locked away from children.",
  "Turn off/unplug appliances when not in use.",
  "Know your emergency numbers (101 for fire in India)."
];

const FireSafety: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, colorScheme === 'dark' ? styles.dark : styles.light]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={colorScheme === 'dark' ? '#fff' : '#222'} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Fire Safety Guide (India)
            </Text>
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Essential Fire Safety Rules:
            </Text>
            {fireSafetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Ionicons name="flame" size={20} color="#ff5722" style={{ marginRight: 8 }} />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule}
                </Text>
              </View>
            ))}
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Watch: Fire Safety Demonstration
            </Text>
            <Video
              source={require('../../assets/safety-videos/fire_safety.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              style={styles.video}
            />
            <View style={styles.emergencyContact}>
              <Ionicons name="alert-circle" size={18} color="#ff5722" style={{ marginRight: 6 }} />
              <Text style={[styles.emergencyText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                Fire Emergency Number (India): 101
              </Text>
            </View>
            <View style={styles.offlineNote}>
              <Ionicons name="cloud-download" size={18} color="#ff5722" style={{ marginRight: 6 }} />
              <Text style={[styles.offlineText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                Video is always available offline
              </Text>
            </View>
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 14,
    backgroundColor: '#000',
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: 8,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff5722',
  },
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#ff5722',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default FireSafety;