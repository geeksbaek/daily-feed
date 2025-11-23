# Daily Feed

AI 기반 RSS/Atom 피드 수집 및 요약 서비스입니다. Go 백엔드, Lit 기반 웹 UI, Firebase Functions FCM 푸시 알림을 제공합니다.

## 🌟 주요 특징

- **100% 무료**: GitHub Actions + GitHub Pages + Firebase Functions
- **자동화**: 매일 오전 7시 자동 실행 + FCM 푸시 알림  
- **4가지 프리셋**: 📰 일반, 🔧 개발자, ☕ 캐주얼, 💬 커뮤니티
- **모던 웹 UI**: Lit 3.0 웹 컴포넌트, 다크모드 지원
- **PWA 지원**: 오프라인 캐싱, 모바일 최적화
- **푸시 알림**: Firebase FCM 기반 실시간 알림

## 🔔 푸시 알림 시스템

### Firebase Functions 기반 FCM
- **구독 관리**: 웹 UI에서 원클릭 구독/해제
- **자동 알림**: 새로운 피드 생성 시 자동 발송
- **토픽 기반**: `daily-feed` 토픽으로 모든 구독자에게 전송

### 알림 발송 방식
1. **자동 발송**: 매일 새로운 콘텐츠 생성 시
2. **수동 테스트**: GitHub Actions를 통한 테스트 알림

## 🏗️ 프로젝트 구조

```
daily-feed/
├── backend/                    # Go 애플리케이션
│   ├── cmd/
│   │   ├── generate/          # 피드 생성 명령
│   │   ├── fcm-send/         # FCM 알림 발송 도구
│   │   └── fcm-subscribe/    # FCM 구독 관리 도구
│   ├── internal/              # 내부 패키지
│   ├── pkg/                   # 공용 패키지 (FCM 클라이언트 포함)
│   ├── main.go               # CLI 진입점
│   ├── feeds.csv             # 피드 목록
│   └── samples/              # 샘플 출력
├── web/                       # 웹 애플리케이션
│   ├── components/           # Lit 웹 컴포넌트
│   │   ├── daily-feed-app.js        # 메인 앱 컴포넌트
│   │   ├── content-viewer.js        # 콘텐츠 뷰어 (프롬프트 보기 포함)
│   │   ├── notification-toggle.js   # FCM 알림 토글
│   │   └── firebase-push-manager.js # Firebase FCM 관리자
│   ├── config.js             # Firebase 설정
│   ├── index.html           # 메인 페이지
│   ├── manifest.json        # PWA 매니페스트
│   ├── sw.js               # 서비스 워커
│   └── firebase-messaging-sw.js # FCM 서비스 워커
├── functions/                 # Firebase Functions
│   ├── src/index.ts          # FCM 구독/해제 함수
│   ├── package.json
│   └── tsconfig.json
├── data/summaries/           # 생성된 JSON 데이터
├── .github/workflows/        # CI/CD 파이프라인
│   ├── daily-feed.yml       # 피드 생성 + FCM 알림
│   ├── pages.yml           # GitHub Pages 배포
│   └── fcm-test.yml        # FCM 테스트 알림
├── .firebaserc              # Firebase 프로젝트 설정
├── firebase.json            # Firebase 배포 설정
└── README.md
```

## 🚀 배포 방법

### 1. 저장소 설정

1. 이 저장소를 GitHub에 푸시
2. GitHub Secrets에 다음 추가:
   - `GEMINI_API_KEY`: Google Gemini API 키
   - `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase Service Account JSON
3. GitHub Pages 설정: Settings > Pages > Source를 "GitHub Actions"로 설정

### 2. Firebase 설정

1. Firebase 프로젝트 생성 및 Blaze 플랜 업그레이드
2. Firebase Functions 배포:
   ```bash
   cd functions
   npm install
   npm run build
   firebase deploy --only functions
   ```
3. FCM 설정:
   - Firebase Console > Project settings > Cloud Messaging
   - 웹 푸시 인증서 생성 및 VAPID 키 확인
   - `web/config.js`에 Firebase 설정 추가

### 3. GitHub Actions 워크플로우

매일 오전 7시(한국 시간)에 자동으로 실행되어:
1. 4가지 프리셋으로 피드 수집 및 AI 요약 생성
2. JSON 파일로 저장 및 커밋
3. **FCM 푸시 알림 자동 발송** (새 콘텐츠 생성 시만)
4. GitHub Pages에 자동 배포

### 4. 수동 실행

- **피드 생성**: "Daily Feed Generation" 워크플로우
- **FCM 테스트**: "FCM Test Notification" 워크플로우

## 📱 웹 인터페이스

- **URL**: `https://geeksbaek.github.io/daily-feed/`
- **기능**:
  - 날짜별 요약 조회
  - 프리셋별 필터링  
  - 키워드 검색
  - GitHub Flavored Markdown 렌더링
  - 관련 기사 링크
  - **🔔 FCM 푸시 알림 구독/해제**
  - **🤖 AI 프롬프트 보기** (생성에 사용된 실제 프롬프트 확인)
  - 브라우저 새로고침 시 자동 캐시 갱신

