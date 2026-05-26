import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cart.store';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';

const { width } = Dimensions.get('window');

const CARE_TIPS = [
  { icon: '💧', label: 'Water', value: 'Once a week' },
  { icon: '☀️', label: 'Light', value: 'Indirect sunlight' },
  { icon: '🌡️', label: 'Temp', value: '18–28°C' },
  { icon: '💨', label: 'Humidity', value: 'Medium' },
];

export default function ProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌱</Text>
        <Text style={{ fontSize: FontSize.lg, color: Colors.textDark }}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary }}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {product.image?.original ? (
            <Image
              source={{ uri: product.image.original }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient colors={['#E8F5E9', '#A5D6A7']} style={styles.image}>
              <Text style={{ fontSize: 80 }}>🌿</Text>
            </LinearGradient>
          )}
          {!product.in_stock && (
            <View style={styles.oosOverlay}>
              <Text style={styles.oosText}>Out of Stock</Text>
            </View>
          )}
          {hasDiscount && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Name & price */}
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{CURRENCY}{price.toLocaleString('en-IN')}</Text>
            {hasDiscount && (
              <Text style={styles.mrp}>{CURRENCY}{product.price.toLocaleString('en-IN')}</Text>
            )}
            {hasDiscount && (
              <Text style={styles.savingsText}>Save {discount}%</Text>
            )}
          </View>

          {/* Qty selector */}
          <View style={styles.qtySection}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
                onPress={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Care tips */}
          <View style={styles.careSection}>
            <Text style={styles.careTitle}>Plant Care</Text>
            <View style={styles.careGrid}>
              {CARE_TIPS.map((tip) => (
                <View key={tip.label} style={styles.careTip}>
                  <Text style={styles.careIcon}>{tip.icon}</Text>
                  <Text style={styles.careLabel}>{tip.label}</Text>
                  <Text style={styles.careValue}>{tip.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>About this plant</Text>
              <Text style={styles.desc}>{product.description}</Text>
            </View>
          )}

          {/* Delivery info */}
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryEmoji}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle}>Same Day Delivery</Text>
              <Text style={styles.deliverySub}>Order before 2 PM for delivery today. Free delivery over ₹499.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to cart bar */}
      <SafeAreaView edges={['bottom']} style={styles.ctaBar}>
        <View style={styles.ctaTotal}>
          <Text style={styles.ctaTotalLabel}>Total</Text>
          <Text style={styles.ctaTotalValue}>{CURRENCY}{(price * qty).toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, (!product.in_stock || added) && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={!product.in_stock || added}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>
            {!product.in_stock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width, height: width * 0.85, overflow: 'hidden' },
  image: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  oosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oosText: { color: '#fff', fontWeight: '700', fontSize: FontSize.xl },
  discountTag: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  discountTagText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  content: { padding: Spacing.lg },
  name: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.textDark, lineHeight: 36, marginBottom: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  price: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  mrp: { fontSize: FontSize.base, color: Colors.textMuted, textDecorationLine: 'line-through' },
  savingsText: { fontSize: FontSize.sm, color: '#22C55E', fontWeight: '700' },
  qtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  qtyLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textDark },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bg, borderWidth: 1.5,
    borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnDisabled: { borderColor: '#E5E7EB' },
  qtyBtnText: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  qtyNum: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark, minWidth: 32, textAlign: 'center' },
  careSection: { marginBottom: Spacing.lg },
  careTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.sm },
  careGrid: { flexDirection: 'row', gap: Spacing.sm },
  careTip: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radius.lg,
    padding: Spacing.sm, alignItems: 'center', ...Shadow.sm,
  },
  careIcon: { fontSize: 22, marginBottom: 4 },
  careLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  careValue: { fontSize: FontSize.xs, color: Colors.textDark, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  descSection: { marginBottom: Spacing.lg },
  descTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark, marginBottom: Spacing.sm },
  desc: { fontSize: FontSize.base, color: Colors.textMuted, lineHeight: 24 },
  deliveryCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  deliveryEmoji: { fontSize: 24 },
  deliveryTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  deliverySub: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 20 },
  ctaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    ...Shadow.lg,
  },
  ctaTotal: {},
  ctaTotalLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  ctaTotalValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14, paddingHorizontal: Spacing.xl },
  addBtnDisabled: { backgroundColor: '#9CA3AF' },
  addBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
});
