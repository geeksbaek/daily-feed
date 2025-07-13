const CACHE_NAME = 'daily-feed-lit-v1';
const urlsToCache = [
  '/daily-feed/',
  '/daily-feed/index.html',
  '/daily-feed/components/daily-feed-app.js',
  '/daily-feed/components/date-selector.js',
  '/daily-feed/components/preset-tabs.js',
  '/daily-feed/components/content-viewer.js',
  '/daily-feed/components/app-footer.js',
  '/daily-feed/manifest.json',
  'https://unpkg.com/lit@3/index.js',
  'https://unpkg.com/lit@3/directives/unsafe-html.js',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
  'https://cdn.jsdelivr.net/npm/marked@9.1.6/marked.min.js',
  'https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 요약 데이터 API 요청 처리
  if (url.pathname.includes('/data/summaries/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // 네트워크 우선, 실패 시 캐시 사용
          return fetch(event.request)
            .then(networkResponse => {
              // 성공적인 응답이면 캐시에 저장
              if (networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // 네트워크 실패 시 캐시된 데이터 반환
              if (cachedResponse) {
                return cachedResponse;
              }
              // 캐시도 없으면 오프라인 응답
              return new Response(JSON.stringify({
                error: 'offline',
                message: '오프라인 상태입니다. 캐시된 데이터가 없습니다.'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // chrome-extension URL은 캐시하지 않음
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // 기타 리소스 처리
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시된 버전 반환
        if (response) {
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request).then(response => {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 응답 복사
          const responseToCache = response.clone();
          
          // 캐시에 저장
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // 네트워크 실패 시 오프라인 페이지 또는 기본 응답
          if (event.request.destination === 'document') {
            return caches.match('/daily-feed/index.html');
          }
        });
      })
  );
});

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('백그라운드 동기화 실행');
  }
});

// 푸시 알림 (선택적)
// 푸시 알림 수신
self.addEventListener('push', event => {
  console.log('푸시 메시지 수신:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('푸시 데이터:', data);
    
    const options = {
      body: data.body || '새로운 Daily Feed가 준비되었습니다!',
      icon: data.icon || '/daily-feed/favicon-32x32.png',
      badge: data.badge || '/daily-feed/favicon-16x16.png',
      tag: data.tag || 'daily-feed',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: '보기',
          icon: '/daily-feed/favicon-16x16.png'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ],
      data: {
        url: data.url || '/daily-feed/',
        dateOfArrival: Date.now(),
        clickAction: data.url
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Daily Feed', options)
    );
  } else {
    // 데이터가 없는 경우 기본 알림
    event.waitUntil(
      self.registration.showNotification('Daily Feed', {
        body: '새로운 기술 뉴스 요약이 준비되었습니다!',
        icon: '/daily-feed/favicon-32x32.png',
        badge: '/daily-feed/favicon-16x16.png',
        tag: 'daily-feed-default'
      })
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('알림 클릭:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/daily-feed/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes('/daily-feed') && 'focus' in client) {
          return client.focus().then(() => {
            // URL 변경이 필요하면 메시지 전송
            if (urlToOpen !== client.url) {
              client.postMessage({
                type: 'NAVIGATE',
                url: urlToOpen
              });
            }
          });
        }
      }
      
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});