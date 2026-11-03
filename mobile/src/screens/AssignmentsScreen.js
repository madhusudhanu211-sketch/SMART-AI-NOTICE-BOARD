import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const ASSIGNMENTS_DATA = [
  { id: '1', title: 'Deep Neural Network Model Implementation', course: 'Advanced AI', dueDate: 'Aug 22, 2026', status: 'Pending', priority: 'HIGH' },
  { id: '2', title: 'AWS Cloud Architecture Case Study', course: 'Cloud Computing', dueDate: 'Aug 25, 2026', status: 'Submitted', priority: 'MEDIUM' },
  { id: '3', title: 'AES Encryption Algorithm Analysis', course: 'Cyber Security', dueDate: 'Aug 28, 2026', status: 'Pending', priority: 'HIGH' },
  { id: '4', title: 'React Native Cross-Platform UI Project', course: 'Web & Mobile', dueDate: 'Sept 02, 2026', status: 'Evaluated', grade: '95/100', priority: 'NORMAL' },
];

export default function AssignmentsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📝 Assignments Portal</Text>
          <Text style={styles.subtitle}>Track dues, submit coursework, view grades</Text>
        </View>

        {ASSIGNMENTS_DATA.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.courseName}>{item.course}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  item.status === 'Submitted'
                    ? styles.submittedBadge
                    : item.status === 'Evaluated'
                    ? styles.evaluatedBadge
                    : styles.pendingBadge,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <Text style={styles.assignmentTitle}>{item.title}</Text>
            <Text style={styles.dueDate}>Due Date: {item.dueDate}</Text>

            {item.grade ? (
              <Text style={styles.gradeText}>Score: {item.grade}</Text>
            ) : (
              <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Submit Assignment</Text>
              </TouchableOpacity>
            )}
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseName: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: '#854d0e',
    color: '#fde047',
  },
  submittedBadge: {
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
  },
  evaluatedBadge: {
    backgroundColor: '#065f46',
    color: '#6ee7b7',
  },
  assignmentTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dueDate: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  gradeText: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
