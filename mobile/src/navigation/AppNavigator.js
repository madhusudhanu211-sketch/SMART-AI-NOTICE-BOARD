import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NoticesScreen from '../screens/NoticesScreen';
import VoiceAssistantScreen from '../screens/VoiceAssistantScreen';
import AIChatbotScreen from '../screens/AIChatbotScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
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
        tabBarIcon: ({ focused, color }) => {
          let icon = '📌';
          if (route.name === 'Home') icon = '🏠';
          if (route.name === 'Notices') icon = '📋';
          if (route.name === 'Voice') icon = '🎙️';
          if (route.name === 'AIChat') icon = '🤖';
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
      <Tab.Screen name="Voice" component={VoiceAssistantScreen} options={{ title: 'Voice' }} />
      <Tab.Screen name="AIChat" component={AIChatbotScreen} options={{ title: 'AI Assistant' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}
