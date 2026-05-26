import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';
import type { CartItem } from '@/types';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQty, removeItem } = useCartStore();

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemImg}>
        {item.product.image?.original ? (
          <Image source={{ uri: item.product.image.original }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.itemImage}>
            <Text style={{ fontSize: 28 }}>🌿</Text>
          </LinearGradient>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>
          {CURRENCY}{(item.product.sale_price ?? item.product.price).toLocaleString('en-IN')} each
        </Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQty(item.product.id, item.quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQty(item.product.id, item.quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemSubtotal}>{CURRENCY}{item.subtotal.toLocaleString('en-IN')}</Text>
        <TouchableOpacity onPress={() => removeItem(item.product.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { items, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const deliveryFee = totalAmount >= 499 ? 0 : 49;
  const grandTotal = totalAmount + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <View style={styles.empty}>
          <Text style={{ fontSize: 60, marginBottom: Spacing.lg }}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some plants to get started!</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/browse')}>
            <Text style={styles.shopBtnText}>Browse Plants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart ({totalItems} items)</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.product.id.toString()}
        renderItem={({ item }) => <CartItemRow item={item} />}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{CURRENCY}{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, deliveryFee === 0 && { color: '#22C55E' }]}>
                {deliveryFee === 0 ? 'FREE' : `${CURRENCY}${deliveryFee}`}
              </Text>
            </View>
            {deliveryFee > 0 && (
              <Text style={styles.freeDeliveryHint}>
                Add {CURRENCY}{(499 - totalAmount).toLocaleString('en-IN')} more for free delivery
              </Text>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{CURRENCY}{grandTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        }
      />

      {/* Checkout bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>{CURRENCY}{grandTotal.toLocaleString('en-IN')}</Text>
          <Text style={styles.checkoutSub}>{totalItems} items · {deliveryFee === 0 ? 'Free delivery' : `+${CURRENCY}${deliveryFee} delivery`}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark },
  clearText: { fontSize: FontSize.sm, color: '#EF4444', fontWeight: '600' },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  itemImg: { width: 72, height: 72, borderRadius: Radius.md, overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  itemPrice: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: Colors.textDark, lineHeight: 20 },
  qtyNum: { fontSize: FontSize.base, fontWeight: '700', color: Colors.textDark, minWidth: 20, textAlign: 'center' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemSubtotal: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 14, color: '#9CA3AF' },
  summary: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textMuted },
  summaryValue: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textDark },
  freeDeliveryHint: { fontSize: FontSize.xs, color: Colors.primary, marginBottom: 10 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: Spacing.sm, marginTop: 4 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark },
  totalValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Shadow.lg,
  },
  checkoutTotal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  checkoutSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  checkoutBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, marginBottom: Spacing.xl },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14, paddingHorizontal: Spacing.xl },
  shopBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
});
