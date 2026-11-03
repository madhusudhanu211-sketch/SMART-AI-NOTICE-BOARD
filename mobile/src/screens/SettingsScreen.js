import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { setApiHost } from '../api/config';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [voiceSpeech, setVoiceSpeech] = useState(true);
  const [customIp, setCustomIp] = useState('');
  const [ipSavedMsg, setIpSavedMsg] = useState('');

  const handleSaveIp = () => {
    if (customIp) {
      setApiHost(customIp.trim());
      setIpSavedMsg(`API Server IP updated to http://${customIp.trim()}:8000`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ App Settings</Text>
          <Text style={styles.subtitle}>Preferences, server connection, & notifications</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications & Audio</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Notice Push Alerts</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#334155', true: '#0284c7' }}
              thumbColor={notifications ? '#38bdf8' : '#94a3b8'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Voice Assistant Speech Feedback</Text>
            <Switch
              value={voiceSpeech}
              onValueChange={setVoiceSpeech}
              trackColor={{ false: '#334155', true: '#0284c7' }}
              thumbColor={voiceSpeech ? '#38bdf8' : '#94a3b8'}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Backend API Configuration</Text>
          <Text style={styles.subText}>
            Enter host computer LAN IP if running server locally (e.g. 192.168.1.50)
          </Text>

          {ipSavedMsg ? <Text style={styles.savedMsg}>{ipSavedMsg}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="192.168.X.X"
            placeholderTextColor="#64748b"
            value={customIp}
            onChangeText={setCustomIp}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveIp}>
            <Text style={styles.saveBtnText}>Update Server IP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
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
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  savedMsg: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#475569',
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
