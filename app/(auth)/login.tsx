import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth.store';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.header}>
            <Text style={styles.logo}>🌿 PlantAtHome</Text>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to continue</Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Sign In</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text style={styles.linkBold}>Create one</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.link}>
              <Text style={styles.linkText}>← Continue as guest</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  logo: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: Spacing.lg },
  heading: { fontSize: FontSize.hero, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  sub: { fontSize: FontSize.base, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
  form: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  error: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    fontSize: FontSize.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.base,
    color: Colors.textDark,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: Spacing.md },
  linkText: { color: Colors.textMuted, fontSize: FontSize.sm },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
