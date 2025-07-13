// Firebase FCM 푸시 알림 관리자
import { getFirebaseConfig, getVapidKey, validateFirebaseConfig } from '../config.js';

export class FirebasePushManager {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.isInitialized = false;
    
    // 설정 로드
    this.firebaseConfig = getFirebaseConfig();
    this.vapidKey = getVapidKey();
  }

  async init() {
    try {
      
      // 설정 검증
      if (!validateFirebaseConfig(this.firebaseConfig)) {
        throw new Error('Firebase 설정이 불완전합니다. config.js를 확인해주세요.');
      }

      // Firebase SDK 동적 로드
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');
      
      // Firebase 앱 초기화
      const app = initializeApp(this.firebaseConfig);
      this.messaging = getMessaging(app);
      
      // Service Worker 등록 및 활성화 대기
      const registration = await navigator.serviceWorker.register('/daily-feed/firebase-messaging-sw.js');
      
      // Service Worker가 활성화될 때까지 대기
      
      if (registration.installing) {
        await new Promise((resolve, reject) => {
          const worker = registration.installing;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              resolve();
            } else if (worker.state === 'redundant') {
              reject(new Error('Service Worker가 redundant 상태가 되었습니다. firebase-messaging-sw.js에 오류가 있을 수 있습니다.'));
            }
          });
          
          // 타임아웃 추가 (10초)
          setTimeout(() => {
            reject(new Error('Service Worker 활성화 타임아웃'));
          }, 10000);
        });
      } else if (!registration.active) {
        await navigator.serviceWorker.ready;
      }
      
      // 포그라운드 메시지 수신 처리
      onMessage(this.messaging, (payload) => {
        this.showNotification(payload);
      });
      
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('Firebase FCM 초기화 실패:', error);
      throw error;
    }
  }

  async requestPermissionAndGetToken() {
    try {
      const { getToken } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js');
      
      // 알림 권한 요청
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('알림 권한이 거부되었습니다.');
      }

      // Service Worker가 준비될 때까지 대기
      await navigator.serviceWorker.ready;
      
      // FCM 토큰 획득 (등록된 Service Worker 사용)
      const swRegistration = await navigator.serviceWorker.getRegistration('/daily-feed/');
      this.token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: swRegistration
      });

      if (this.token) {
        // daily-feed 토픽에 구독
        await this.subscribeToTopic(this.token, 'daily-feed');
        
        await this.sendTokenToServer(this.token);
        return this.token;
      } else {
        throw new Error('FCM 토큰 획득 실패');
      }
      
    } catch (error) {
      console.error('토큰 획득 실패:', error);
      throw error;
    }
  }

  async sendTokenToServer(token) {
    // Firebase Functions를 통해 토큰이 이미 등록되므로 로컬 저장만 수행
    localStorage.setItem('fcm-token', token);
  }

  async unsubscribe() {
    try {
      const { deleteToken } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js');
      
      if (this.token) {
        // 먼저 토픽에서 구독 해제
        await this.unsubscribeFromTopic(this.token, 'daily-feed');
        
        // 그 다음 토큰 삭제
        await deleteToken(this.messaging);
        this.token = null;
        localStorage.removeItem('fcm-token');
        localStorage.removeItem('fcm-subscriptions');
        localStorage.removeItem('fcm-token-for-subscription');
        return true;
      }
      return false;
    } catch (error) {
      console.error('FCM 구독 해제 실패:', error);
      throw error;
    }
  }

  // 토픽 구독 해제 (Firebase Functions 기반)
  async unsubscribeFromTopic(token, topic) {
    try {
      // Firebase Functions API 호출 (asia-northeast3 리전)
      const response = await fetch('https://unsubscribefcm-5sptcvdphq-du.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          topic: topic
        })
      });

      const result = await response.json();
      
      if (result.success) {
        
        // 로컬 저장소에서 구독 정보 제거
        const subscriptions = JSON.parse(localStorage.getItem('fcm-subscriptions') || '[]');
        const updatedSubscriptions = subscriptions.filter(sub => sub !== topic);
        localStorage.setItem('fcm-subscriptions', JSON.stringify(updatedSubscriptions));
        
        return true;
      } else {
        console.error('토픽 구독 해제 실패:', result);
        throw new Error(result.error || result.details || '토픽 구독 해제 실패');
      }
      
    } catch (error) {
      console.error('토픽 구독 해제 Firebase Functions 호출 실패:', error);
      
      // 실패 시 Firebase Functions 배포 준비 안내
      
      throw error;
    }
  }

  isSubscribed() {
    return this.token !== null || localStorage.getItem('fcm-token') !== null;
  }

  showNotification(payload) {
    const notificationTitle = payload.notification?.title || 'Daily Feed';
    const notificationOptions = {
      body: payload.notification?.body || '새로운 소식이 있습니다!',
      icon: payload.notification?.icon || '/daily-feed/icons/icon.svg',
      badge: '/daily-feed/icons/icon.svg',
      tag: 'daily-feed-fcm',
      data: payload.data
    };

    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
    } else {
      new Notification(notificationTitle, notificationOptions);
    }
  }

  // 테스트용 알림 발송 (Firebase Functions 기반)
  async sendTestNotification(date) {
    // Firebase Functions에서 직접 알림을 관리하므로 별도 호출 불필요
    return { success: true, message: '테스트 알림 발송 준비 완료' };
  }

  // 토픽 구독 (Firebase Functions 기반)
  async subscribeToTopic(token, topic) {
    try {
      // Firebase Functions API 호출 (asia-northeast3 리전)
      const response = await fetch('https://subscribefcm-5sptcvdphq-du.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          topic: topic
        })
      });

      const result = await response.json();
      
      if (result.success) {
        
        // 로컬 저장소에 구독 정보 저장
        const subscriptions = JSON.parse(localStorage.getItem('fcm-subscriptions') || '[]');
        if (!subscriptions.includes(topic)) {
          subscriptions.push(topic);
          localStorage.setItem('fcm-subscriptions', JSON.stringify(subscriptions));
        }
        localStorage.setItem('fcm-token-for-subscription', token);
        
        return true;
      } else {
        console.error('토픽 구독 실패:', result);
        throw new Error(result.error || result.details || '토픽 구독 실패');
      }
      
    } catch (error) {
      console.error('토픽 구독 Firebase Functions 호출 실패:', error);
      
      // 실패 시 Firebase Functions 배포 준비 안내
      
      throw error;
    }
  }

  // 설정 업데이트 (실제 Firebase 설정으로 교체)
  updateConfig(config) {
    this.firebaseConfig = { ...this.firebaseConfig, ...config };
  }

  updateVapidKey(vapidKey) {
    this.vapidKey = vapidKey;
  }
}