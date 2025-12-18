
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { House, Calendar, Settings, AlignJustify } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827', // Dark bg
          borderTopColor: '#374151',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: '#f43f5e', // Rose-500
        tabBarInactiveTintColor: '#9ca3af', // Gray-400
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appuntamenti',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Disponibilità',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Altro',
          tabBarIcon: ({ color }) => <AlignJustify size={24} color={color} />,
        }}
      />
      {/* Hidden Routes */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
