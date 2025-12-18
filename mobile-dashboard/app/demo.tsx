import { View, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Demo() {
    const [status, setStatus] = useState('Checking connection...');

    useEffect(() => {
        async function check() {
            // Simple check to availability table or similiar to prove connection
            const { count, error } = await supabase.from('availability').select('*', { count: 'exact', head: true });
            if (error) setStatus('Error: ' + error.message);
            else setStatus('Connected to Supabase! (Found ' + count + ' records)');
        }
        check();
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-gray-900">
            <Text className="text-white text-xl font-bold">Mobile Dashboard POC</Text>
            <Text className="text-green-400 mt-4 font-semibold">{status}</Text>
            <View className="mt-8 p-4 bg-gray-800 rounded-lg">
                <Text className="text-gray-300">Style System: NativeWind (Tailwind) Active</Text>
            </View>
        </View>
    );
}
