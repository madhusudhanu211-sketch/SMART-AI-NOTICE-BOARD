import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const PLACEMENTS_DATA = [
  { id: '1', company: 'Google', role: 'Software Engineer 2026', ctc: '32.5 LPA', cutoff: '8.0 CGPA', deadline: 'Aug 20, 2026', status: 'Eligible' },
  { id: '2', title: 'Microsoft', role: 'Cloud Systems Engineer', ctc: '28.0 LPA', cutoff: '7.5 CGPA', deadline: 'Aug 24, 2026', status: 'Applied' },
  { id: '3', title: 'Amazon', role: 'SDE-1 Campus Hire', ctc: '26.0 LPA', cutoff: '7.5 CGPA', deadline: 'Aug 30, 2026', status: 'Eligible' },
];

export default function PlacementsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💼 Campus Placements 2026</Text>
          <Text style={styles.subtitle}>On-campus recruitment drives & application tracking</Text>
        </View>

        {PLACEMENTS_DATA.map((drive) => (
          <View key={drive.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.companyName}>{drive.company || drive.title}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  drive.status === 'Applied' ? styles.appliedBadge : styles.eligibleBadge,
                ]}
              >
                {drive.status}
              </Text>
            </View>
            <Text style={styles.roleText}>{drive.role}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.ctcText}>💰 CTC: {drive.ctc}</Text>
              <Text style={styles.cutoffText}>🎯 Min: {drive.cutoff}</Text>
            </View>
            <Text style={styles.deadlineText}>Deadline: {drive.deadline}</Text>

            <TouchableOpacity
              style={[styles.applyBtn, drive.status === 'Applied' && styles.appliedBtn]}
            >
              <Text style={styles.applyBtnText}>
                {drive.status === 'Applied' ? 'Application Submitted' : 'Apply for Drive'}
              </Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  companyName: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eligibleBadge: {
    backgroundColor: '#065f46',
    color: '#6ee7b7',
  },
  appliedBadge: {
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
  },
  roleText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ctcText: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cutoffText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  deadlineText: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 12,
  },
  applyBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  appliedBtn: {
    backgroundColor: '#334155',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
