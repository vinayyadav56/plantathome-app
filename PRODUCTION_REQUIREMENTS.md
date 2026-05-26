# PlantAtHome App — Production Requirements

## 1. Developer Accounts

| Account | Cost | Link |
|---|---|---|
| Apple Developer Program | $99/year | developer.apple.com |
| Google Play Developer | $25 one-time | play.google.com/console |

---

## 2. Expo / EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (create free at expo.dev)
eas login

# Configure builds
eas build:configure
```

You need a free Expo account at [expo.dev](https://expo.dev).

---

## 3. iOS Requirements (App Store)

### 3.1 Apple Developer Setup
- Enroll in Apple Developer Program ($99/year)
- Create an **App ID** in Certificates, Identifiers & Profiles
  - Bundle ID: `in.plantathome.app`
- Create an **App Store Connect** listing at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

### 3.2 App Store Connect Listing
Fill in the following before submission:

| Field | Content |
|---|---|
| App Name | PlantAtHome |
| Subtitle | Plants Delivered to Your Door |
| Category | Shopping |
| Age Rating | 4+ |
| Privacy Policy URL | https://plantathome.in/privacy |
| Support URL | https://plantathome.in/contact |

### 3.3 Screenshots Required
- iPhone 6.7" (iPhone 15 Pro Max) — **3–10 screenshots**
- iPhone 5.5" (iPhone 8 Plus) — **3–10 screenshots**
- iPad 12.9" — if you support iPad

Use [Figma](https://figma.com) or [AppLaunchpad](https://theapplaunchpad.com) to create them.

### 3.4 iOS Build
```bash
# Production build for App Store
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios
```

### 3.5 iOS Privacy Permissions (already in app.json)
- `NSCameraUsageDescription` — for profile photo upload
- `NSPhotoLibraryUsageDescription` — for profile photo upload
- `NSLocationWhenInUseUsageDescription` — for delivery address

---

## 4. Android Requirements (Google Play)

### 4.1 Google Play Console Setup
- Pay $25 one-time developer fee
- Create app in Play Console → **in.plantathome.app**
- Complete **Data safety** form (what data you collect)

### 4.2 Store Listing
| Field | Content |
|---|---|
| Title | PlantAtHome - Buy Plants Online |
| Short description (80 chars) | 840+ fresh plants delivered to your door same day |
| Full description | See below |
| Category | Shopping |
| Content rating | Everyone |

**Full description:**
```
Discover 840+ premium indoor & outdoor plants from local nurseries 
across India. PlantAtHome makes it easy to bring nature home with 
same-day delivery, expert plant care guides, and personalised 
watering reminders.

🌿 Browse 840+ plants — indoor, outdoor, succulents, herbs & more
🚚 Same-day delivery when you order before 2 PM
⭐ 4.9 rating from 50,000+ happy plant parents
💚 100% healthy plants — guaranteed or we replace them
📖 Expert care guides for every plant you own
```

### 4.3 Screenshots Required
- Phone screenshots: **2–8 images** (min 1080×1920px)
- 7-inch tablet: optional
- 10-inch tablet: optional
- Feature graphic: 1024×500px banner image

### 4.4 Android Build
```bash
# Production build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## 5. Environment Variables for EAS

Add secrets to EAS (never commit these):
```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://api.plantathome.in"
eas secret:create --scope project --name EXPO_PUBLIC_RAZORPAY_KEY_ID --value "rzp_live_XXXXXXXXXXXXXXXX"
```

Switch Razorpay from test key (`rzp_test_...`) to **live key** before production builds.

---

## 6. Razorpay Live Setup

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC verification (business PAN, bank account)
3. Go to **Settings → API Keys → Generate Live Key**
4. Update `EXPO_PUBLIC_RAZORPAY_KEY_ID` to the live key
5. Update your Laravel API `.env`:
   ```
   RAZORPAY_KEY=rzp_live_XXXXXXXXXXXXXXXX
   RAZORPAY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

## 7. Push Notifications (Optional but Recommended)

```bash
# EAS handles APNs and FCM automatically
eas credentials
```

- **iOS**: EAS generates APNs key automatically via your Apple account
- **Android**: EAS uses FCM (Firebase Cloud Messaging) — provide `google-services.json`

For notification logic, add `expo-notifications`:
```bash
npx expo install expo-notifications
```

---

## 8. App Icons & Splash Screen

Replace placeholder assets:

| File | Size | Usage |
|---|---|---|
| `assets/icon.png` | 1024×1024px | App icon (no transparency) |
| `assets/adaptive-icon.png` | 1024×1024px | Android adaptive icon |
| `assets/splash.png` | 1284×2778px | Splash screen |
| `assets/favicon.png` | 32×32px | Web favicon |

Use the PlantAtHome green (#1B5E20) background with the leaf logo.

---

## 9. Pre-Launch Checklist

### Technical
- [ ] Switch Razorpay to live mode
- [ ] Set `EXPO_PUBLIC_API_URL` to production API
- [ ] Test complete purchase flow end-to-end on real device
- [ ] Test on iOS (iPhone 13+) and Android (API 33+)
- [ ] Test offline behaviour (no internet connection)
- [ ] Verify push notifications work
- [ ] Verify deep links work (`plantathome.in/product/...`)

### Store Listings
- [ ] App icon uploaded (1024×1024, no transparency)
- [ ] Screenshots uploaded for all required sizes
- [ ] Privacy policy published at `plantathome.in/privacy`
- [ ] App description written and proofread
- [ ] Age rating / content rating completed
- [ ] Data safety form completed (Play Store)

### Legal
- [ ] Privacy Policy covers: account data, location, purchase history
- [ ] Terms of Service covers: refund/return policy, delivery policy
- [ ] GST registration for in-app purchases (if applicable)

---

## 10. Build & Submit Commands Summary

```bash
# Install dependencies
npm install

# Start dev server (scan QR with Expo Go app)
npx expo start

# Build for both platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Over-the-air update (after publish, no store review needed)
eas update --branch production --message "Bug fix"
```

---

## 11. Post-Launch

### App Review Time
- **App Store**: 1–3 business days (first submission may take up to 7 days)
- **Google Play**: 3–7 days for first app, 1–3 days for updates

### Monitoring
- Use **Sentry** for crash reporting: `npx expo install @sentry/react-native`
- Use **Expo Analytics** or **Firebase Analytics** for user behaviour

### OTA Updates
Minor bug fixes and content changes can be pushed without store review:
```bash
eas update --branch production --message "Fix cart bug"
```

---

## 12. Estimated Timeline

| Step | Time |
|---|---|
| Developer accounts approved | 1–2 days |
| Design app icon & screenshots | 1–2 days |
| EAS build (iOS + Android) | 30–60 min |
| App Store review | 1–3 days |
| Google Play review | 3–7 days |
| **Total to live** | **~1–2 weeks** |
