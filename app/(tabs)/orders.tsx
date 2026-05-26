import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrders } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/auth.store';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  order_processing: { bg: '#FEF3C7', text: '#D97706' },
  order_at_local_facility: { bg: '#DBEAFE', text: '#2563EB' },
  order_out_for_delivery: { bg: '#D1FAE5', text: '#059669' },
  order_delivered: { bg: '#D1FAE5', text: '#16A34A' },
  order_cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

const STATUS_LABELS: Record<string, string> = {
  order_processing: 'Processing',
  order_at_local_facility: 'At Facility',
  order_out_for_delivery: 'Out for Delivery',
  order_delivered: 'Delivered',
  order_cancelled: 'Cancelled',
};

function OrderCard({ order }: { order: Order }) {
  const statusColor = STATUS_COLORS[order.order_status] ?? { bg: '#F3F4F6', text: '#6B7280' };
  const statusLabel = STATUS_LABELS[order.order_status] ?? order.order_status.replace(/_/g, ' ');

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.trackingNo}>#{order.tracking_number}</Text>
          <Text style={styles.date}>{new Date(order.created_at ?? '').toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <Text style={styles.itemCount}>
          {order.products?.length ?? 0} item{(order.products?.length ?? 0) !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.amount}>{CURRENCY}{order.amount?.toLocaleString('en-IN')}</Text>
      </View>

      {order.order_status === 'order_processing' && (
        <TouchableOpacity style={styles.trackBtn}>
          <Text style={styles.trackBtnText}>Track Order →</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, refetch } = useOrders();
  const orders: Order[] = (data as any)?.data ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.empty}>
          <Text style={{ fontSize: 60, marginBottom: Spacing.lg }}>📦</Text>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptyText}>Track your plant deliveries and order history</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 60, marginBottom: Spacing.lg }}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your plant orders will appear here</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/browse')}>
            <Text style={styles.loginBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: Spacing.lg }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trackingNo: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textDark },
  date: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: Spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  amount: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  trackBtn: { marginTop: Spacing.sm },
  trackBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14, paddingHorizontal: Spacing.xl },
  loginBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
});