## 🔔 FCM 푸시 알림 사용법

### 구독하기
1. 웹사이트 방문
2. 우상단 🔔 알림 버튼 클릭
3. 브라우저 알림 권한 허용
4. 자동으로 `daily-feed` 토픽 구독

### 받는 알림
- **제목**: 🗞️ Daily Feed
- **내용**: 새로운 기술 뉴스 요약이 준비되었습니다!
- **클릭 시**: 웹사이트로 자동 이동

### 구독 해제
- 알림 버튼을 다시 클릭하여 해제

## 💰 비용

- **GitHub Actions**: 월 2,000분 무료 (실제 사용량: ~200분/월)
- **GitHub Pages**: 100GB 대역폭 무료
- **Firebase Functions**: 월 2백만 호출 무료 (실제 사용량: ~1,000회/월)
- **Firebase Cloud Messaging**: 무제한 무료
- **총 비용**: **$0/월**

## 🔧 개발

### Go 백엔드

```bash
# 백엔드 디렉토리로 이동
cd backend

# 피드 생성 (로컬 테스트)
export GEMINI_API_KEY="your-key"
go run cmd/generate/main.go

# FCM 알림 발송 테스트
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_SERVICE_ACCOUNT_KEY="path/to/serviceAccountKey.json"
go run cmd/fcm-send/main.go -topic "daily-feed" -title "테스트" -body "테스트 메시지"

# CLI 도구 빌드 및 실행
go build -o daily-feed
./daily-feed --preset magazine --feeds feeds.csv
```

### 웹 UI

```bash
# 웹 디렉토리로 이동
cd web

# 로컬 개발 서버 실행
python -m http.server 8000
# 또는
npx serve .
```

### Firebase Functions

```bash
# Functions 디렉토리로 이동
cd functions

# 의존성 설치 및 빌드
npm install
npm run build

# 로컬 에뮬레이터 실행
npm run serve

# 배포
firebase deploy --only functions
```

## 📊 데이터 구조

```json
{
  "date": "2025-01-15",
  "preset": "magazine",
  "summary": "마크다운 형식의 AI 요약...",
  "prompt": {
    "system": "시스템 프롬프트...",
    "user": "사용자 프롬프트..."
  },
  "articles": [
    {
      "title": "기사 제목",
      "link": "https://...",
      "source": "출처",
      "category": "카테고리", 
      "publishedAt": "2025-01-15T10:00:00Z",
      "description": "기사 설명"
    }
  ],
  "generatedAt": "2025-01-15T02:00:00Z"
}
```

## 🎯 완료된 기능

### 웹 UI
- [x] Lit 3.0 웹 컴포넌트 전환
- [x] 다크 모드 완전 지원  
- [x] PWA 기능 (오프라인 캐싱, 모바일 최적화)
- [x] 한국어 UI 및 이모지 탭 레이블
- [x] 참고 자료 링크 새 창 열기
- [x] 코드 블록 다크모드 색상 지원
- [x] 개선된 로딩 UI (스피너 애니메이션)
- [x] 브라우저 새로고침 감지 및 자동 캐시 갱신
- [x] AI 프롬프트 보기 기능

### 푸시 알림 시스템
- [x] Firebase Functions 기반 FCM 구독/해제 API
- [x] 웹 UI FCM 알림 토글 컴포넌트
- [x] 자동 푸시 알림 발송 (새 콘텐츠 생성 시)
- [x] GitHub Actions FCM 테스트 워크플로우
- [x] Service Worker 기반 백그라운드 알림 처리

### 백엔드 & 인프라
- [x] Go 기반 FCM 클라이언트 및 CLI 도구
- [x] GitHub Actions 자동화 파이프라인
- [x] Firebase Functions 공개 API 배포
- [x] 보안 강화 (환경 변수 기반 설정)

## 🎯 향후 계획

- [ ] RSS 피드 생성
- [ ] 커스텀 도메인 설정  
- [ ] 북마크 기능
- [ ] 이메일 구독
- [ ] 사용자별 맞춤 토픽 구독
- [ ] 알림 설정 세부 옵션

## 📄 라이선스

MIT License