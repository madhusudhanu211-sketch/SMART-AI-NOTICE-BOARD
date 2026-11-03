import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const RESULTS_DATA = [
  { code: 'CS601', title: 'Advanced Artificial Intelligence', grade: 'A+', credits: 4 },
  { code: 'CS602', title: 'Cloud Computing Infrastructure', grade: 'A', credits: 4 },
  { code: 'CS603', title: 'Cyber Security & Cryptography', grade: 'A+', credits: 3 },
  { code: 'CS604', title: 'Full Stack Web Development Lab', grade: 'O', credits: 2 },
  { code: 'CS605', title: 'Machine Learning Mini Project', grade: 'O', credits: 2 },
];

export default function ResultsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🎓 Academic Performance</Text>
          <View style={styles.cgpaRow}>
            <View style={styles.cgpaBox}>
              <Text style={styles.cgpaVal}>9.24</Text>
              <Text style={styles.cgpaLabel}>SGPA (Sem 6)</Text>
            </View>
            <View style={styles.cgpaBox}>
              <Text style={styles.cgpaVal}>9.12</Text>
              <Text style={styles.cgpaLabel}>Overall CGPA</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Semester 6 Grade Sheet</Text>
        {RESULTS_DATA.map((item) => (
          <View key={item.code} style={styles.rowCard}>
            <View>
              <Text style={styles.subjectCode}>{item.code}</Text>
              <Text style={styles.subjectTitle}>{item.title}</Text>
              <Text style={styles.creditsText}>Credits: {item.credits}</Text>
            </View>
            <View style={styles.gradeCircle}>
              <Text style={styles.gradeLetter}>{item.grade}</Text>
            </View>
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
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cgpaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cgpaBox: {
    alignItems: 'center',
  },
  cgpaVal: {
    color: '#38bdf8',
    fontSize: 32,
    fontWeight: 'bold',
  },
  cgpaLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rowCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectCode: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subjectTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 2,
  },
  creditsText: {
    color: '#64748b',
    fontSize: 11,
  },
  gradeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeLetter: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
