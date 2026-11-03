import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || user?.username || 'Smart User'}</Text>
          <Text style={styles.userRole}>
            {(user?.role || 'Student').toUpperCase()} • {user?.department || 'Computer Science'}
          </Text>
          <Text style={styles.emailText}>{user?.email || 'user@college.edu'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Roll / ID Number</Text>
            <Text style={styles.infoVal}>2026-CS-1042</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Batch / Academic Year</Text>
            <Text style={styles.infoVal}>2023 - 2027 (Sem 6)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Section / Group</Text>
            <Text style={styles.infoVal}>CSE-A</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  infoVal: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutBtn: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
