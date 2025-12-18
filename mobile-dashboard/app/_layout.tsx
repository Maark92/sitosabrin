
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import '../global.css'; // REMOVED: Not needed for NativeWind v2 without specific metro config

// Separate component to handle navigation logic which must be inside AuthProvider
function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // const inAuthGroup = segments[0] === '(auth)'; // REMOVED: Unused and causes type error
    // simpler logic:
    // If not logged in and not on login page -> go to login
    // If logged in and on login page -> go to dashboard

    // Check if the current route is the login screen
    // segments can be empty [] or ['login'] or ['(tabs)', 'index']
    const isLoginRoute = segments[0] === 'login';

    if (!session && !isLoginRoute) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (session && isLoginRoute) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111827' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="demo" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
