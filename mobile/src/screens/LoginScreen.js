import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Student');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email address and password');
      return;
    }
    setError('');
    const res = await login(email, password, selectedRole);
    if (!res.success) {
      setError(res.error || 'Invalid email or password');
    }
  };

  const roles = ['Student', 'Faculty', 'Admin'];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <View style={styles.header}>
          <Text style={styles.logoBadge}>📌 SMART NOTICE BOARD</Text>
          <Text style={styles.title}>Mobile Portal Sign In</Text>
          <Text style={styles.subtitle}>Select your role and log in to your account</Text>
        </View>

        <View style={styles.form}>
          {/* Role Selection Cards */}
          <Text style={styles.label}>SELECT YOUR ROLE</Text>
          <View style={styles.roleRow}>
            {roles.map((r) => {
              const isSelected = selectedRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleCard, isSelected && styles.roleCardActive]}
                  onPress={() => setSelectedRole(r)}
                >
                  <Text style={[styles.roleCardText, isSelected && styles.roleCardTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="name@college.edu"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Sign In as {selectedRole}</Text>
            )}
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
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleCardActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  roleCardText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleCardTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#f87171',
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
