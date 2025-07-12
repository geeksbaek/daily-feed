# Daily Feed Web

AI 기반 RSS/Atom 피드 수집 및 요약 도구의 웹 버전입니다.

## 🌟 주요 특징

- **100% 무료**: GitHub Actions + GitHub Pages
- **자동화**: 매일 새벽 2시 자동 실행
- **4가지 프리셋**: Default, Developer, Casual, Community
- **GitHub Flavored Markdown**: 완벽한 마크다운 지원
- **단순한 UI**: 텍스트 중심의 깔끔한 인터페이스

## 🏗️ 아키텍처

```
daily-feed-web/
├── .github/workflows/
│   └── daily-feed.yml          # 매일 자동 실행
├── data/summaries/             # JSON 데이터 저장소
│   ├── 2025-01-15/
│   │   ├── default.json
│   │   ├── developer.json
│   │   ├── casual.json
│   │   └── community.json
│   └── index.json              # 날짜 인덱스
├── web/                        # 프론트엔드
│   ├── index.html
│   ├── style.css
│   └── script.js
└── cmd/generate/               # 데이터 생성 도구
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

- **URL**: `https://username.github.io/daily-feed/web/`
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

```bash
# 로컬에서 수동 실행 (테스트용)
export GEMINI_API_KEY="your-key"
go run cmd/generate/main.go

# 웹 인터페이스 로컬 개발
cd web
python -m http.server 8000  # 또는 다른 정적 서버
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

## 🎯 향후 계획

- [ ] RSS 피드 생성
- [ ] 커스텀 도메인 설정
- [ ] 다크 모드 지원
- [ ] 북마크 기능
- [ ] 이메일 구독

## 📄 라이선스

MIT License