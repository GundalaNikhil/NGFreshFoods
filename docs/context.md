# NGFreshFoods — Frontend Context

> This document describes the frontend architecture, conventions, and key patterns of the NGFreshFoods React Native mobile app. It is intended to be read by LLMs, AI coding assistants, and new developers to quickly understand the codebase.

---

## 1. Project Overview

**NGFreshFoods** is a React Native mobile app for a single-store fresh foods delivery business. It supports customer ordering, payment, and an admin panel — all in one app.

| Property | Value |
|---|---|
| **Framework** | React Native 0.83 + Expo SDK 55 |
| **Router** | Expo Router (file-based routing) |
| **State Management** | Recoil (atoms + selectors) |
| **Server State** | TanStack React Query v5 |
| **HTTP Client** | Axios (with interceptors for auth refresh) |
| **Styling** | NativeWind (Tailwind CSS for RN) |
| **Payments** | Razorpay React Native SDK |
| **Auth** | Firebase Phone OTP → server JWT (HTTP-only cookies) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Builds** | EAS Build (Expo Application Services) |
| **OTA Updates** | EAS Update |
| **Monitoring** | Sentry React Native |
| **Package** | `com.nick.ngfreshfoods` (Android) / `com.nick.ngfreshfoods` (iOS) |

---

## 2. Directory Structure

```
NGFreshFoods/
├── app/
│   └── index.jsx              # Entry point (Expo Router)
│
├── components/
│   ├── Home/                  # Home screen: address header, categories, banner, slideshow
│   ├── Products/              # Product list, cards, modals, filters, customization
│   ├── Cart/                  # Cart view, checkout sheet, promo code, order summary
│   │   ├── Cart.js            # Main cart component
│   │   ├── CheckoutSheet.js   # Bottom sheet for address + payment method selection
│   │   ├── CartPromoCode.js   # Promo/coupon input
│   │   ├── CartSummary.js     # Price breakdown
│   │   ├── OrderSuccessScreen # Post-payment success view
│   │   ├── OrderDetailScreen  # Individual order details
│   │   └── Offers/            # Offers modal and cards
│   ├── Account/               # User profile, account hub
│   ├── Admin/                 # Admin panel (orders, products, users, coupons, settings, broadcast)
│   ├── Login/                 # Auth flow: phone → OTP → profile completion
│   ├── Notifications/         # Push notification registration & handling
│   ├── About/                 # About page
│   ├── ResuableComponents/    # CachedImage, Loader
│   └── bottomNavScreens/     # Tab navigator screen wrappers
│
├── hooks/
│   ├── usePayment.js          # 🔑 Core payment orchestration hook
│   ├── useCart.js             # Cart state management
│   ├── useProducts.js         # Product fetching & caching
│   ├── useAddress.js          # Address CRUD
│   └── useOffers.js           # Coupon/offers logic
│
├── services/
│   ├── config/
│   │   └── endpoints.js       # All API endpoint URLs (centralized)
│   ├── http/
│   │   ├── apiClient.js       # Axios instance with auth interceptors
│   │   └── deviceId.js        # Device ID generation/persistence
│   ├── bff/                   # Backend-for-Frontend service modules
│   │   ├── paymentBff.js      # createOrder, verifyPayment, verifyPaymentAsync, getPaymentStatus, retryPayment
│   │   ├── authBff.js         # signup, login, refresh, logout
│   │   ├── cartBff.js         # server cart sync
│   │   ├── productsBff.js     # product fetching
│   │   ├── couponsBff.js      # coupon validation
│   │   ├── accountBff.js      # profile, addresses
│   │   ├── adminBff.js        # admin operations
│   │   └── shopBff.js         # shop status
│   ├── firebaseConfig.js      # Firebase initialization
│   └── notifications/
│       └── pushNotifications.js # FCM token registration
│
├── recoil/
│   ├── atoms/                 # State atoms
│   │   ├── authAtom.js        # Auth state (isLoggedIn, tokens)
│   │   ├── cartAtom.js        # Cart items, counts
│   │   ├── paymentAtom.js     # Payment/checkout state
│   │   ├── productsAtom.js    # Product catalog
│   │   ├── profileAtom.js     # User profile
│   │   ├── discountAtom.js    # Applied discounts
│   │   ├── ordersAtom.js      # Order history
│   │   ├── notificationAtom.js # Notification badge
│   │   └── persistAtom.js     # AsyncStorage persistence helper
│   └── selectors/
│       ├── cartSelector.js    # Computed cart totals
│       ├── productSelector.js # Filtered/sorted products
│       └── userSelector.js    # User-derived state
│
├── providers/
│   └── CartSyncManager.js     # Syncs local cart with server on auth changes
│
├── utils/
│   ├── cartHelper.js          # Cart calculation utilities
│   ├── errorHandler.js        # Centralized error formatting
│   ├── imageUrl.js            # Cloudinary image URL builder
│   ├── imageCache.js          # Image caching logic
│   ├── localCache.js          # AsyncStorage cache wrapper
│   ├── productClassification.js # Product type classification
│   └── promoHelper.js         # Promo code helpers
│
├── assets/                    # Images, fonts, splash screens
├── plugins/                   # Expo config plugins
│   └── withFullScreenSplash.js # Custom splash screen plugin
├── scripts/                   # Build scripts
├── app.json                   # Expo config (icons, splash, plugins, EAS)
├── app.config.js              # Dynamic Expo config (google-services injection)
├── eas.json                   # EAS Build profiles (dev, preview, production)
└── .env.local                 # Environment variables (not committed)
```

