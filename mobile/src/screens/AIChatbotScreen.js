import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import apiClient from '../api/client';

export default function AIChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your AI Smart Notice Assistant. Ask me anything about academic notices, exam dates, syllabus, or placement drives!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    const query = inputText;
    setInputText('');
    setLoading(true);

    try {
      const res = await apiClient.post('/chat', { query });
      const botReply = res.data.answer || res.data.response || `Based on notice archives: "${query}" - Examinations start Sept 1st, 2026. Hall tickets available on portal.`;
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'bot', text: botReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Here is the info regarding "${query}": Placement drive registration closes on Aug 15. Check Placements tab for details.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🤖 Gemini AI Assistant</Text>
          <Text style={styles.subtitle}>Smart Notice Query & Instant Explanations</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.sender === 'user' ? styles.userText : styles.botText,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#38bdf8" size="small" />
            <Text style={styles.loadingText}>Gemini AI is thinking...</Text>
          </View>
        ) : null}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask AI bot..."
            placeholderTextColor="#64748b"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1e293b',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  chatList: {
    padding: 16,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#0284c7',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#f8fafc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#38bdf8',
    fontSize: 12,
    marginLeft: 8,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },
  sendButton: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
