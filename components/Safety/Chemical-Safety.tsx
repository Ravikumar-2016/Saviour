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

const chemicalSafetyRules = [
  "Always read Safety Data Sheets (SDS) before handling any chemical",
  "Use proper personal protective equipment (PPE): gloves, goggles, lab coat",
  "Never mix chemicals unless you know the potential reactions",
  "Work in well-ventilated areas or use fume hoods",
  "Label all containers clearly with contents and hazards",
  "Store chemicals properly: flammable in fire cabinets, acids separately from bases",
  "Know emergency procedures for spills/exposure for each chemical",
  "Never smell or taste chemicals - use proper ventilation instead",
  "Wash hands thoroughly after handling any chemicals",
  "Dispose of chemical waste according to local regulations",
  "Keep emergency showers and eyewash stations accessible",
  "Understand GHS hazard pictograms and warning labels",
  "Store chemicals at appropriate temperatures and away from incompatible materials",
  "Transport chemicals in secondary containment",
  "Have spill kits appropriate for the chemicals you're using",
  "Know first aid measures for chemical exposure (eyes, skin, inhalation)"
];

const ChemicalSafety: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const themeColor = '#e91e63'; // Pink/red for chemical hazards

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, colorScheme === 'dark' ? styles.dark : styles.light]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color={colorScheme === 'dark' ? '#fff' : '#222'} />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: themeColor }]}>
              Chemical Safety Guide
            </Text>
            
            <View style={[styles.warningBanner, { backgroundColor: `${themeColor}20` }]}>
              <Ionicons name="skull" size={24} color={themeColor} />
              <Text style={[styles.warningText, { color: themeColor }]}>
                Chemical exposure can cause immediate and long-term health effects!
              </Text>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Essential Chemical Safety Rules:
            </Text>
            {chemicalSafetyRules.map((rule, idx) => (
              <View key={idx} style={styles.ruleRow}>
                <Ionicons name="flask" size={20} color={themeColor} style={{ marginRight: 8 }} />
                <Text style={[styles.ruleText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                  {rule}
                </Text>
              </View>
            ))}

            <View style={styles.ghsContainer}>
              <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                GHS Hazard Pictograms:
              </Text>
              <View style={styles.ghsGrid}>
                {/* Row 1 */}
                <View style={styles.ghsItem}>
                  <Ionicons name="warning" size={32} color="#ff0000" />
                  <Text style={[styles.ghsLabel, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Flammable</Text>
                </View>
                <View style={styles.ghsItem}>
                  <Ionicons name="skull" size={32} color="#000000" />
                  <Text style={[styles.ghsLabel, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Toxic</Text>
                </View>
                {/* Row 2 */}
                <View style={styles.ghsItem}>
                  <Ionicons name="alert-circle" size={32} color="#ff9900" />
                  <Text style={[styles.ghsLabel, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Corrosive</Text>
                </View>
                <View style={styles.ghsItem}>
                  <Ionicons name="flame" size={32} color="#ff0000" />
                  <Text style={[styles.ghsLabel, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Oxidizer</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
              Watch: Chemical Safety Protocol
            </Text>
            <Video
              source={require('../../assets/safety-videos/chemical_safety.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              useNativeControls
              style={styles.video}
            />

            <View style={[styles.emergencyContact, { borderColor: themeColor }]}>
              <Ionicons name="medical" size={18} color={themeColor} style={{ marginRight: 6 }} />
              <Text style={[styles.emergencyText, { color: themeColor }]}>
                Poison Control (India): 1800-116-117
              </Text>
            </View>

            <View style={styles.ppeSection}>
              <Text style={[styles.subtitle, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>
                Basic PPE for Chemical Handling:
              </Text>
              <View style={styles.ppeList}>
                <View style={styles.ppeItem}>
                  <Ionicons name="glasses" size={20} color={themeColor} />
                  <Text style={[styles.ppeText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Safety goggles</Text>
                </View>
                <View style={styles.ppeItem}>
                  <Ionicons name="hand-right" size={20} color={themeColor} />
                  <Text style={[styles.ppeText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Chemical-resistant gloves</Text>
                </View>
                <View style={styles.ppeItem}>
                  <Ionicons name="shirt" size={20} color={themeColor} />
                  <Text style={[styles.ppeText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Lab coat/apron</Text>
                </View>
                <View style={styles.ppeItem}>
                  <Ionicons name="cloud-outline" size={20} color={themeColor} />
                  <Text style={[styles.ppeText, colorScheme === 'dark' ? styles.textDark : styles.textLight]}>Respirator (if needed)</Text>
                </View>
              </View>
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
  ghsContainer: {
    marginTop: 16,
  },
  ghsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ghsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  ghsLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
    borderWidth: 1,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '600',
  },
  ppeSection: {
    marginTop: 16,
  },
  ppeList: {
    marginTop: 8,
  },
  ppeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ppeText: {
    fontSize: 15,
    marginLeft: 8,
  },
  textDark: {
    color: '#fff',
  },
  textLight: {
    color: '#222',
  },
});

export default ChemicalSafety;