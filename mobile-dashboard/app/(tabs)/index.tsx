
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Megaphone, TrendingUp, User, Phone, LogOut } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { session, isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data State
  const [stats, setStats] = useState({ services: 0, portfolio: 0, offers: 0 });
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [nextBooking, setNextBooking] = useState<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

      // 1. Stats
      const { count: servicesCount } = await supabase.from("services").select("*", { count: "exact", head: true });
      const { count: portfolioCount } = await supabase.from("portfolio").select("*", { count: "exact", head: true });
      const { count: offersCount } = await supabase.from("offers").select("*", { count: "exact", head: true });

      setStats({
        services: servicesCount || 0,
        portfolio: portfolioCount || 0,
        offers: offersCount || 0,
      });

      // 2. Today's Bookings
      const { data: todayData, error: todayError } = await supabase
        .from("bookings")
        .select("*, slot:availability_slots!inner(*)")
        .eq("slot.date", todayStr);

      if (todayData) {
        const sorted = todayData.sort((a: any, b: any) =>
          a.slot.start_time.localeCompare(b.slot.start_time)
        );
        // Show all today's booking or filter? Web: "validToday"
        const validToday = sorted.filter((b: any) => b.slot.start_time >= currentTime);
        setTodayBookings(validToday);
      }

      // 3. Next Booking
      const { data: nextData } = await supabase
        .from("bookings")
        .select("*, slot:availability_slots!inner(*)")
        .gte("slot.date", todayStr)
        .order("slot(date)")
        .limit(20);

      if (nextData && nextData.length > 0) {
        const sortedNext = nextData.sort((a: any, b: any) => {
          const dateDiff = a.slot.date.localeCompare(b.slot.date);
          if (dateDiff !== 0) return dateDiff;
          return a.slot.start_time.localeCompare(b.slot.start_time);
        });

        const validNext = sortedNext.find((b: any) => {
          const bDate = b.slot.date;
          const bTime = b.slot.start_time;
          if (bDate > todayStr) return true;
          if (bDate === todayStr && bTime >= currentTime) return true;
          return false;
        });

        setNextBooking(validNext || null);
      } else {
        setNextBooking(null);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Ciao ${name}! Ti ricordo il tuo appuntamento da Con Strass o Senza.`;
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
  };

  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-900">
      <Stack.Screen options={{
        headerShown: true,
        title: 'Dashboard',
        headerStyle: { backgroundColor: '#111827' },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={() => {
            supabase.auth.signOut();
            router.replace('/login');
          }}>
            <LogOut size={24} color="#ef4444" />
          </TouchableOpacity>
        )
      }} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Welcome */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm">Benvenuto,</Text>
          <Text className="text-white text-2xl font-bold">Admin</Text>
        </View>

        {/* Next Client Card */}
        <View className="bg-rose-600 rounded-3xl p-6 mb-8 shadow-lg overflow-hidden relative">
          <View className="relative z-10">
            <Text className="text-white/80 text-lg font-medium mb-4">Prossimo Cliente</Text>
            {nextBooking ? (
              <View>
                <View className="flex-row items-center space-x-4 mb-4">
                  <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
                    <User size={24} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-white text-2xl font-bold">{nextBooking.customer_name}</Text>
                    <Text className="text-white/80 text-sm">Trattamento prenotato</Text>
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="bg-black/20 px-3 py-2 rounded-xl flex-row items-center space-x-2">
                    <Calendar size={16} color="#fff" />
                    <Text className="text-white">{new Date(nextBooking.slot.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</Text>
                  </View>
                  <View className="bg-black/20 px-3 py-2 rounded-xl flex-row items-center space-x-2">
                    <Clock size={16} color="#fff" />
                    <Text className="text-white">{nextBooking.slot.start_time.slice(0, 5)}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text className="text-white/60 py-4">Nessun appuntamento imminente.</Text>
            )}

            {/* Action Buttons for Next Client */}
            {nextBooking && (
              <View className="flex-row mt-6 space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-white py-3 rounded-xl items-center"
                  onPress={() => openWhatsApp(nextBooking.customer_phone, nextBooking.customer_name)}
                >
                  <Text className="text-rose-600 font-bold">WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* Decorative */}
          <View className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <View className="bg-gray-800 w-[48%] p-4 rounded-2xl mb-4">
            <View className="bg-purple-500/20 w-10 h-10 rounded-xl items-center justify-center mb-3">
              <Megaphone size={20} color="#a855f7" />
            </View>
            <Text className="text-gray-400 text-xs">Offerte</Text>
            <Text className="text-white text-xl font-bold">{stats.offers}</Text>
          </View>
          <View className="bg-gray-800 w-[48%] p-4 rounded-2xl mb-4">
            <View className="bg-green-500/20 w-10 h-10 rounded-xl items-center justify-center mb-3">
              <TrendingUp size={20} color="#22c55e" />
            </View>
            <Text className="text-gray-400 text-xs">Servizi</Text>
            <Text className="text-white text-xl font-bold">{stats.services}</Text>
          </View>
          <View className="bg-gray-800 w-[48%] p-4 rounded-2xl">
            <View className="bg-blue-500/20 w-10 h-10 rounded-xl items-center justify-center mb-3">
              <Image source={{ uri: "https://via.placeholder.com/50" }} style={{ width: 20, height: 20, tintColor: '#3b82f6' }} />
              {/* Used Image as placeholder for lucide Image icon as simple Image component conflicts */}
              <Text className="text-blue-500 font-bold">In</Text>
            </View>
            <Text className="text-gray-400 text-xs">Portfolio</Text>
            <Text className="text-white text-xl font-bold">{stats.portfolio}</Text>
          </View>
          <View className="bg-gray-800 w-[48%] p-4 rounded-2xl flex justify-center items-center">
            <Text className="text-gray-500 text-center text-xs">More coming soon...</Text>
          </View>
        </View>

        {/* Today's Schedule List */}
        <Text className="text-white text-xl font-bold mb-4">Oggi</Text>
        {todayBookings.length === 0 ? (
          <View className="bg-gray-800 p-6 rounded-2xl items-center">
            <Text className="text-gray-400">Nessun impegno per oggi.</Text>
          </View>
        ) : (
          <View className="space-y-3">
            {todayBookings.map((booking) => (
              <View key={booking.id} className="bg-gray-800 p-4 rounded-2xl flex-row items-center justify-between">
                <View className="flex-row items-center space-x-4">
                  <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">{booking.customer_name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold text-base">{booking.customer_name}</Text>
                    <Text className="text-gray-400 text-xs">{booking.slot.start_time.slice(0, 5)} - Trattamento</Text>
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-green-600 w-10 h-10 rounded-full items-center justify-center"
                  onPress={() => openWhatsApp(booking.customer_phone, booking.customer_name)}
                >
                  <Phone size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