---

## 3. Authentication Flow

```
1. User enters phone number
   └─ Firebase Phone Auth sends OTP

2. User enters OTP
   └─ Firebase verifies → returns idToken
   └─ App sends idToken to POST /api/v1/onboarding/firebase/login-otp
   └─ Backend verifies with Firebase Admin SDK
   └─ Backend returns Set-Cookie: accessToken, refreshToken (HttpOnly)

3. All subsequent API calls:
   └─ Axios automatically sends cookies (withCredentials: true)
   └─ On 401: interceptor auto-refreshes via POST /onboarding/refresh-token
   └─ If refresh fails: onAuthFailure callback → redirect to login
```

### Key Implementation Details:
- **No token stored in JS** — tokens are HTTP-only cookies, safe from XSS
- **Auto-refresh**: `apiClient.js` interceptor queues requests during refresh and replays them
- **Device ID**: Each device gets a persistent UUID (`X-Device-Id` header) for session tracking

---

## 4. Payment Flow (usePayment.js)

This is the most complex hook in the app. Here's the flow:

```
┌──────────────────────────────────────────────────────┐
│  User taps "Place Order"                              │
│  └─ startCheckout()                                   │
│     ├─ checkoutState → "CREATING_ORDER"               │
│     ├─ POST /orders/create                            │
│     │   └─ Gets: razorPayOrderId, razorpayKeyId       │
│     │                                                  │
│     ├─ If COD → immediate SUCCESS                     │
│     ├─ If ONLINE:                                     │
│     │   ├─ checkoutState → "AWAITING_PAYMENT"         │
│     │   ├─ Open Razorpay Checkout SDK                 │
│     │   │                                              │
│     │   ├─ On Razorpay success callback:              │
│     │   │   ├─ checkoutState → "SUCCESS" (optimistic) │
│     │   │   ├─ POST /payments/confirmPaymentAsync     │
│     │   │   └─ (fire-and-forget, backend verifies)    │
│     │   │                                              │
│     │   ├─ On Razorpay failure:                       │
│     │   │   ├─ If user cancelled → "CANCELLED"        │
│     │   │   ├─ Else → fallback verification           │
│     │   │   │   └─ GET /payments/{orderId}/status     │
│     │   │   └─ If still failed → show retry option    │
│     │   │                                              │
│     │   └─ Retry flow:                                │
│     │       ├─ POST /payments/{orderId}/retry          │
│     │       └─ Reopens Razorpay with same order       │
└──────────────────────────────────────────────────────┘
```

### Checkout States:
`IDLE` → `CREATING_ORDER` → `AWAITING_PAYMENT` → `SUCCESS` | `FAILED` | `CANCELLED`

### Error Handling:
- Server errors (500) → "Our servers are busy. Please try again in a moment."
- Auth errors (401) → "Session expired. Please log in again."
- Shop closed (409) → Shows shop closed message
- Generic fallback → "Something went wrong. Please try again."
- **No technical details are ever shown to users**

---

## 5. State Management

### Recoil Atoms (Global State)
| Atom | Purpose |
|---|---|
| `authAtom` | Login state, user session |
| `cartAtom` | Cart items, item counts |
| `paymentAtom` | Checkout state, current order, Razorpay config |
| `productsAtom` | Product catalog cache |
| `profileAtom` | User profile, addresses |
| `discountAtom` | Applied promo codes and amounts |
| `ordersAtom` | Order history |
| `notificationAtom` | Unread notification count |

### Computed State (Selectors)
| Selector | Derives |
|---|---|
| `cartSelector` | Total price, item count, delivery fee |
| `productSelector` | Filtered/sorted product lists |
| `userSelector` | Auth-derived user properties |

### Server State
- **TanStack React Query** handles server-state caching, background refetching, and stale-while-revalidate patterns
- Used primarily for product lists and order history

---

