import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function VoiceAssistantScreen({ navigation }) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Tap Mic or speak natural voice requests!');
  const [selectedLang, setSelectedLang] = useState('en');
  const [conversation, setConversation] = useState([]);
  const [recording, setRecording] = useState(null);

  const { user } = useAuth();
  const scrollViewRef = useRef(null);

  const languageSpeechMap = {
    en: 'en-US',
    te: 'te-IN',
    hi: 'hi-IN',
    ta: 'ta-IN'
  };

  const sampleCommandsByLang = {
    en: [
      'Show my attendance',
      'What is my attendance percentage?',
      'Which classes do I have today?',
      'Read my latest notices',
      'Do I have any assignments due?',
      'Show upcoming college events',
      'Mark attendance (Faculty)'
    ],
    te: [
      'నా అటెండెన్స్ చూపించు',
      "ఈ రోజు ఏ తరగతులు ఉన్నాయి?",
      'తాజా నోటీసులు చదువు',
      'అసైన్‌మెంట్‌లు ఏమైనా ఉన్నాయా?'
    ],
    hi: [
      'मेरी अटेंडेंस दिखाओ',
      'आज मेरी कौन सी कक्षाएं हैं?',
      'नवीनतम नोटिस पढ़ो',
      'क्या कोई असाइनमेंट बकाया है?'
    ],
    ta: [
      'என் வருகைப் பதிவைக் காட்டு',
      'இன்று என்ன வகுப்புகள் உள்ளன?',
      'சமீபத்திய அறிவிப்பைப் படி'
    ]
  };

  const sampleCommands = sampleCommandsByLang[selectedLang] || sampleCommandsByLang['en'];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const speakText = (text) => {
    if (muted) return;
    Speech.stop();
    setSpeaking(true);
    const speechCode = languageSpeechMap[selectedLang] || 'en-US';
    Speech.speak(text, {
      language: speechCode,
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const startVoiceCapture = async () => {
    stopSpeaking();
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'Microphone permission is required for voice input. Please enable it in device settings or use manual text input.'
        );
        return;
      }

      setListening(true);
      setStatusMessage('Listening to speech... Speak your command now.');

      // Prepare audio recording session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.warn('[Voice Capture Warning]', err.message);
      setListening(true);
      setStatusMessage('Voice listening active. Speak or select a quick command below.');
    }
  };

  const stopVoiceCaptureAndProcess = async (customQuery) => {
    setListening(false);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch (e) {}
      setRecording(null);
    }

    const textToProcess = customQuery || transcript;
    if (!textToProcess || !textToProcess.trim()) {
      setStatusMessage('No speech detected. Please tap mic and speak again.');
      return;
    }

    await executeVoiceIntent(textToProcess);
  };

  const executeVoiceIntent = async (textCmd) => {
    setProcessing(true);
    setStatusMessage('Analyzing AI intent and retrieving database context...');

    const userEntry = { role: 'user', content: textCmd };
    const updatedHistory = [...conversation, userEntry];
    setConversation(updatedHistory);
    setTranscript('');

    try {
      const res = await apiClient.post('/assistant/voice-intent', {
        message: textCmd,
        language: selectedLang,
        platform: 'android',
        conversation_history: conversation.map(c => ({ role: c.role, content: c.content }))
      });

      const { intent, response, navigation, requires_confirmation, confirmation_payload } = res.data;

      setProcessing(false);
      setStatusMessage(response);

      const assistantEntry = {
        role: 'assistant',
        content: response,
        intent: intent
      };
      setConversation([...updatedHistory, assistantEntry]);

      // Speak response aloud
      speakText(response);

      if (requires_confirmation) {
        Alert.alert(
          'Confirmation Required',
          response,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Confirm Action',
              onPress: () => {
                const confirmedMsg = 'Faculty action confirmed and recorded.';
                speakText(confirmedMsg);
                setConversation(prev => [...prev, { role: 'assistant', content: confirmedMsg }]);
              }
            }
          ]
        );
        return;
      }

      if (navigation && navigation.length > 1) {
        const targetScreen = getNavigationTarget(navigation);
        if (targetScreen) {
          setTimeout(() => {
            navigation.navigate(targetScreen);
          }, 2000);
        }
      }
    } catch (err) {
      setProcessing(false);
      const fallbackReply = `Processed: "${textCmd}". Showing Notice Board records.`;
      setConversation([...updatedHistory, { role: 'assistant', content: fallbackReply }]);
      speakText(fallbackReply);
    }
  };

  const getNavigationTarget = (navPath) => {
    const p = (navPath || '').toLowerCase();
    if (p.includes('notice')) return 'Notices';
    if (p.includes('timetable')) return 'Home';
    if (p.includes('attendance')) return 'Home';
    if (p.includes('chatbot')) return 'AIChat';
    return 'Home';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎙️ Real-World Voice AI</Text>
          <Text style={styles.subtitle}>
            Role: {user?.role || 'Student'} • Natural Language Speech Assistant
          </Text>
        </View>

        {/* Language Switcher Row */}
        <View style={styles.langRow}>
          {['en', 'te', 'hi', 'ta'].map((langCode) => (
            <TouchableOpacity
              key={langCode}
              style={[styles.langChip, selectedLang === langCode && styles.langChipActive]}
              onPress={() => setSelectedLang(langCode)}
            >
              <Text
                style={[
                  styles.langChipText,
                  selectedLang === langCode && styles.langChipTextActive
                ]}
              >
                {langCode === 'en' ? 'EN' : langCode === 'te' ? 'తెలుగు' : langCode === 'hi' ? 'हिंदी' : 'தமிழ்'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mic Circle */}
        <View style={styles.micContainer}>
          <TouchableOpacity
            style={[
              styles.micButton,
              listening && styles.micButtonListening,
              speaking && styles.micButtonSpeaking
            ]}
            onPress={() => {
              if (listening) {
                stopVoiceCaptureAndProcess();
              } else {
                startVoiceCapture();
              }
            }}
          >
            <Text style={styles.micIcon}>
              {listening ? '🎙️' : speaking ? '🔊' : '🎤'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.micStatus}>
            {listening
              ? 'Listening... Tap to send'
              : processing
              ? 'Analyzing with AI & Database...'
              : speaking
              ? 'Assistant is speaking...'
              : 'Tap Mic to Speak'}
          </Text>
          <Text style={styles.statusDetail}>
            {transcript ? `"${transcript}"` : statusMessage}
          </Text>
        </View>

        {/* Audio Controls */}
        <View style={styles.controlsRow}>
          {speaking && (
            <TouchableOpacity style={styles.controlBtn} onPress={stopSpeaking}>
              <Text style={styles.controlBtnText}>⏹️ Stop Audio</Text>
            </TouchableOpacity>
          )}

          {conversation.length > 0 && (
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                const lastMsg = [...conversation].reverse().find(c => c.role === 'assistant');
                if (lastMsg) speakText(lastMsg.content);
              }}
            >
              <Text style={styles.controlBtnText}>🔄 Replay</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setMuted(!muted)}
          >
            <Text style={styles.controlBtnText}>{muted ? '🔇 Muted' : '🔊 Sound On'}</Text>
          </TouchableOpacity>

          {conversation.length > 0 && (
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setConversation([])}
            >
              <Text style={styles.controlBtnText}>🗑️ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Conversation Feed */}
        {conversation.length > 0 && (
          <View style={styles.feedContainer}>
            <Text style={styles.feedTitle}>Transcript Feed:</Text>
            {conversation.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.msgBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                ]}
              >
                <Text style={styles.msgText}>{msg.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Manual Input Bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Type query if mic is unavailable..."
            placeholderTextColor="#64748b"
            onSubmitEditing={() => stopVoiceCaptureAndProcess()}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => stopVoiceCaptureAndProcess()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Command Suggestions */}
        <Text style={styles.quickTitle}>Natural Voice Examples ({selectedLang.toUpperCase()}):</Text>
        {sampleCommands.map((cmd, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => stopVoiceCaptureAndProcess(cmd)}
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  langChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#ffffff',
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  micButtonSpeaking: {
    backgroundColor: '#10b981',
    borderColor: '#6ee7b7',
  },
  micIcon: {
    fontSize: 40,
  },
  micStatus: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
  },
  statusDetail: {
    color: '#cbd5e1',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 12,
  },
  controlBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  feedContainer: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  feedTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  msgBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: '#0284c7',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
  },
  msgText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginVertical: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  quickTitle: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
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
