import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Colors } from "../../constants/Colors";
import { resolveAvatarUrl } from "./resolveAvatarUrl";

type Props = {
  title: string;
  avatar?: string;
  subtitle?: string;
};

export default function ChatHeader({ title, avatar, subtitle }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    resolveAvatarUrl(avatar).then((uri) => {
      if (mounted) setAvatarUri(uri);
    });
    return () => { mounted = false; };
  }, [avatar]);

  return (
    <View style={[styles.header, { backgroundColor: Colors[colorScheme].card }]}>
      <Image
        source={avatarUri ? { uri: avatarUri } : require("../../assets/images/default-avatar.png")}
        style={styles.avatar}
      />
      <View>
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: Colors[colorScheme].textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
    minHeight: 48,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  title: { fontWeight: "bold", fontSize: 18 },
  subtitle: { fontSize: 13, marginTop: 2 },
});