
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Image as ImageIcon, X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

interface PortfolioItem {
    id: string;
    title: string;
    image_url: string;
    category: string;
}

export default function PortfolioScreen() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Upload State
    const [modalVisible, setModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [formData, setFormData] = useState({ title: '', category: '' });

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            if (data) setItems(data);
        } catch (e: any) {
            Alert.alert("Errore", e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchItems();
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'] as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0]);
            }
        } catch (e: any) {
            Alert.alert("Errore Selezione", e.message);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage || !selectedImage.base64) {
            Alert.alert("Errore", "Seleziona prima un'immagine.");
            return;
        }

        try {
            setUploading(true);
            const fileName = `${Date.now()}.jpg`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('portfolio') // Assuming bucket name 'portfolio'
                .upload(filePath, decode(selectedImage.base64), {
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.log("Upload Error:", uploadError);
                throw new Error("Errore durante l'upload dell'immagine (Bucket 'portfolio' esiste?)");
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath);

            // 3. Insert Record
            const { error: dbError } = await supabase.from("portfolio").insert([{
                title: formData.title,
                category: formData.category,
                image_url: publicUrl
            }]);

            if (dbError) throw dbError;

            Alert.alert("Successo", "Foto aggiunta al portfolio!");
            setModalVisible(false);
            setSelectedImage(null);
            setFormData({ title: '', category: '' });
            fetchItems();

        } catch (e: any) {
            Alert.alert("Errore Upload", e.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            "Elimina Foto",
            "Sei sicuro?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sì, Elimina",
                    style: "destructive",
                    onPress: async () => {
                        await supabase.from("portfolio").delete().eq("id", id);
                        fetchItems();
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{
                headerShown: true,
                title: 'Portfolio',
                headerStyle: { backgroundColor: '#111827' },
                headerTintColor: '#fff',
                headerRight: () => (
                    <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 p-2 rounded-lg">
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView
                contentContainerStyle={{ padding: 15 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            >
                {items.length === 0 && !loading ? (
                    <View className="items-center mt-20 opacity-50">
                        <ImageIcon size={64} color="#9ca3af" />
                        <Text className="text-gray-400 mt-4">Nessuna foto.</Text>
                    </View>
                ) : (
                    <View className="flex-row flex-wrap gap-3">
                        {items.map((item) => (
                            <View key={item.id} className="w-[48%] relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                                <Image source={{ uri: item.image_url }} className="w-full h-40 bg-gray-700" resizeMode="cover" />
                                <View className="p-2">
                                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.title || "Senza titolo"}</Text>
                                    <Text className="text-gray-400 text-xs">{item.category}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full"
                                >
                                    <Trash2 size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                visible={modalVisible}
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-gray-900 p-6">
                    <View className="flex-row justify-between items-center mb-6 mt-4">
                        <Text className="text-white text-2xl font-bold">Nuova Foto</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-800 p-2 rounded-full">
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        <View className="items-center mb-8">
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage.uri }} className="w-64 h-64 rounded-xl border border-gray-700" />
                            ) : (
                                <View className="w-64 h-64 bg-gray-800 rounded-xl items-center justify-center border border-gray-700 border-dashed">
                                    <ImageIcon size={48} color="#4b5563" />
                                    <Text className="text-gray-500 mt-2">Nessuna immagine</Text>
                                </View>
                            )}

                            <View className="flex-row gap-4 mt-6">
                                <TouchableOpacity onPress={() => pickImage()} className="bg-gray-800 px-6 py-3 rounded-xl flex-row items-center gap-2">
                                    <ImageIcon size={20} color="#fff" />
                                    <Text className="text-white">Galleria</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="space-y-4">
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                placeholder="Titolo (es. Laminazione)"
                                placeholderTextColor="#666"
                                value={formData.title}
                                onChangeText={(t) => setFormData({ ...formData, title: t })}
                            />
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                                placeholder="Categoria (es. Ciglia)"
                                placeholderTextColor="#666"
                                value={formData.category}
                                onChangeText={(t) => setFormData({ ...formData, category: t })}
                            />
                        </View>

                        <TouchableOpacity
                            className={`bg-blue-600 p-4 rounded-xl mt-8 flex-row justify-center items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View className="flex-row items-center gap-2">
                                    <Upload size={20} color="#fff" />
                                    <Text className="text-white font-bold text-lg">Carica e Salva</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
