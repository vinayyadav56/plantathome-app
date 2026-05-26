import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Image, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/config';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
    title: 'Bring Nature Home',
    subtitle: '840+ premium plants delivered fresh from local nurseries straight to your door.',
    gradient: ['#0D3D14', '#1B5E20'],
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800',
    title: 'Expert Plant Care',
    subtitle: 'Get personalised care guides, watering reminders, and expert tips for every plant.',
    gradient: ['#1B5E20', '#2E7D32'],
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    title: 'Same Day Delivery',
    subtitle: 'Order before 2PM and get your plants delivered the same day — healthy & thriving.',
    gradient: ['#2E7D32', '#388E3C'],
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true');
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image
              source={{ uri: item.image }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[...item.gradient, 'rgba(0,0,0,0.3)'] as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          </View>
        )}
      />

      <SafeAreaView style={styles.content}>
        {/* Skip button */}
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Bottom content */}
        <View style={styles.bottom}>
          <Text style={styles.title}>{slides[currentIndex].title}</Text>
          <Text style={styles.subtitle}>{slides[currentIndex].subtitle}</Text>

          {/* Dots */}
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={['#ffffff', '#f0fdf4']}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  content: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  skipBtn: { alignSelf: 'flex-end', padding: Spacing.md, margin: Spacing.sm },
  skipText: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, fontWeight: '600' },
  bottom: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  title: {
    fontFamily: 'System',
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: '#fff',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: '#fff' },
  cta: { borderRadius: Radius.pill, overflow: 'hidden', marginBottom: Spacing.md },
  ctaGradient: { padding: 18, alignItems: 'center' },
  ctaText: { color: Colors.primary, fontSize: FontSize.base, fontWeight: '700' },
  loginLink: { alignItems: 'center' },
  loginText: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  loginBold: { color: '#fff', fontWeight: '700' },
});
