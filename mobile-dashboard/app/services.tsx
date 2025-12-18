
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, Image, ActivityIndicator, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit2, X, Save, DollarSign, Clock } from 'lucide-react-native';

interface Service {
    id: string;
    title: string;
    description: string;
    price: string;
    duration: string;
    image_url: string;
    is_popular: boolean;
}

export default function ServicesScreen() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Service>>({});

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("services").select("*").order("created_at");
            if (error) throw error;
            if (data) setServices(data);
        } catch (e: any) {
            Alert.alert("Errore", e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices();
    };

    const handleSave = async () => {
        try {
            if (!formData.title || !formData.price) {
                Alert.alert("Attenzione", "Titolo e Prezzo sono obbligatori.");
                return;
            }

            if (editingId) {
                const { error } = await supabase.from("services").update(formData).eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("services").insert([formData]);
                if (error) throw error;
            }

            setModalVisible(false);
            setEditingId(null);
            setFormData({});
            fetchServices();
        } catch (e: any) {
            Alert.alert("Errore durante il salvataggio", e.message);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Conferma Eliminazione",
            "Sei sicuro di voler eliminare questo servizio?",
            [
                { text: "Annulla", style: "cancel" },
                {
                    text: "Elimina",
                    style: "destructive",
                    onPress: async () => {
                        const { error } = await supabase.from("services").delete().eq("id", id);
                        if (error) Alert.alert("Errore", error.message);
                        else fetchServices();
                    }
                }
            ]
        );
    };

    const openEdit = (service: Service) => {
        setEditingId(service.id);
        setFormData(service);
        setModalVisible(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({});
        setModalVisible(true);
    };

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Servizi',
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#fff',
                headerRight: () => (
                    <TouchableOpacity onPress={openCreate} className="bg-rose-600 p-2 rounded-lg">
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : (
                    <View className="space-y-4">
                        {services.map((service) => (
                            <View key={service.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                                <View className="flex-row gap-4 mb-3">
                                    {service.image_url ? (
                                        <Image source={{ uri: service.image_url }} className="w-16 h-16 rounded-xl bg-gray-700" />
                                    ) : (
                                        <View className="w-16 h-16 rounded-xl bg-gray-700 items-center justify-center">
                                            <Text className="text-gray-500 text-xs">No img</Text>
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start">
                                            <Text className="text-white font-bold text-lg mb-1 flex-1">{service.title}</Text>
                                            {service.is_popular && (
                                                <View className="bg-yellow-500/20 px-2 py-1 rounded-md ml-2">
                                                    <Text className="text-yellow-500 text-[10px] font-bold">TOP</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-gray-400 text-xs mb-2" numberOfLines={2}>{service.description}</Text>
                                        <View className="flex-row gap-3">
                                            <Text className="text-rose-400 font-bold">{service.price}</Text>
                                            <Text className="text-gray-500">•</Text>
                                            <Text className="text-gray-300">{service.duration}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-end gap-2 border-t border-gray-700 pt-3">
                                    <TouchableOpacity
                                        onPress={() => openEdit(service)}
                                        className="bg-gray-700 px-3 py-2 rounded-lg flex-row items-center gap-2"
                                    >
                                        <Edit2 size={14} color="#fff" />
                                        <Text className="text-white text-xs">Modifica</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(service.id)}
                                        className="bg-red-500/20 px-3 py-2 rounded-lg flex-row items-center gap-2"
                                    >
                                        <Trash2 size={14} color="#ef4444" />
                                        <Text className="text-red-500 text-xs">Elimina</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Edit/Create Modal */}
            <Modal
                animationType="slide"
                visible={modalVisible}
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-gray-900 p-6">
                    <View className="flex-row justify-between items-center mb-8 mt-4">
                        <Text className="text-white text-2xl font-bold">
                            {editingId ? "Modifica Servizio" : "Nuovo Servizio"}
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-800 p-2 rounded-full">
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 space-y-4">
                        <View>
                            <Text className="text-gray-400 mb-2 ml-1">Titolo</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                placeholder="Es. Manicure Gel"
                                placeholderTextColor="#666"
                                value={formData.title}
                                onChangeText={(t) => setFormData({ ...formData, title: t })}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 mb-2 ml-1">Prezzo</Text>
                                <View className="flex-row bg-gray-800 rounded-xl border border-gray-700 items-center px-4">
                                    <DollarSign size={16} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 text-white p-4 h-14"
                                        placeholder="€ 0.00"
                                        placeholderTextColor="#666"
                                        value={formData.price}
                                        onChangeText={(t) => setFormData({ ...formData, price: t })}
                                    />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 mb-2 ml-1">Durata</Text>
                                <View className="flex-row bg-gray-800 rounded-xl border border-gray-700 items-center px-4">
                                    <Clock size={16} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 text-white p-4 h-14"
                                        placeholder="60min"
                                        placeholderTextColor="#666"
                                        value={formData.duration}
                                        onChangeText={(t) => setFormData({ ...formData, duration: t })}
                                    />
                                </View>
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-400 mb-2 ml-1">Descrizione</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700 h-24"
                                placeholder="Dettagli del trattamento..."
                                placeholderTextColor="#666"
                                multiline
                                textAlignVertical="top"
                                value={formData.description}
                                onChangeText={(t) => setFormData({ ...formData, description: t })}
                            />
                        </View>

                        <View>
                            <Text className="text-gray-400 mb-2 ml-1">URL Immagine</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                placeholder="https://..."
                                placeholderTextColor="#666"
                                value={formData.image_url}
                                onChangeText={(t) => setFormData({ ...formData, image_url: t })}
                            />
                        </View>

                        <View className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <Text className="text-gray-400">In Evidenza (Popolare)</Text>
                            <Switch
                                value={formData.is_popular || false}
                                onValueChange={(val) => setFormData({ ...formData, is_popular: val })}
                                trackColor={{ false: "#374151", true: "#e11d48" }}
                                thumbColor={formData.is_popular ? "#fff" : "#9ca3af"}
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-green-600 p-4 rounded-xl mt-6 flex-row justify-center items-center gap-2"
                            onPress={handleSave}
                        >
                            <Save size={20} color="#fff" />
                            <Text className="text-white font-bold text-lg">Salva</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal >
        </View >
    );
}
