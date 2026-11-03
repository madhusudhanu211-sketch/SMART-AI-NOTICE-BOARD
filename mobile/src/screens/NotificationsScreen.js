import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const NOTIFICATIONS_DATA = [
  { id: '1', title: '🚨 Urgent: Exam Date Sheet Released', time: '10 mins ago', type: 'urgent' },
  { id: '2', title: '💼 Google Placement Drive Registration Alert', time: '2 hours ago', type: 'placement' },
  { id: '3', title: '🎉 Hackathon Registration Confirmation', time: '1 day ago', type: 'event' },
  { id: '4', title: '📝 Assignment 3 Graded: 95/100', time: '2 days ago', type: 'academic' },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🔔 Notifications</Text>
          <Text style={styles.subtitle}>Recent push alerts and campus updates</Text>
        </View>

        {NOTIFICATIONS_DATA.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.timeText}>{item.time}</Text>
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 11,
  },
});
