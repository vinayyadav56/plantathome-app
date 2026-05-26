import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/constants/config';

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.onboarded).then((val) => {
      setOnboarded(val === 'true');
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
