import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function EmergencyBanner({ alerts = [], onPress }) {
  const { theme } = useTheme();

  if (!alerts || alerts.length === 0) return null;

  const latestAlert = alerts[0];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, { backgroundColor: theme.danger || '#EF4444' }]}
      onPress={() => onPress && onPress(latestAlert)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>EMERGENCY ALERT</Text>
        <Text style={styles.message} numberOfLines={1}>
          {latestAlert.title || latestAlert.message || 'Urgent announcement from administration'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  iconContainer: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  message: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
