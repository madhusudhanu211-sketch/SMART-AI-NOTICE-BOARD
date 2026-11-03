import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const ATTENDANCE_SUBJECTS = [
  { id: '1', name: 'Advanced Artificial Intelligence', attended: 28, total: 30, pct: 93 },
  { id: '2', name: 'Cloud Computing Infrastructure', attended: 24, total: 26, pct: 92 },
  { id: '3', name: 'Cyber Security & Cryptography', attended: 22, total: 25, pct: 88 },
  { id: '4', name: 'Full Stack Web Development Lab', attended: 14, total: 15, pct: 93 },
  { id: '5', name: 'Machine Learning Mini Project', attended: 10, total: 12, pct: 83 },
];

export default function AttendanceScreen() {
  const totalAttended = ATTENDANCE_SUBJECTS.reduce((acc, s) => acc + s.attended, 0);
  const totalClasses = ATTENDANCE_SUBJECTS.reduce((acc, s) => acc + s.total, 0);
  const overallPct = Math.round((totalAttended / totalClasses) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📊 Attendance Record</Text>
          <Text style={styles.overallPct}>{overallPct}%</Text>
          <Text style={styles.headerSub}>
            Total Classes: {totalAttended} / {totalClasses} • Eligibility Threshold: 75%
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Subject Breakdown</Text>
        {ATTENDANCE_SUBJECTS.map((sub) => (
          <View key={sub.id} style={styles.subjectCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.subjectName}>{sub.name}</Text>
              <Text
                style={[
                  styles.pctBadge,
                  sub.pct >= 85 ? styles.highBadge : styles.mediumBadge,
                ]}
              >
                {sub.pct}%
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${sub.pct}%` }]} />
            </View>
            <Text style={styles.classesDetail}>
              Attended {sub.attended} out of {sub.total} classes conducted
            </Text>
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
  headerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  overallPct: {
    color: '#38bdf8',
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  headerSub: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subjectCard: {
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
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  pctBadge: {
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highBadge: {
    backgroundColor: '#065f46',
    color: '#6ee7b7',
  },
  mediumBadge: {
    backgroundColor: '#854d0e',
    color: '#fde047',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
  },
  classesDetail: {
    color: '#94a3b8',
    fontSize: 11,
  },
});
