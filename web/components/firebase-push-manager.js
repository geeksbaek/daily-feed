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
      console.log('Firebase 설정:', this.firebaseConfig);
      console.log('VAPID 키:', this.vapidKey);
      
      // 설정 검증
      if (!validateFirebaseConfig(this.firebaseConfig)) {
        throw new Error('Firebase 설정이 불완전합니다. config.js를 확인해주세요.');
      }

      // Firebase SDK 동적 로드
      console.log('Firebase SDK 로드 시작...');
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getMessaging, getToken, onMessage } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');
      console.log('Firebase SDK 로드 완료');
      
      // Firebase 앱 초기화
      console.log('Firebase 앱 초기화 시작...');
      const app = initializeApp(this.firebaseConfig);
      this.messaging = getMessaging(app);
      console.log('Firebase 앱 초기화 완료');
      
      // Service Worker 등록 및 활성화 대기
      console.log('Service Worker 등록 시작...');
      const registration = await navigator.serviceWorker.register('/daily-feed/firebase-messaging-sw.js');
      console.log('Service Worker 등록 완료:', registration);
      
      // Service Worker가 활성화될 때까지 대기
      console.log('Service Worker 활성화 대기 시작...');
      console.log('Registration 상태:', {
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        active: !!registration.active
      });
      
      if (registration.installing) {
        console.log('Service Worker 설치 중, 활성화 대기...');
        await new Promise((resolve, reject) => {
          const worker = registration.installing;
          worker.addEventListener('statechange', () => {
            console.log('Service Worker 상태 변경:', worker.state);
            if (worker.state === 'activated') {
              console.log('Service Worker 활성화 완료');
              resolve();
            } else if (worker.state === 'redundant') {
              console.log('Service Worker가 redundant 상태가 됨 (오류 발생)');
              reject(new Error('Service Worker가 redundant 상태가 되었습니다. firebase-messaging-sw.js에 오류가 있을 수 있습니다.'));
            }
          });
          
          // 타임아웃 추가 (10초)
          setTimeout(() => {
            reject(new Error('Service Worker 활성화 타임아웃'));
          }, 10000);
        });
      } else if (!registration.active) {
        console.log('Service Worker 준비 대기...');
        await navigator.serviceWorker.ready;
        console.log('Service Worker 준비 완료');
      } else {
        console.log('Service Worker 이미 활성화됨');
      }
      
      // 포그라운드 메시지 수신 처리
      console.log('포그라운드 메시지 핸들러 등록...');
      onMessage(this.messaging, (payload) => {
        console.log('포그라운드 메시지 수신:', payload);
        this.showNotification(payload);
      });
      
      this.isInitialized = true;
      console.log('Firebase FCM 초기화 성공');
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
        console.log('FCM 토큰 획득 성공:', this.token);
        
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
    try {
      // 서버에 토큰 등록 (백엔드 API 필요)
      const response = await fetch('/api/fcm/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('서버에 FCM 토큰 등록 성공');
        localStorage.setItem('fcm-token', token);
      } else {
        console.warn('서버 토큰 등록 실패, 로컬에만 저장');
        localStorage.setItem('fcm-token', token);
      }
    } catch (error) {
      console.error('토큰 서버 전송 실패:', error);
      localStorage.setItem('fcm-token', token);
    }
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
        console.log('FCM 구독 해제 성공');
        return true;
      }
      return false;
    } catch (error) {
      console.error('FCM 구독 해제 실패:', error);
      throw error;
    }
  }

  // 토픽 구독 해제 (GitHub Issues 기반)
  async unsubscribeFromTopic(token, topic) {
    try {
      console.log(`🔕 FCM 토픽 '${topic}'에서 구독 해제 요청 중...`);
      
      // GitHub Issues를 통한 구독 해제 요청 생성
      const issueTitle = `FCM 구독 해제 요청: ${topic} - ${new Date().toISOString()}`;
      const issueBody = `
## FCM 토픽 구독 해제 요청

- **토픽**: \`${topic}\`
- **토큰**: \`${token}\`
- **요청 시간**: ${new Date().toLocaleString('ko-KR')}
- **사용자 에이전트**: ${navigator.userAgent}

> 이 이슈는 FCM 토픽 구독 해제를 위해 자동으로 생성되었습니다.
> GitHub Actions가 이 이슈를 감지하여 구독 해제를 처리합니다.

### 처리 방법
관리자는 다음 명령으로 구독 해제를 처리할 수 있습니다:

\`\`\`bash
gh workflow run "FCM Auto Subscribe" -f action="unsubscribe" -f token="${token}" -f topic="${topic}"
\`\`\`
      `;

      const response = await fetch('https://api.github.com/repos/geeksbaek/daily-feed/issues', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['fcm-unsubscribe', 'auto-generated']
        })
      });

      if (response.ok) {
        const issue = await response.json();
        console.log(`✅ FCM 구독 해제 요청이 GitHub Issues에 등록되었습니다!`);
        console.log(`이슈 번호: #${issue.number}`);
        console.log(`이슈 URL: ${issue.html_url}`);
        
        // 로컬 저장소에서 구독 정보 제거
        const subscriptions = JSON.parse(localStorage.getItem('fcm-subscriptions') || '[]');
        const updatedSubscriptions = subscriptions.filter(sub => sub !== topic);
        localStorage.setItem('fcm-subscriptions', JSON.stringify(updatedSubscriptions));
        localStorage.removeItem('fcm-subscription-issue');
        
        // 사용자에게 알림
        alert(`✅ 알림 구독 해제 요청이 등록되었습니다!\n\n관리자가 처리하면 알림이 중단됩니다.\n이슈 #${issue.number}에서 진행 상황을 확인하세요.`);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('GitHub Issues 생성 실패:', response.status, errorData);
        throw new Error(`이슈 생성 실패: ${errorData.message || response.status}`);
      }
      
    } catch (error) {
      console.error('토픽 구독 해제 요청 실패:', error);
      
      // 실패 시 수동 구독 해제 안내
      console.log(`%c🔕 자동 구독 해제 요청 실패, 수동 처리가 필요합니다`, 'font-size: 16px; font-weight: bold; color: #e53e3e;');
      console.log(`%c토픽: ${topic}`, 'font-size: 14px; color: #2d3748;');
      console.log(`%c토큰: ${token}`, 'font-size: 12px; color: #718096; font-family: monospace;');
      console.log(`%c수동 구독 해제 명령:`, 'font-size: 14px; font-weight: bold; color: #4299e1;');
      console.log(`%cgh workflow run "FCM Auto Subscribe" -f action="unsubscribe" -f token="${token}" -f topic="${topic}"`, 
        'background: #f7fafc; padding: 8px; border-left: 4px solid #4299e1; font-family: monospace; color: #2d3748;');
      
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

  // 테스트용 알림 발송
  async sendTestNotification(date) {
    try {
      const response = await fetch('/api/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date,
          test: true
        })
      });

      if (response.ok) {
        console.log('테스트 알림 발송 요청 성공');
        return await response.json();
      } else {
        throw new Error(`테스트 알림 발송 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('테스트 알림 발송 실패:', error);
      throw error;
    }
  }

  // 토픽 구독 (GitHub Issues 기반)
  async subscribeToTopic(token, topic) {
    try {
      console.log(`🔔 FCM 토픽 '${topic}'에 구독 요청 중...`);
      
      // GitHub Issues를 통한 구독 요청 생성
      const issueTitle = `FCM 구독 요청: ${topic} - ${new Date().toISOString()}`;
      const issueBody = `
## FCM 토픽 구독 요청

- **토픽**: \`${topic}\`
- **토큰**: \`${token}\`
- **요청 시간**: ${new Date().toLocaleString('ko-KR')}
- **사용자 에이전트**: ${navigator.userAgent}

> 이 이슈는 FCM 토픽 구독을 위해 자동으로 생성되었습니다.
> GitHub Actions가 이 이슈를 감지하여 구독을 처리합니다.

### 처리 방법
관리자는 다음 명령으로 구독을 처리할 수 있습니다:

\`\`\`bash
gh workflow run "FCM Auto Subscribe" -f action="subscribe" -f token="${token}" -f topic="${topic}"
\`\`\`
      `;

      const response = await fetch('https://api.github.com/repos/geeksbaek/daily-feed/issues', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['fcm-subscribe', 'auto-generated']
        })
      });

      if (response.ok) {
        const issue = await response.json();
        console.log(`✅ FCM 구독 요청이 GitHub Issues에 등록되었습니다!`);
        console.log(`이슈 번호: #${issue.number}`);
        console.log(`이슈 URL: ${issue.html_url}`);
        
        // 로컬 저장소에 구독 정보 저장
        const subscriptions = JSON.parse(localStorage.getItem('fcm-subscriptions') || '[]');
        if (!subscriptions.includes(topic)) {
          subscriptions.push(topic);
          localStorage.setItem('fcm-subscriptions', JSON.stringify(subscriptions));
        }
        localStorage.setItem('fcm-token-for-subscription', token);
        localStorage.setItem('fcm-subscription-issue', issue.number.toString());
        
        // 사용자에게 알림
        alert(`✅ 알림 구독 요청이 등록되었습니다!\n\n관리자가 승인하면 알림을 받을 수 있습니다.\n이슈 #${issue.number}에서 진행 상황을 확인하세요.`);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('GitHub Issues 생성 실패:', response.status, errorData);
        throw new Error(`이슈 생성 실패: ${errorData.message || response.status}`);
      }
      
    } catch (error) {
      console.error('토픽 구독 요청 실패:', error);
      
      // 실패 시 수동 구독 안내
      console.log(`%c🔔 자동 구독 요청 실패, 수동 구독이 필요합니다`, 'font-size: 16px; font-weight: bold; color: #e53e3e;');
      console.log(`%c토픽: ${topic}`, 'font-size: 14px; color: #2d3748;');
      console.log(`%c토큰: ${token}`, 'font-size: 12px; color: #718096; font-family: monospace;');
      console.log(`%c수동 구독 명령:`, 'font-size: 14px; font-weight: bold; color: #4299e1;');
      console.log(`%cgh workflow run "FCM Auto Subscribe" -f action="subscribe" -f token="${token}" -f topic="${topic}"`, 
        'background: #f7fafc; padding: 8px; border-left: 4px solid #4299e1; font-family: monospace; color: #2d3748;');
      
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