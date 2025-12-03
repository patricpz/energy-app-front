import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Message = {
  id: number;
  text: string;
  timestamp: Date;
  type: 'sent' | 'received';
};

export default function WebSocketScreen() {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const wsUrl = 'wss://energy-app-backend-nqub.onrender.com/ws';
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      addMessage('Connected to WebSocket server', 'received');
    };

    ws.current.onmessage = (e) => {
      console.log('Message received:', e.data);
      addMessage(e.data, 'received');
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
      addMessage('Error connecting to WebSocket server', 'received');
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      addMessage('Disconnected from WebSocket server', 'received');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const addMessage = (text: string, type: 'sent' | 'received') => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (messageInput.trim() === '' || !ws.current) return;
    
    try {
      ws.current.send(messageInput);
      addMessage(messageInput, 'sent');
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Failed to send message', 'received');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingTop: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 6,
      backgroundColor: isConnected ? '#4CAF50' : '#F44336',
    },
    statusText: {
      color: isConnected ? '#4CAF50' : '#F44336',
      fontWeight: '500',
    },
    messagesContainer: {
      flex: 1,
      marginBottom: 16,
    },
    messageRow: {
      marginBottom: 12,
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 4,
    },
    receivedMessage: {
      backgroundColor: theme.colors.card,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
    },
    sentMessage: {
      backgroundColor: theme.colors.primary,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    messageText: {
      fontSize: 16,
    },
    receivedText: {
      color: theme.colors.text,
    },
    sentText: {
      color: '#FFFFFF',
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.colors.text,
      marginRight: 8,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebSocket</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.type === 'sent' && { alignItems: 'flex-end' },
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.type === 'received'
                  ? styles.receivedMessage
                  : styles.sentMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === 'received'
                    ? styles.receivedText
                    : styles.sentText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.type === 'sent' && { textAlign: 'right' },
                ]}
              >
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!isConnected || messageInput.trim() === ''}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
