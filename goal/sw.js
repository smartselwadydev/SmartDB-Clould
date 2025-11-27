/**
 * عامل الخدمة (Service Worker) لتطبيق "يلا جول"
 * الهدف: تفعيل ميزات PWA مثل العمل دون اتصال وتخزين الأصول الأساسية مؤقتاً.
 */

// اسم ذاكرة التخزين المؤقت وإصدارها. قم بتغيير رقم الإصدار (v1) عند تحديث الأصول.
const CACHE_NAME = 'yalla-goal-cache-v1';

// قائمة بالملفات الأساسية التي يجب تخزينها مؤقتاً عند التثبيت.
// المسار '/' ضروري لتحميل الصفحة الرئيسية بشكل صحيح في وضع PWA.
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    // الأيقونات والموارد الأخرى المستخدمة في ملف HTML
    '/assets/192.png',
    '/assets/icon.png',
    // ملفات CDN لـ Tailwind والخطوط
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap'
];

// 1. مرحلة التثبيت (Install)
// يتم خلالها فتح الكاش وتخزين جميع الملفات الأساسية المحددة في 'urlsToCache'.
self.addEventListener('install', (event) => {
    // يضمن أن يظل عامل الخدمة في حالة الانتظار حتى يتم تخزين جميع الملفات بنجاح.
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Service Worker: Cache opened, pre-caching essential files.');
            // إضافة جميع الملفات للقائمة السوداء
            return cache.addAll(urlsToCache);
        })
        .then(() => {
            // يتم تخطي مرحلة الانتظار والانتقال مباشرة إلى مرحلة التفعيل
            return self.skipWaiting();
        })
    );
});

// 2. مرحلة الجلب (Fetch)
// يتم استخدام استراتيجية "Cache First" (الكاش أولاً) لجلب المحتوى.
self.addEventListener('fetch', (event) => {
    // تتجاهل جميع الطلبات من مصدر 'chrome-extension'
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // إذا تم العثور على استجابة في الكاش، قم بإرجاعها مباشرةً.
            if (response) {
                return response;
            }
            // إذا لم يتم العثور عليها، قم بجلبها من الشبكة.
            return fetch(event.request);
        })
        .catch(error => {
            // يمكن إضافة استجابة احتياطية هنا لصفحة عدم الاتصال بالإنترنت
            console.error('Fetch failed:', error);
            // كمثال: العودة إلى صفحة 'index.html' إذا فشل جلب أي شيء.
            if (event.request.mode === 'navigate') {
                return caches.match('index.html');
            }
        })
    );
});

// 3. مرحلة التفعيل (Activate)
// يتم فيها تنظيف أي نسخ قديمة من الكاش لضمان استخدام الإصدار الأحدث فقط.
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // إذا لم يكن اسم الكاش ضمن القائمة البيضاء، قم بحذفه.
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // تأكيد تفعيل عامل الخدمة فوراً
            return self.clients.claim();
        })
    );
});