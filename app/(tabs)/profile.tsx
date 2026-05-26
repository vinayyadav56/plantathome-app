import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/constants/theme';

function MenuItem({ emoji, label, onPress, danger }: {
  emoji: string; label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { clearCart } = useCartStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearCart();
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.guestContainer}>
          <Text style={{ fontSize: 64, marginBottom: Spacing.lg }}>👤</Text>
          <Text style={styles.guestTitle}>Welcome to PlantAtHome</Text>
          <Text style={styles.guestText}>Sign in to access your profile, orders, and saved plants</Text>
          <TouchableOpacity style={styles.authBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.authBtnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.authBtnOutline} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.authBtnOutlineText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.profileBg}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders', value: '—' },
            { label: 'Wishlist', value: '—' },
            { label: 'Reviews', value: '—' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="📦" label="My Orders" onPress={() => router.push('/(tabs)/orders')} />
            <MenuItem emoji="📍" label="Delivery Addresses" onPress={() => {}} />
            <MenuItem emoji="💳" label="Payment Methods" onPress={() => {}} />
            <MenuItem emoji="🔔" label="Notifications" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="🌿" label="Plant Care Guides" onPress={() => {}} />
            <MenuItem emoji="💬" label="Chat with Expert" onPress={() => {}} />
            <MenuItem emoji="❓" label="FAQ & Help" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.menuCard}>
            <MenuItem emoji="⭐" label="Rate the App" onPress={() => {}} />
            <MenuItem emoji="📋" label="Terms & Privacy" onPress={() => {}} />
            <MenuItem emoji="🚪" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={styles.version}>PlantAtHome v1.0.0</Text>
      </ScrollView>
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
  guestContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, paddingTop: 80 },
  guestTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textDark, marginBottom: 8 },
  guestText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  authBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14, paddingHorizontal: Spacing.xl, width: '100%', alignItems: 'center', marginBottom: Spacing.sm },
  authBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  authBtnOutline: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: 14, paddingHorizontal: Spacing.xl, width: '100%', alignItems: 'center' },
  authBtnOutlineText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '700' },
  profileBg: { paddingTop: Spacing.xl, paddingBottom: Spacing.xl * 1.5, alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: FontSize.xl, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: '#fff', borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuEmoji: { fontSize: 20, marginRight: Spacing.sm },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textDark, fontWeight: '500' },
  menuChevron: { fontSize: 22, color: '#D1D5DB' },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted, padding: Spacing.xl },
});
