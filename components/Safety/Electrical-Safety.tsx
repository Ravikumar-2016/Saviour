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
import { Ionicons } from '@expo/vector-icons';

const electricalSafetyRules = [
  "Always turn off power at the mains before working on electrical circuits.",
  "Never touch electrical appliances with wet hands or while standing on wet surfaces.",
  "Use proper insulated tools when handling electrical wiring.",
  "Replace frayed or damaged cords immediately - don't tape over them.",
  "Use sockets safely - don't overload them with multiple adapters.",
  "Install child safety caps on all unused electrical outlets.",
  "Keep electrical devices away from water sources (bathrooms, kitchens).",
  "Use appliances with ISI mark certification for safety standards.",
  "Never yank cords from the wall - pull by the plug instead.",
  "During storms/unstable power, unplug sensitive electronics.",
  "Use proper wattage bulbs in light fixtures to prevent overheating.",
  "Know your home's circuit breaker locations and how to reset them.",
  "Never use metal objects to retrieve items from appliances (like toasters).",
  "If someone receives electric shock: Don't touch them directly - turn off power first.",
  "Install Residual Current Circuit Breakers (RCCB) for added protection.",
  "Regularly check for hot switches/outlets which indicate wiring problems."
];

const ElectricalSafety: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const themeColor = '#673ab7'; // Deep purple for electrical safety

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, colorScheme === 'dark' ? styles.dark : styles.light]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={colorScheme === 'dark' ? '#fff' : '#222'} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: themeColor }]}>
              Electrical Safety Guide (India)
            </Text>
            
            <View style={[styles.warningBanner, { backgroundColor: `${themeColor}20` }]}>
              <Ionicons name="warning" size={24} color={themeColor} />
              <Text style={[styles.warningText, { color: themeColor }]}>
                Electricity can kill instantly - always prioritize safety!
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Critical Electrical Safety Rules:
            </Text>
            {electricalSafetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Ionicons name="flash" size={20} color={themeColor} style={{ marginRight: 8 }} />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule}
                </Text>
              </View>
            ))}

            <View style={styles.emergencyContact}>
              <Ionicons name="alert-circle" size={18} color={themeColor} style={{ marginRight: 6 }} />
              <Text style={[styles.emergencyText, { color: themeColor }]}>
                Electrical Emergency: Turn off power and call electrician immediately
              </Text>
            </View>

            <View style={styles.standardsNote}>
              <Ionicons name="ribbon" size={18} color={themeColor} style={{ marginRight: 6 }} />
              <Text style={[styles.standardsText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                Look for ISI mark or BIS certification on electrical products
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  warningText: {
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
    borderRadius: 8,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  standardsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  standardsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default ElectricalSafety;