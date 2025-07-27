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

const firstAidSteps = [
  "Check the scene for safety before approaching the injured person.",
  "Call for emergency medical help if needed.",
  "If the person is unconscious, check for breathing and pulse.",
  "If not breathing, begin CPR if you are trained.",
  "Stop any bleeding by applying firm pressure with a clean cloth.",
  "Keep the injured person warm and comfortable.",
  "Do not move the person unless absolutely necessary.",
  "Reassure the injured person and stay with them until help arrives.",
  "If you suspect a fracture, immobilize the limb.",
  "Always wash your hands before and after giving first aid."
];

const FirstAidTutorial: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
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
              First Aid Tutorial (India)
            </Text>
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Essential First Aid Steps:
            </Text>
            {firstAidSteps.map((step, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Ionicons name="medkit" size={20} color="#4caf50" style={{ marginRight: 8 }} />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {step}
                </Text>
              </View>
            ))}
            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Watch: First Aid Video
            </Text>
            <Video
              source={require('../../assets/safety-videos/firstaid_tutorial.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              style={styles.video}
            />
            <View style={styles.offlineNote}>
              <Ionicons name="cloud-download" size={18} color="#4caf50" style={{ marginRight: 6 }} />
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
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#4caf50',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default FirstAidTutorial;