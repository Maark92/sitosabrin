import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Stack, useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert(error.message);
            setLoading(false);
        }
        // Navigation is handled by the auth state listener in _layout
    }

    return (
        <View className="flex-1 bg-gray-900 justify-center px-6">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="mb-10">
                <Text className="text-white text-3xl font-bold mb-2">Benvenuto</Text>
                <Text className="text-gray-400 text-base">Accedi alla dashboard amministrativa</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-300 mb-2 ml-1">Email</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                        placeholder="admin@example.com"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="text-gray-300 mb-2 ml-1">Password</Text>
                    <TextInput
                        className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                        placeholder="••••••••"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-white p-4 rounded-xl mt-4 items-center ${loading ? 'opacity-70' : ''}`}
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-black font-bold text-lg">Accedi</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
