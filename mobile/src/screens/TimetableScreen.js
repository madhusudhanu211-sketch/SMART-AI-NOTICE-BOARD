import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const TIMETABLE_DATA = {
  Mon: [
    { time: '09:00 - 10:00 AM', subject: 'Advanced Artificial Intelligence', room: 'Lab 402', faculty: 'Dr. Ramesh Kumar' },
    { time: '10:15 - 11:15 AM', subject: 'Data Mining & Warehousing', room: 'LH 101', faculty: 'Prof. Anitha Sharma' },
    { time: '11:30 - 12:30 PM', subject: 'Cloud Computing Infrastructure', room: 'LH 203', faculty: 'Dr. Suresh Verma' },
  ],
  Tue: [
    { time: '09:00 - 10:00 AM', subject: 'Software Architecture & Design', room: 'LH 104', faculty: 'Prof. Priya Rao' },
    { time: '10:15 - 01:15 PM', subject: 'Full Stack Web Lab', room: 'CS Lab 2', faculty: 'Dr. Ramesh Kumar' },
  ],
  Wed: [
    { time: '09:00 - 10:00 AM', subject: 'Cyber Security & Cryptography', room: 'LH 201', faculty: 'Prof. Vikram Singh' },
    { time: '10:15 - 11:15 AM', subject: 'Advanced Artificial Intelligence', room: 'Lab 402', faculty: 'Dr. Ramesh Kumar' },
  ],
  Thu: [
    { time: '09:00 - 12:00 PM', subject: 'Machine Learning Mini Project Lab', room: 'AI Lab 1', faculty: 'Dr. Suresh Verma' },
  ],
  Fri: [
    { time: '09:00 - 10:00 AM', subject: 'Cloud Computing Infrastructure', room: 'LH 203', faculty: 'Dr. Suresh Verma' },
    { time: '10:15 - 11:15 AM', subject: 'Software Architecture & Design', room: 'LH 104', faculty: 'Prof. Priya Rao' },
  ],
};

export default function TimetableScreen() {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const classes = TIMETABLE_DATA[selectedDay] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 Academic Timetable</Text>
        <Text style={styles.subtitle}>Fall Semester 2026 • Computer Science</Text>
      </View>

      {/* Day Selector Chips */}
      <View style={styles.dayRow}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {classes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
          </View>
        ) : (
          classes.map((cls, idx) => (
            <View key={idx} style={styles.classCard}>
              <View style={styles.timeTag}>
                <Text style={styles.timeText}>{cls.time}</Text>
                <Text style={styles.roomBadge}>{cls.room}</Text>
              </View>
              <Text style={styles.subjectTitle}>{cls.subject}</Text>
              <Text style={styles.facultyText}>Faculty: {cls.faculty}</Text>
            </View>
          ))
        )}
      </ScrollView>
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
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  dayChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dayChipTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  classCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeTag: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeText: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  roomBadge: {
    backgroundColor: '#334155',
    color: '#f8fafc',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  facultyText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
