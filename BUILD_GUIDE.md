# دليل بناء APK - دليل الشرقاط

## ما تم تجهيزه
- Service Worker احترافي (offline-first)
- تخزين محلي كامل (localStorage)
- مزامنة تلقائية عند عودة الاتصال
- إعدادات Capacitor لتحويل PWA إلى APK
- manifest.json محسّن للأندرويد
- أيقونات بجميع الأحجام

---

## المتطلبات
- Node.js 18+ من https://nodejs.org
- Android Studio من https://developer.android.com/studio
- Java JDK 17 (مثبّت مع Android Studio)

---

## خطوات البناء

### 1 - تثبيت المكتبات
```
npm install
```

### 2 - بناء التطبيق
```
npm run build
```
يجب أن يظهر مجلد dist/ بعد هذه الخطوة.

### 3 - إضافة منصة Android
```
npx cap add android
```

### 4 - مزامنة الملفات
```
npx cap sync android
```

### 5 - فتح Android Studio
```
npx cap open android
```

### 6 - توليد APK
في Android Studio:
Build > Generate Signed Bundle / APK
اختر: APK
أنشئ Keystore جديد أو استخدم القديم
اختر: release
اضغط Finish

الـ APK سيكون في:
android/app/build/outputs/apk/release/app-release.apk

---

## البناء السريع بأمر واحد
```
npm install && npm run build && npx cap sync android
```
ثم افتح Android Studio وابنِ APK.

---

## البديل الأسهل - PWA Builder (بدون Android Studio)
1. ارفع مجلد dist/ على Netlify.com أو Vercel.com (مجاناً)
2. افتح https://pwabuilder.com
3. أدخل رابط موقعك
4. اضغط Package for Stores
5. حمّل APK مباشرة

---

## هيكل المشروع
```
shirqat-guide/
├── public/
│   ├── sw.js                    Service Worker
│   ├── manifest.json            إعدادات PWA
│   └── icons/                   أيقونات التطبيق
├── src/
│   ├── App.tsx                  التطبيق الرئيسي
│   ├── services/
│   │   ├── api.ts               API مع offline fallback
│   │   └── localDataService.ts  إدارة localStorage
│   └── hooks/
│       └── useOfflineSync.ts    مزامنة تلقائية
├── capacitor.config.json        إعدادات Capacitor
└── package.json                 التبعيات
```

---

## معلومات التطبيق
- App ID: com.shirqat.guide
- الإصدار: 2.0.0
- الحد الأدنى للأندرويد: API 22 (Android 5.1+)
