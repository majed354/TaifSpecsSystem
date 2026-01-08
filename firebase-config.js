// ⚠️ إعدادات Firebase - قم بتحديث هذه البيانات من مشروعك في Firebase Console
// اتبع الخطوات في README.md لإنشاء مشروع Firebase جديد

const firebaseConfig = {
  // ⬇️ استبدل هذه القيم ببيانات مشروعك من Firebase Console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// الحصول على مراجع الخدمات
const database = firebase.database();
const storage = firebase.storage();
const auth = firebase.auth();

// تفعيل المصادقة المجهولة
auth.signInAnonymously().catch((error) => {
  console.error('خطأ في المصادقة:', error);
});

// إعدادات PDF.js
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

console.log('✅ تم تهيئة Firebase بنجاح');
