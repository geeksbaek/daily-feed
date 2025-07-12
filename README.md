# Daily Feed

AI 기반 RSS/Atom 피드 수집 및 요약 서비스입니다. Go 백엔드와 Lit 기반 웹 UI를 제공합니다.

## 🌟 주요 특징

- **100% 무료**: GitHub Actions + GitHub Pages
- **자동화**: 매일 새벽 2시 자동 실행  
- **4가지 프리셋**: 📰 일반, 🔧 개발자, ☕ 캐주얼, 💬 커뮤니티
- **모던 웹 UI**: Lit 3.0 웹 컴포넌트, 다크모드 지원
- **PWA 지원**: 오프라인 캐싱, 모바일 최적화

## 🏗️ 프로젝트 구조

```
daily-feed/
├── backend/                    # Go 애플리케이션
│   ├── cmd/generate/          # 피드 생성 명령
│   ├── internal/              # 내부 패키지
│   ├── pkg/                   # 공용 패키지
│   ├── main.go               # CLI 진입점
│   ├── feeds.csv             # 피드 목록
│   └── samples/              # 샘플 출력
├── web/                       # 웹 애플리케이션
│   ├── components/           # Lit 웹 컴포넌트
│   ├── index.html           # 메인 페이지
│   ├── manifest.json        # PWA 매니페스트
│   └── sw.js               # 서비스 워커
├── data/summaries/          # 생성된 JSON 데이터
├── .github/workflows/       # CI/CD 파이프라인
└── README.md
```

## 🚀 배포 방법

### 1. 저장소 설정

1. 이 저장소를 GitHub에 푸시
2. GitHub Secrets에 `GEMINI_API_KEY` 추가
3. GitHub Pages 설정: Settings > Pages > Source를 "GitHub Actions"로 설정

### 2. GitHub Actions 워크플로우

매일 새벽 2시(한국 시간)에 자동으로 실행되어:
1. 4가지 프리셋으로 피드 수집 및 AI 요약 생성
2. JSON 파일로 저장
3. GitHub Pages에 자동 배포

### 3. 수동 실행

GitHub Actions 탭에서 "Daily Feed Generation" 워크플로우를 수동으로 실행할 수 있습니다.

## 📱 웹 인터페이스

- **URL**: `https://geeksbaek.github.io/daily-feed/`
- **기능**:
  - 날짜별 요약 조회
  - 프리셋별 필터링
  - 키워드 검색
  - GitHub Flavored Markdown 렌더링
  - 관련 기사 링크

## 💰 비용

- **GitHub Actions**: 월 2,000분 무료 (실제 사용량: ~150분/월)
- **GitHub Pages**: 100GB 대역폭 무료
- **총 비용**: **$0/월**

## 🔧 개발

### Go 백엔드

```bash
# 백엔드 디렉토리로 이동
cd backend

# 피드 생성 (로컬 테스트)
export GEMINI_API_KEY="your-key"
go run cmd/generate/main.go

# CLI 도구 빌드 및 실행
go build -o daily-feed
./daily-feed --preset developer --feeds feeds.csv
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

## 📊 데이터 구조

```json
{
  "date": "2025-01-15",
  "preset": "developer",
  "summary": "마크다운 형식의 AI 요약...",
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

- [x] Lit 3.0 웹 컴포넌트 전환
- [x] 다크 모드 완전 지원
- [x] PWA 기능 (오프라인 캐싱, 모바일 최적화)
- [x] 한국어 UI 및 이모지 탭 레이블
- [x] 참고 자료 링크 새 창 열기
- [x] 코드 블록 다크모드 색상 지원
- [x] 개선된 로딩 UI (스피너 애니메이션)

## 🎯 향후 계획

- [ ] RSS 피드 생성
- [ ] 커스텀 도메인 설정
- [ ] 북마크 기능
- [ ] 이메일 구독

## 📄 라이선스

MIT License
