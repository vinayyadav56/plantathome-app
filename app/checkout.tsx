import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '@/store/cart.store';
import { useCreateOrder } from '@/hooks/useOrders';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';

const PAYMENT_METHODS = [
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', emoji: '💵' },
  { id: 'FULL_PAYMENT', label: 'Online Payment (Razorpay)', emoji: '💳' },
];

export default function CheckoutScreen() {
  const { items, clearCart } = useCartStore();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });
  const [note, setNote] = useState('');

  const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
  const deliveryFee = totalAmount >= 499 ? 0 : 49;
  const grandTotal = totalAmount + deliveryFee;

  const isValid = address.street.trim() && address.city.trim() && address.phone.trim();

  const handlePlaceOrder = async () => {
    if (!isValid) {
      Alert.alert('Missing Info', 'Please fill in your delivery address and phone number.');
      return;
    }

    const orderPayload = {
      products: items.map((i) => ({
        product_id: i.product.id,
        order_quantity: i.quantity,
        unit_price: i.product.sale_price ?? i.product.price,
        subtotal: i.subtotal,
      })),
      amount: totalAmount,
      paid_total: paymentMethod === 'CASH_ON_DELIVERY' ? 0 : grandTotal,
      total: grandTotal,
      delivery_fee: deliveryFee,
      sales_tax: 0,
      discount: 0,
      language: 'en',
      payment_gateway: paymentMethod,
      shipping_address: {
        street_address: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: 'India',
      },
      billing_address: {
        street_address: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: 'India',
      },
      customer_contact: address.phone,
      note,
    };

    try {
      await createOrder(orderPayload);
      clearCart();
      Alert.alert(
        '🌿 Order Placed!',
        'Your plants are on their way. You can track your order in the Orders tab.',
        [{ text: 'Great!', onPress: () => router.replace('/(tabs)/orders') }],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not place order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.input}
            value={address.street}
            onChangeText={(t) => setAddress({ ...address, street: t })}
            placeholder="Street address *"
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={address.city}
              onChangeText={(t) => setAddress({ ...address, city: t })}
              placeholder="City *"
              placeholderTextColor="#9CA3AF"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={address.state}
              onChangeText={(t) => setAddress({ ...address, state: t })}
              placeholder="State"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TextInput
            style={styles.input}
            value={address.zip}
            onChangeText={(t) => setAddress({ ...address, zip: t })}
            placeholder="PIN code"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={address.phone}
            onChangeText={(t) => setAddress({ ...address, phone: t })}
            placeholder="Phone number *"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        {/* Order note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Note (optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Leave at the door, ring the bell"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.payOption, paymentMethod === pm.id && styles.payOptionActive]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <Text style={styles.payEmoji}>{pm.emoji}</Text>
              <Text style={[styles.payLabel, paymentMethod === pm.id && styles.payLabelActive]}>
                {pm.label}
              </Text>
              <View style={[styles.radio, paymentMethod === pm.id && styles.radioActive]}>
                {paymentMethod === pm.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {item.product.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryAmt}>{CURRENCY}{item.subtotal.toLocaleString('en-IN')}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryAmt}>{CURRENCY}{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryAmt, deliveryFee === 0 && { color: '#22C55E' }]}>
              {deliveryFee === 0 ? 'FREE' : `${CURRENCY}${deliveryFee}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmt}>{CURRENCY}{grandTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place order */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeBtn, (!isValid || isPending) && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={!isValid || isPending}
          activeOpacity={0.85}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeBtnText}>
                Place Order · {CURRENCY}{grandTotal.toLocaleString('en-IN')}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  back: { fontSize: 28, color: Colors.textDark, lineHeight: 32 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark },
  scroll: { padding: Spacing.lg, gap: Spacing.md },
  section: { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    fontSize: FontSize.base,
    color: Colors.textDark,
    backgroundColor: Colors.bg,
    marginBottom: Spacing.sm,
  },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  payOptionActive: { borderColor: Colors.primary, backgroundColor: '#F0FDF4' },
  payEmoji: { fontSize: 22 },
  payLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textDark, fontWeight: '500' },
  payLabelActive: { color: Colors.primary, fontWeight: '600' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  summaryCard: { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryName: { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted, marginRight: 8 },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textMuted },
  summaryAmt: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textDark },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark },
  totalAmt: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  footer: { backgroundColor: '#fff', padding: Spacing.lg, paddingBottom: 28, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  placeBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 16, alignItems: 'center' },
  placeBtnDisabled: { backgroundColor: '#9CA3AF' },
  placeBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '700' },
});
