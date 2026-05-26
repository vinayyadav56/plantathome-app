import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cart.store';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';
import { CURRENCY } from '@/constants/config';
import type { Product } from '@/types';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

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
        {!product.in_stock && (
          <View style={styles.oosOverlay}>
            <Text style={styles.oosText}>Out of Stock</Text>
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
        {product.in_stock && (
          <TouchableOpacity style={styles.addBtn} onPress={() => addItem(product)} activeOpacity={0.8}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const [search, setSearch] = useState(params.search ?? '');
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { data: catData } = useCategories();
  const categories = catData ?? [];

  const queryParams: Record<string, any> = {};
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (selectedCategory) queryParams.category = selectedCategory;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useProducts(queryParams);
  const products = data?.pages.flatMap((p) => p.data) ?? [];

  const handleSearchChange = (text: string) => {
    setSearch(text);
    clearTimeout((handleSearchChange as any)._t);
    (handleSearchChange as any)._t = setTimeout(() => setDebouncedSearch(text), 400);
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Search plants..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
              <Text style={{ fontSize: 16, color: Colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      {categories.length > 0 && (
        <FlatList
          data={[{ id: 0, name: 'All', slug: '' } as any, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(c) => c.id.toString()}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item.slug && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(item.slug ?? '')}
            >
              <Text style={[
                styles.filterText,
                selectedCategory === item.slug && styles.filterTextActive,
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Product grid */}
      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🌱</Text>
          <Text style={styles.emptyTitle}>No plants found</Text>
          <Text style={styles.emptyText}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => p.id.toString()}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: Spacing.sm }}
          renderItem={({ item }) => <ProductCard product={item} />}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 0 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textDark },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textDark },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  grid: { padding: Spacing.lg, gap: Spacing.sm },
  card: { backgroundColor: '#fff', borderRadius: Radius.card, overflow: 'hidden', ...Shadow.sm },
  cardImg: { height: CARD_W, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#EF4444', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  oosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oosText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  cardBody: { padding: Spacing.sm },
  cardName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textDark, marginBottom: 4 },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  cardPrice: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  cardMrp: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 6, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textDark, marginBottom: 4 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted },
});
