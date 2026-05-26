import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  Image, TextInput, Dimensions, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';
import type { Product, Category } from '@/types';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

const BANNERS = [
  {
    id: '1',
    title: 'Bring Nature Home',
    sub: '840+ fresh plants delivered',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
    gradient: ['#0D3D14', '#1B5E20'],
  },
  {
    id: '2',
    title: 'Same Day Delivery',
    sub: 'Order before 2 PM',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    gradient: ['#1B5E20', '#2E7D32'],
  },
];

function HeroBanner() {
  const [active, setActive] = useState(0);
  const BANNER_W = width - Spacing.lg * 2;

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <FlatList
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_W + Spacing.sm}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          setActive(Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + Spacing.sm)));
        }}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            style={{ width: BANNER_W, borderRadius: Radius.card, overflow: 'hidden' }}
            onPress={() => router.push('/browse')}
          >
            <Image source={{ uri: item.image }} style={styles.bannerImage} />
            <LinearGradient
              colors={[...item.gradient, 'rgba(0,0,0,0.3)'] as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSub}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function CategoryRow({ categories }: { categories: Category[] }) {
  const EMOJIS: Record<string, string> = {
    indoor: '🌿', outdoor: '🌳', succulents: '🌵', flowering: '🌸',
    herbs: '🌱', air: '💨', low: '🏜️', tropical: '🌴',
  };

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <TouchableOpacity onPress={() => router.push('/browse')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories.slice(0, 8)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
        keyExtractor={(c) => c.id.toString()}
        renderItem={({ item }) => {
          const key = Object.keys(EMOJIS).find((k) => item.slug?.includes(k)) ?? '';
          return (
            <TouchableOpacity
              style={styles.catChip}
              onPress={() => router.push({ pathname: '/browse', params: { category: item.slug } })}
              activeOpacity={0.8}
            >
              <Text style={styles.catEmoji}>{EMOJIS[key] ?? '🌿'}</Text>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const price = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <TouchableOpacity
      style={[styles.card, { width: CARD_W }]}
      onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
      activeOpacity={0.9}
    >
      <View style={styles.cardImg}>
        {product.image?.original ? (
          <Image source={{ uri: product.image.original }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.cardImage}>
            <Text style={{ fontSize: 40 }}>🌿</Text>
          </LinearGradient>
        )}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.cardPriceRow}>
          <Text style={styles.cardPrice}>{CURRENCY}{price.toLocaleString('en-IN')}</Text>
          {hasDiscount && (
            <Text style={styles.cardMrp}>{CURRENCY}{product.price.toLocaleString('en-IN')}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => addItem(product)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: catData } = useCategories();
  const { data: featuredData, isLoading, refetch, isRefetching } = useProducts({ limit: 10 });
  const featured = featuredData?.pages[0]?.data ?? [];
  const categories = catData ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>Good day{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</Text>
            <Text style={styles.topBarSub}>What plant are you looking for?</Text>
          </View>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={{ fontSize: 24 }}>🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/browse')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search 840+ plants...</Text>
        </TouchableOpacity>

        {/* Hero banner */}
        <HeroBanner />

        {/* Categories */}
        {categories.length > 0 && <CategoryRow categories={categories} />}

        {/* Featured products */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Plants</Text>
            <TouchableOpacity onPress={() => router.push('/browse')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.grid}>
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </View>
          )}
        </View>

        {/* Benefits strip */}
        <View style={styles.benefitsStrip}>
          {[
            { emoji: '🚚', text: 'Free delivery\nover ₹499' },
            { emoji: '🌱', text: '100% healthy\nguarantee' },
            { emoji: '⭐', text: '4.9 rating\n50k+ happy' },
            { emoji: '💬', text: '24/7 plant\nexpert support' },
          ].map((b) => (
            <View key={b.text} style={styles.benefitItem}>
              <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark },
  topBarSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  cartBtn: { padding: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.pill,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: '#9CA3AF', fontSize: FontSize.base },
  bannerImage: { width: '100%', height: 180 },
  bannerContent: { position: 'absolute', bottom: 20, left: 20 },
  bannerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { width: 18, backgroundColor: Colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  catChip: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
    minWidth: 80,
  },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 11, fontWeight: '600', color: Colors.textDark, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardImg: { height: CARD_W, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: Spacing.sm },
  cardName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  cardPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  cardMrp: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  benefitsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    gap: 0,
  },
  benefitItem: { flex: 1, alignItems: 'center', gap: 6 },
  benefitText: { fontSize: 9, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 14 },
});
