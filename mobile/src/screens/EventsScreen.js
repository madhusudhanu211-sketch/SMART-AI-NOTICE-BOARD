import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const EVENTS_DATA = [
  { id: '1', title: 'National Level AI & Robotics Hackathon', venue: 'Main Auditorium', date: 'Aug 28, 2026', category: 'Hackathon', prizes: '$5,000 Cash Pool' },
  { id: '2', title: 'Cyber Security & Ethical Hacking Workshop', venue: 'Lab 402', date: 'Sept 04, 2026', category: 'Workshop', organizer: 'IEEE Student Branch' },
  { id: '3', title: 'Annual Cultural & Tech Fest - Horizon 2026', venue: 'College Grounds', date: 'Sept 15, 2026', category: 'Cultural Fest', guest: 'Chief Tech Officers' },
];

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎉 College Events & Fests</Text>
          <Text style={styles.subtitle}>Discover hackathons, workshops, and registrations</Text>
        </View>

        {EVENTS_DATA.map((event) => (
          <View key={event.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.badge}>{event.category}</Text>
              <Text style={styles.dateText}>📅 {event.date}</Text>
            </View>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.venueText}>📍 Venue: {event.venue}</Text>
            {event.prizes ? <Text style={styles.prizeText}>🏆 {event.prizes}</Text> : null}

            <TouchableOpacity style={styles.registerBtn}>
              <Text style={styles.registerBtnText}>Register Now</Text>
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  venueText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 4,
  },
  prizeText: {
    color: '#fde047',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  registerBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  registerBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
