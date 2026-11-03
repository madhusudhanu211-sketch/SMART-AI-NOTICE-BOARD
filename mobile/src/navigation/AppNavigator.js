import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import NoticesScreen from '../screens/NoticesScreen';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import AIChatbotScreen from '../screens/AIChatbotScreen';
import TimetableScreen from '../screens/TimetableScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AssignmentsScreen from '../screens/AssignmentsScreen';
import ResultsScreen from '../screens/ResultsScreen';
import EventsScreen from '../screens/EventsScreen';
import PlacementsScreen from '../screens/PlacementsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#1e293b' },
        headerTitleStyle: { color: '#f8fafc', fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused }) => {
          let icon = '📌';
          if (route.name === 'Home') icon = '🏠';
          if (route.name === 'Notices') icon = '📋';
          if (route.name === 'Voice') icon = '🎙️';
          if (route.name === 'AIChat') icon = '🤖';
          if (route.name === 'Profile') icon = '👤';
          return (
            <Text style={{ fontSize: 18, color: focused ? '#38bdf8' : '#64748b' }}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Notices" component={NoticesScreen} options={{ title: 'Notice Board' }} />
      <Tab.Screen name="Voice" component={VoiceAssistantScreen} options={{ title: 'Voice AI' }} />
      <Tab.Screen name="AIChat" component={AIChatbotScreen} options={{ title: 'AI Assistant' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="Timetable" component={TimetableScreen} options={{ headerShown: true, title: 'Timetable', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: true, title: 'Attendance', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Assignments" component={AssignmentsScreen} options={{ headerShown: true, title: 'Assignments', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: true, title: 'Results', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: true, title: 'Events', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Placements" component={PlacementsScreen} options={{ headerShown: true, title: 'Placements', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Documents" component={DocumentsScreen} options={{ headerShown: true, title: 'Documents', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications', headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f8fafc' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
