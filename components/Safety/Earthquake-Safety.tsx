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

const safetyRules = [
  "Drop, Cover, and Hold On: Get down to your hands and knees, cover your head and neck, and hold on to something sturdy.",
  "Stay indoors until the shaking stops. Move away from windows, glass, and heavy objects.",
  "If outside, move to an open area away from buildings, trees, and power lines.",
  "If driving, stop safely and stay inside the vehicle until the shaking stops.",
  "After the shaking, check yourself and others for injuries and provide first aid if needed.",
  "Be prepared for aftershocks and avoid using elevators.",
  "Listen to official information and follow instructions from authorities.",
  "Do not use matches, lighters, or electrical switches if you suspect a gas leak.",
  "Keep emergency supplies ready: water, food, torch, batteries, first aid kit, and important documents.",
  "Help children, elderly, and differently-abled persons to safety first."
];

const EarthquakeSafety: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
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
              Earthquake Safety Guide (India)
            </Text>
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Quick Safety Rules:
            </Text>
            {safetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Ionicons name="checkmark-circle" size={20} color="#ff9800" style={{ marginRight: 8 }} />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule}
                </Text>
              </View>
            ))}
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Watch: Earthquake Safety Video
            </Text>
            <Video
              source={require('../../assets/safety-videos/earthquake_safety.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              style={styles.video}
            />
            <View style={styles.offlineNote}>
              <Ionicons name="cloud-download" size={18} color="#ff9800" style={{ marginRight: 6 }} />
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
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#ff9800',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default EarthquakeSafety;