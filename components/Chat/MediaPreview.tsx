import React from "react";
import { Image, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Video, Audio, ResizeMode } from "expo-av";

type Props = {
  media: string;
  mediaType?: "image" | "video" | "audio";
};

export default function MediaPreview({ media, mediaType }: Props) {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function playSound() {
    try {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: media },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded || !status.isPlaying) {
            setIsPlaying(false);
          }
        });
      }
    } catch (e) {
      console.error("Error playing audio:", e);
    }
  }

  async function pauseSound() {
    try {
      if (sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Error pausing audio:", e);
    }
  }

  if (mediaType === "image") {
    return (
      <Image
        source={{ uri: media.startsWith("data:") ? media : `data:image/jpeg;base64,${media}` }}
        style={styles.image}
      />
    );
  }
  if (mediaType === "video") {
    return (
      <Video
        source={{ uri: media }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
      />
    );
  }
  if (mediaType === "audio") {
    return (
      <View style={styles.audio}>
        <Text style={{ marginBottom: 4 }}>{isPlaying ? "Playing..." : "Paused"}</Text>
        <TouchableOpacity onPress={isPlaying ? pauseSound : playSound} style={styles.audioBtn}>
          <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
            {isPlaying ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.unsupported}>
      <Text>Unsupported media</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: 180, height: 180, borderRadius: 10, marginBottom: 6 },
  video: { width: 180, height: 180, borderRadius: 10, marginBottom: 6 },
  audio: { width: 180, height: 60, borderRadius: 10, marginBottom: 6, justifyContent: "center", alignItems: "center" },
  audioBtn: { padding: 8, backgroundColor: "#e0e7ff", borderRadius: 8 },
  unsupported: { padding: 10, backgroundColor: "#eee", borderRadius: 8 },
});