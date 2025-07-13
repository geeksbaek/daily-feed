// Firebase 설정 관리
export const getFirebaseConfig = () => {
  // 환경 변수에서 우선 로드
  if (window.FIREBASE_CONFIG) {
    return window.FIREBASE_CONFIG;
  }
  
  // 실제 Firebase 설정
  return {
    apiKey: "AIzaSyA6AHMeoV2zS9neshxKz8OOILHEvZ_Moqk",
    authDomain: "daily-feed-notifications.firebaseapp.com",
    projectId: "daily-feed-notifications",
    storageBucket: "daily-feed-notifications.firebasestorage.app",
    messagingSenderId: "935720792015",
    appId: "1:935720792015:web:7ec05f0903170647766cba"
  };
};

export const getVapidKey = () => {
  return window.VAPID_KEY || "BEyc8qUl-Tmqu3kdcQib7k2gTfzcfmQKcQX8dsDjFlkKkn_MzGguLjhi0kFQL6TkE8SLCM6GCb5FhUIdtle0370";
};

// 설정 검증
export const validateFirebaseConfig = (config) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !config[key] || config[key] === 'PENDING_CONFIG');
  return missing.length === 0;
};