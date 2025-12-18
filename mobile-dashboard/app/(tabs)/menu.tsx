
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, Scissors, Image as ImageIcon, Megaphone, ChevronRight, UserCircle } from 'lucide-react-native';

export default function MenuScreen() {
    const { session } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
    };

    const menuItems = [
        {
            title: 'Servizi',
            icon: Scissors,
            color: '#f43f5e',
            route: '/services'
        },
        {
            title: 'Portfolio',
            icon: ImageIcon,
            color: '#3b82f6',
            route: '/portfolio'
        },
        {
            title: 'Marketing',
            icon: Megaphone,
            color: '#a855f7',
            route: '/marketing'
        },
    ];

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Menu',
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#fff',
            }} />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Profile Header */}
                <View className="flex-row items-center mb-8 bg-gray-800 p-4 rounded-2xl border border-gray-700">
                    <View className="w-14 h-14 bg-gray-700 rounded-full items-center justify-center mr-4">
                        <UserCircle size={32} color="#9ca3af" />
                    </View>
                    <View>
                        <Text className="text-white text-lg font-bold">Amministratore</Text>
                        <Text className="text-gray-400 text-sm">{session?.user?.email}</Text>
                    </View>
                </View>

                {/* Menu Grid */}
                <Text className="text-gray-400 mb-4 ml-1 uppercase text-xs font-bold tracking-wider">Gestione</Text>
                <View className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 mb-8">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-700' : ''}`}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}20` }}>
                                <item.icon size={20} color={item.color} />
                            </View>
                            <Text className="text-white text-base font-medium flex-1">{item.title}</Text>
                            <ChevronRight size={20} color="#4b5563" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-center bg-gray-800 p-4 rounded-2xl border border-red-900/30"
                >
                    <LogOut size={20} color="#ef4444" className="mr-2" />
                    <Text className="text-red-500 font-bold">Disconnetti</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-600 mt-8 text-xs">Versione App 1.0.0</Text>
            </ScrollView>
        </View>
    );
}
