const CACHE_NAME = 'daily-feed-v1';
const urlsToCache = [
  '/daily-feed/',
  '/daily-feed/index.html',
  '/daily-feed/style.css',
  '/daily-feed/script.js',
  '/daily-feed/manifest.json',
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
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/daily-feed/icons/android-chrome-192x192.png',
      badge: '/daily-feed/icons/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});