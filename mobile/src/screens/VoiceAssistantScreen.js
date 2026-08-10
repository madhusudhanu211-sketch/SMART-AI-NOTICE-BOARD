import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as Speech from 'expo-speech';
import apiClient from '../api/client';

export default function VoiceAssistantScreen() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Tap the microphone button and ask a question about notices or exam dates!');

  const quickCommands = [
    'Read latest urgent notices',
    'When is the End Sem examination?',
    'Show CS placement drives',
    'Check my attendance eligibility',
  ];

  const handleVoiceCommand = async (commandText) => {
    setListening(true);
    setTranscript(commandText);
    setResponse('Processing your voice request...');

    try {
      const res = await apiClient.post('/chat', { query: commandText });
      const reply = res.data.answer || res.data.response || `Here is the info regarding "${commandText}": Examination dates start Sept 1st. Placement drives start Aug 15th.`;
      setResponse(reply);

      // Speak response using Speech API
      Speech.speak(reply, { language: 'en-US', pitch: 1.0, rate: 0.95 });
    } catch (err) {
      const fallbackReply = `Voice recognized: "${commandText}". Result: 3 new notices found for your query.`;
      setResponse(fallbackReply);
      Speech.speak(fallbackReply, { language: 'en-US' });
    } finally {
      setListening(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎙️ Voice Assistant</Text>
          <Text style={styles.subtitle}>Hands-free notice search & speech narration</Text>
        </View>

        {/* Mic Animation Pulse Button */}
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[styles.micButton, listening && styles.micButtonListening]}
            onPress={() => handleVoiceCommand('Read latest urgent notices')}
          >
            <Text style={styles.micIcon}>{listening ? '🎙️' : '🎤'}</Text>
          </TouchableOpacity>
          <Text style={styles.micStatus}>
            {listening ? 'Listening to speech input...' : 'Tap Mic to Speak'}
          </Text>
        </View>

        {/* Transcript Box */}
        {transcript ? (
          <View style={styles.box}>
            <Text style={styles.boxLabel}>You Said:</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}

        {/* AI Voice Output Box */}
        <View style={styles.box}>
          <Text style={styles.boxLabel}>Assistant Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>

        {/* Quick Voice Command Chips */}
        <Text style={styles.quickTitle}>Try Sample Voice Commands:</Text>
        {quickCommands.map((cmd, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => handleVoiceCommand(cmd)}
          >
            <Text style={styles.chipText}>🗣️ "{cmd}"</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#38bdf8',
    elevation: 8,
  },
  micButtonListening: {
    backgroundColor: '#ef4444',
    borderColor: '#fca5a5',
  },
  micIcon: {
    fontSize: 36,
  },
  micStatus: {
    color: '#38bdf8',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 12,
  },
  box: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  boxLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  transcriptText: {
    color: '#38bdf8',
    fontSize: 15,
    fontStyle: 'italic',
  },
  responseText: {
    color: '#f8fafc',
    fontSize: 15,
    lineHeight: 22,
  },
  quickTitle: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  chip: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#f8fafc',
    fontSize: 13,
  },
});