## 6. BFF (Backend-for-Frontend) Layer

All API calls go through `services/bff/*.js` modules. Each module wraps Axios calls in a `{ success, data, error }` format:

```javascript
// Every BFF function returns this shape:
{ success: true,  data: responseData, error: null }
{ success: false, data: null,         error: { message, code, status } }
```

This standardized format means **no component ever handles raw Axios errors** — they always get a clean result object.

---

## 7. API Endpoints

All endpoints are centralized in `services/config/endpoints.js`. The base URL is configured via:
- **Dev**: `EXPO_PUBLIC_API_BASE_URL` env var, or auto-detected (`10.0.2.2:8080` for Android emulator, `localhost:8080` for iOS)
- **Prod**: Must be set to the Cloud Run HTTPS URL

### Endpoint Groups:
| Group | Prefix | Key Operations |
|---|---|---|
| Auth | `/api/v1/onboarding/` | signup, login, refresh, logout |
| Cart | `/api/v1/cart` | get, update, merge |
| Users | `/api/v1/users/me` | profile, addresses |
| Products | `/api/v1/products` | catalog, categories |
| Orders | `/api/v1/orders` | create, list, detail |
| Payments | `/api/v1/payments` | confirm, confirmAsync, status, retry |
| Coupons | `/api/v1/coupons` | active list, validate |
| Shop | `/api/v1/shop` | status (open/closed) |
| Admin | `/api/v1/admin/` | dashboard, orders, products, users, coupons, settings, broadcast |

---

## 8. Admin Panel

The app includes a built-in admin panel (role-based, same app):

| Screen | Function |
|---|---|
| `AdminDashboard` | Revenue, order counts, active users |
| `AdminOrders` | View/update order statuses, process refunds, mark COD received |
| `AdminProducts` | CRUD products, manage stock, variants |
| `AdminUsers` | View registered users |
| `AdminCoupons` | Create/edit/delete coupon codes |
| `AdminShopSettings` | Toggle shop open/closed, set hours |
| `AdminBroadcast` | Send push notifications to all users |

---

## 9. Key UI Libraries

| Library | Used For |
|---|---|
| NativeWind (Tailwind) | All styling via `className` props |
| Lucide React Native | Icons |
| React Native Paper | Material Design components |
| React Native Reanimated | Animations |
| React Native Gesture Handler | Swipe, pan gestures |
| React Native Toast Message | Toast notifications |
| Expo Image | Optimized image loading |
| Expo Haptics | Haptic feedback on interactions |

---

## 10. Running Locally

```bash
# 1. Install dependencies
cd NGFreshFoods/
npm install

# 2. Set up environment
cp app-dev.yml .env.local  # or create .env.local with the env vars

# 3. Prebuild native projects (required for Razorpay, Firebase)
npx expo prebuild --clean

# 4. Run on device/emulator
npx expo run:android   # Android
npx expo run:ios       # iOS

# NOTE: Expo Go does NOT work — native modules (Razorpay, Firebase)
# require a development build.
```

### Required Files (not in git):
- `.env.local` — environment variables
- `google-services.json` — Firebase config for Android (in repo root)
- `GoogleService-Info.plist` — Firebase config for iOS (if building iOS)

---

## 11. Build & Deployment

| Profile | Command | Distribution | Channel |
|---|---|---|---|
| Development | `eas build --profile development` | Internal | `development` |
| Preview (APK) | `eas build --profile preview` | Internal (APK) | `preview` |
| Production | `eas build --profile production` | Store | `production` |

- **OTA Updates**: `eas update --channel production` pushes JS bundle updates without rebuilding
- **EAS Project ID**: `9bcd6544-2221-42d1-bf0a-58cb225a525c`
- **Runtime Version**: `1.0.0`

---

## 12. Key Conventions for AI Assistants

1. **BFF pattern** — never call Axios directly from components; always go through `services/bff/*.js`
2. **Standardized error shape** — all BFF functions return `{ success, data, error }`, never throw
3. **usePayment.js is the most sensitive file** — changes to payment flow must preserve idempotency, retry logic, and optimistic confirmation
4. **No technical errors to users** — error messages must be human-friendly (see `usePayment.js` error mapping)
5. **NativeWind styling** — use `className` with Tailwind classes, not `StyleSheet.create()`
6. **Recoil for global state** — don't introduce new state libraries; use atoms for persistent state, selectors for derived
7. **Expo Router for navigation** — file-based routing in `app/` directory
8. **Razorpay requires native build** — `npx expo prebuild --clean && npx expo run:android` after changes
9. **Cart syncs server-side** — `CartSyncManager` merges local cart to server on login
10. **Images via Cloudinary** — product images use Cloudinary URLs with transformation parameters

