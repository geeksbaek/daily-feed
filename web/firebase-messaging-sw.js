// Firebase Cloud Messaging Service Worker

// Firebase SDK 임포트
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Firebase 설정 로드
const getFirebaseConfig = () => {
  // 환경 변수에서 우선 로드
  if (self.FIREBASE_CONFIG) {
    return self.FIREBASE_CONFIG;
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

const firebaseConfig = getFirebaseConfig();

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 서비스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '🗞️ Daily Feed';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 기술 뉴스 요약이 준비되었습니다!',
    icon: payload.notification?.icon || '/daily-feed/icons/icon.svg',
    badge: '/daily-feed/icons/icon.svg',
    tag: 'daily-feed-' + (payload.data?.date || Date.now()),
    data: {
      url: payload.data?.url || '/daily-feed/',
      date: payload.data?.date,
      click_action: payload.data?.click_action || '/daily-feed/'
    },
    actions: [
      {
        action: 'open',
        title: '보기',
        icon: '/daily-feed/icons/icon.svg'
      },
      {
        action: 'close', 
        title: '닫기'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('FCM 알림 클릭:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/daily-feed/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // 이미 열린 Daily Feed 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes('/daily-feed') && 'focus' in client) {
          return client.focus().then(() => {
            // 특정 날짜로 이동이 필요하면 메시지 전송
            if (event.notification.data?.date) {
              client.postMessage({
                type: 'NAVIGATE_TO_DATE',
                date: event.notification.data.date
              });
            }
          });
        }
      }
      
      // 열린 탭이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  console.log('FCM 알림 닫기:', event);
  
  // 분석을 위한 이벤트 로깅 (선택적)
  if (event.notification.data?.date) {
    console.log('알림 닫힘:', event.notification.data.date);
  }
});