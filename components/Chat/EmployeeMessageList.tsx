import React, { useRef, useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import EmployeeMessageBubble from "./EmployeeMessageBubble";
import { ChatMessage } from "./EmployeeChatRoom";

type Props = {
  messages: ChatMessage[];
  currentUserId?: string;
  onProfilePress?: (msg: ChatMessage) => void;
};

export default function EmployeeMessageList({ messages, currentUserId, onProfilePress }: Props) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      inverted
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EmployeeMessageBubble
          message={item}
          isOwn={item.userId === currentUserId}
          onProfilePress={onProfilePress}
        />
      )}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 24 },
});