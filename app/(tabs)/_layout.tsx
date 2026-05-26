import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '@/store/cart.store';
import { Colors, FontSize } from '@/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.icon, focused && tabStyles.iconActive]}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

function CartTabIcon({ focused }: { focused: boolean }) {
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  return (
    <View style={[tabStyles.icon, focused && tabStyles.iconActive]}>
      <View>
        <Text style={tabStyles.emoji}>🛒</Text>
        {totalItems > 0 && (
          <View style={tabStyles.badge}>
            <Text style={tabStyles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
          </View>
        )}
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>Cart</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingBottom: 4,
          paddingTop: 4,
          height: 64,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Browse" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  icon: { alignItems: 'center', paddingTop: 4 },
  iconActive: {},
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  labelActive: { color: Colors.primary, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
