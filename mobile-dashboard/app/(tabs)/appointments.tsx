
import { View, Text, FlatList, TouchableOpacity, Linking, RefreshControl, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Phone, User } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function AppointmentsScreen() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const todayStr = new Date().toISOString().split("T")[0];

            const { data } = await supabase
                .from("bookings")
                .select("*, slot:availability_slots!inner(*)")
                .gte("slot.date", todayStr) // Future only? or all? Let's show future for now.
                .order("slot(date)", { ascending: true });

            if (data) {
                // Sort by time within date
                const sorted = data.sort((a: any, b: any) => {
                    const dateDiff = a.slot.date.localeCompare(b.slot.date);
                    if (dateDiff !== 0) return dateDiff;
                    return a.slot.start_time.localeCompare(b.slot.start_time);
                });
                setBookings(sorted);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const openWhatsApp = (phone: string, name: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Ciao ${name}! Ti ricordo il tuo appuntamento.`;
        Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
    };

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Appuntamenti',
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#fff',
            }} />

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-10">Nessun appuntamento futuro.</Text>
                    }
                    renderItem={({ item }) => (
                        <View className="bg-gray-800 p-4 rounded-2xl mb-4 border border-gray-700">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-row items-center space-x-3">
                                    <View className="w-10 h-10 bg-rose-500/20 rounded-full items-center justify-center">
                                        <User size={20} color="#f43f5e" />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-lg">{item.customer_name}</Text>
                                        <Text className="text-gray-400 text-xs">Trattamento</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => openWhatsApp(item.customer_phone, item.customer_name)}
                                    className="bg-green-600 p-2 rounded-full"
                                >
                                    <Phone size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row space-x-4 mt-2 border-t border-gray-700 pt-3">
                                <View className="flex-row items-center space-x-2">
                                    <Calendar size={14} color="#9ca3af" />
                                    <Text className="text-gray-300">
                                        {new Date(item.slot.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                                    </Text>
                                </View>
                                <View className="flex-row items-center space-x-2">
                                    <Clock size={14} color="#9ca3af" />
                                    <Text className="text-gray-300 font-bold text-rose-400">{item.slot.start_time.slice(0, 5)}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}
