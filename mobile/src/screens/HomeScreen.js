import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [serverConnected, setServerConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const role = (user?.role || 'Student').toLowerCase();

  const [stats, setStats] = useState({
    totalNotices: 18,
    unread: 3,
    urgent: 2,
    attendance: '92%',
    pendingGrades: 14,
    totalUsers: 1420,
    activeDept: 6,
  });

  const [recentNotices, setRecentNotices] = useState([
    { id: 1, title: 'End Semester Examination Schedule Released', category: 'Academic', priority: 'HIGH', date: '2026-08-10' },
    { id: 2, title: 'Google Campus Placement Drive 2026', category: 'Placements', priority: 'URGENT', date: '2026-08-09' },
    { id: 3, title: 'AI & Robotics Hackathon Registration Open', category: 'Events', priority: 'MEDIUM', date: '2026-08-08' },
  ]);

  const fetchDashboardData = async () => {
    try {
      const res = await apiClient.get('/notices');
      if (res.data && Array.isArray(res.data)) {
        setRecentNotices(res.data.slice(0, 4));
      }
      setServerConnected(true);
    } catch (e) {
      setServerConnected(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
      >
        {/* Offline / Connection Banner */}
        {!serverConnected && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              ⚡ Offline Mode: Backend server unavailable. App running on local cache.
            </Text>
          </View>
        )}

        {/* User Header Greeting */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Welcome Back 👋</Text>
              <Text style={styles.userName}>{user?.name || user?.username || 'User'}</Text>
              <Text style={styles.userRole}>
                {(user?.role || 'Student').toUpperCase()} • {user?.department || 'Computer Science'}
              </Text>
            </View>

            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.profileBtnText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Role-Based Stats Grid */}
        {role === 'student' && (
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Notices')}>
              <Text style={styles.statNumber}>{stats.totalNotices}</Text>
              <Text style={styles.statLabel}>Total Notices</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Attendance')}>
              <Text style={[styles.statNumber, { color: '#4ade80' }]}>{stats.attendance}</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Assignments')}>
              <Text style={[styles.statNumber, { color: '#f87171' }]}>{stats.urgent}</Text>
              <Text style={styles.statLabel}>Pending Dues</Text>
            </TouchableOpacity>
          </View>
        )}

        {role === 'faculty' && (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Active Classes</Text>
            </View>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Assignments')}>
              <Text style={[styles.statNumber, { color: '#fde047' }]}>{stats.pendingGrades}</Text>
              <Text style={styles.statLabel}>To Grade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('Notices')}>
              <Text style={[styles.statNumber, { color: '#38bdf8' }]}>12</Text>
              <Text style={styles.statLabel}>My Broadcasts</Text>
            </TouchableOpacity>
          </View>
        )}

        {role === 'admin' && (
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#4ade80' }]}>{stats.activeDept}</Text>
              <Text style={styles.statLabel}>Departments</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#38bdf8' }]}>99.9%</Text>
              <Text style={styles.statLabel}>System Health</Text>
            </View>
          </View>
        )}

        {/* Feature Shortcuts Grid */}
        <Text style={styles.sectionTitle}>📌 Quick Access Hub</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Timetable')}>
            <Text style={styles.gridIcon}>📅</Text>
            <Text style={styles.gridTitle}>Timetable</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Attendance')}>
            <Text style={styles.gridIcon}>📊</Text>
            <Text style={styles.gridTitle}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Assignments')}>
            <Text style={styles.gridIcon}>📝</Text>
            <Text style={styles.gridTitle}>Assignments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Results')}>
            <Text style={styles.gridIcon}>🎓</Text>
            <Text style={styles.gridTitle}>Results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Events')}>
            <Text style={styles.gridIcon}>🎉</Text>
            <Text style={styles.gridTitle}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Placements')}>
            <Text style={styles.gridIcon}>💼</Text>
            <Text style={styles.gridTitle}>Placements</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Documents')}>
            <Text style={styles.gridIcon}>📄</Text>
            <Text style={styles.gridTitle}>Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.gridIcon}>🔔</Text>
            <Text style={styles.gridTitle}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Voice AI & Gemini Cards */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate('Voice')}>
            <Text style={styles.shortcutIcon}>🎙️</Text>
            <Text style={styles.shortcutTitle}>Voice Assistant</Text>
            <Text style={styles.shortcutSub}>Speak natural commands</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate('AIChat')}>
            <Text style={styles.shortcutIcon}>🤖</Text>
            <Text style={styles.shortcutTitle}>AI Smart Bot</Text>
            <Text style={styles.shortcutSub}>Ask Gemini AI</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Notices Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Recent Announcements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentNotices.map((notice) => (
          <TouchableOpacity
            key={notice.id}
            style={styles.noticeCard}
            onPress={() => navigation.navigate('Notices')}
          >
            <View style={styles.noticeHeader}>
              <Text style={styles.categoryBadge}>{notice.category || 'General'}</Text>
              <Text
                style={[
                  styles.priorityBadge,
                  notice.priority === 'URGENT' || notice.priority === 'HIGH'
                    ? styles.urgentBadge
                    : styles.normalBadge,
                ]}
              >
                {notice.priority || 'NORMAL'}
              </Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDate}>Posted on: {notice.date || 'Today'}</Text>
          </TouchableOpacity>
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
  offlineBanner: {
    backgroundColor: '#7f1d1d',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  offlineText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 13,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  userRole: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  profileBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  profileBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '23%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  gridTitle: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  shortcutTitle: {
    color: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shortcutSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  noticeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryBadge: {
    color: '#cbd5e1',
    fontSize: 11,
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadge: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
  },
  normalBadge: {
    backgroundColor: '#065f46',
    color: '#6ee7b7',
  },
  noticeTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  noticeDate: {
    color: '#64748b',
    fontSize: 11,
  },
});
