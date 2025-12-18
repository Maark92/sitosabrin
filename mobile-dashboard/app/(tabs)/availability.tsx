
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Calendar, Clock, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Slot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

export default function AvailabilityScreen() {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // New Slot State
    const [newDate, setNewDate] = useState(new Date());
    const [newTime, setNewTime] = useState(new Date());

    const fetchSlots = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await supabase
                .from("availability_slots")
                .select("*")
                .order("date", { ascending: true })
                .order("start_time", { ascending: true });

            if (data) {
                // Smart Filter: Hide past slots automatically
                const now = new Date();
                const todayStr = now.toISOString().split("T")[0];
                const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

                const activeSlots = data.filter((s: Slot) => {
                    if (s.date > todayStr) return true;
                    if (s.date === todayStr && s.start_time >= currentTime) return true;
                    return false;
                });
                setSlots(activeSlots);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Errore", "Impossibile caricare gli slot.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSlots();
    };

    const handleDelete = async (id: string, isBooked: boolean) => {
        if (isBooked) {
            Alert.alert("Impossibile", "Questo slot è prenotato. Cancella prima la prenotazione.");
            return;
        }
        Alert.alert(
            "Conferma",
            "Vuoi eliminare questo orario?",
            [
                { text: "Annulla", style: "cancel" },
                {
                    text: "Elimina",
                    style: "destructive",
                    onPress: async () => {
                        await supabase.from("availability_slots").delete().eq("id", id);
                        fetchSlots();
                    }
                }
            ]
        );
    };

    const handleAddSlot = async () => {
        try {
            const dateStr = newDate.toISOString().split('T')[0];
            const hours = newTime.getHours();
            const minutes = newTime.getMinutes();
            const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            // Calculate end time (1 hour duration)
            const endHours = (hours + 1) % 24;
            const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

            const { error } = await supabase.from("availability_slots").insert([{
                date: dateStr,
                start_time: startTime,
                end_time: endTime
            }]);

            if (error) throw error;

            setModalVisible(false);
            fetchSlots();
        } catch (e: any) {
            Alert.alert("Errore", e.message);
        }
    };

    // Grouping Logic
    const groupedSlots = slots.reduce((acc: Record<string, Slot[]>, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    };

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Disponibilità',
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#fff',
                headerRight: () => (
                    <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-rose-600 p-2 rounded-lg">
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {Object.keys(groupedSlots).length === 0 ? (
                    <View className="items-center justify-center mt-20 opacity-50">
                        <Calendar size={64} color="#9ca3af" />
                        <Text className="text-gray-400 mt-4 text-center">Nessuno slot disponibile.{'\n'}Premi + per aggiungerne uno.</Text>
                    </View>
                ) : (
                    <View className="space-y-6">
                        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                            <View key={date} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                                <Text className="text-white font-bold text-lg mb-4 capitalize">{formatDate(date)}</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    {dateSlots.map((slot) => (
                                        <View key={slot.id} className={`w-[48%] p-3 rounded-xl border relative ${slot.is_booked ? 'bg-rose-900/20 border-rose-500/30' : 'bg-green-900/20 border-green-500/30'
                                            }`}>
                                            <Text className={`font-bold text-center mb-1 ${slot.is_booked ? 'text-rose-400' : 'text-green-400'
                                                }`}>
                                                {slot.start_time.slice(0, 5)}
                                            </Text>
                                            <Text className={`text-xs text-center ${slot.is_booked ? 'text-rose-500/70' : 'text-green-500/70'
                                                }`}>
                                                {slot.is_booked ? 'Prenotato' : 'Libero'}
                                            </Text>

                                            {!slot.is_booked && (
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(slot.id, slot.is_booked)}
                                                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                                                >
                                                    <X size={12} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Add Slot Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-gray-800 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Nuovo Slot</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker Section */}
                        <View className="mb-6">
                            <Text className="text-gray-400 mb-2">Data</Text>
                            <View className="bg-gray-700 rounded-xl overflow-hidden self-start">
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={newDate}
                                        mode="date"
                                        display="default"
                                        onChange={(e, d) => d && setNewDate(d)}
                                        themeVariant="dark"

                                    />
                                ) : (
                                    // Android simplified button trigger
                                    <TouchableOpacity
                                        onPress={() => {/* show picker logic for android requires state toggling, sticking to iOS optimized for now as requested user has iphone */ }}
                                        className="p-3"
                                    >
                                        <Text className="text-white">{newDate.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                    // Note: For Android fully logic, we'd need more state boolean. 
                                    // But User requested for iPhone explicitly "app per ios mobile".
                                )}
                            </View>
                        </View>

                        {/* Time Picker Section */}
                        <View className="mb-8">
                            <Text className="text-gray-400 mb-2">Ora Inizio</Text>
                            <View className="bg-gray-700 rounded-xl overflow-hidden self-start">
                                {Platform.OS === 'ios' && (
                                    <DateTimePicker
                                        value={newTime}
                                        mode="time"
                                        display="default"
                                        onChange={(e, d) => d && setNewTime(d)}
                                        themeVariant="dark"
                                        minuteInterval={15}
                                    />
                                )}
                            </View>
                            <Text className="text-gray-500 text-xs mt-2">Durata automatica: 1 ora</Text>
                        </View>

                        <TouchableOpacity
                            className="bg-rose-600 p-4 rounded-xl items-center mb-6"
                            onPress={handleAddSlot}
                        >
                            <Text className="text-white font-bold text-lg">Aggiungi Disponibilità</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
