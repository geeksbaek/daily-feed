# Daily Feed

AI 기반 RSS 피드 수집 및 요약 도구

## 프로젝트 구조

```
daily-feed/
├── internal/
│   ├── app/          # 애플리케이션 진입점
│   └── logger/       # 로깅 인터페이스
├── pkg/
│   ├── models/       # 데이터 모델
│   ├── config/       # 설정 관리
│   ├── feed/         # RSS 피드 처리
│   ├── ai/           # AI 요약 및 출력
│   └── utils/        # 유틸리티 함수
├── feeds.csv         # RSS 피드 목록
└── main.go           # 애플리케이션 진입점
```

## 주요 개선사항

### 1. 구조적 개선
- **패키지 분리**: 관심사별로 명확하게 분리
- **의존성 주입**: 인터페이스 기반 설계로 테스트 가능성 향상
- **계층 분리**: 비즈니스 로직과 인프라 계층 분리

### 2. 에러 처리 개선
- **커스텀 에러 타입**: `FeedError`, `ConfigError`, `AIError`
- **에러 래핑**: `fmt.Errorf`와 `%w` 사용
- **구체적 에러 메시지**: 상황별 명확한 에러 정보

### 3. 설정 관리 개선
- **검증 로직**: `config.Validate()` 메서드
- **타입 안전성**: 구조체 기반 설정
- **기본값 처리**: 합리적인 기본값 제공

### 4. 다중 프리셋 시스템
- **5가지 프리셋**: Executive, Developer, Casual, Default, Simple
- **유연한 설정**: 명령행 플래그로 실시간 변경 가능
- **대상별 최적화**: 독자층에 맞는 톤과 구조
- **확장 가능**: 새로운 프리셋 쉽게 추가 가능

### 5. 로깅 시스템
- **인터페이스 기반**: 테스트 가능한 로거
- **레벨별 로깅**: Info, Error, Fatal
- **구조화된 로깅**: 일관된 로그 형식

### 6. 컨텍스트 처리
- **취소 가능**: Graceful shutdown 지원
- **시그널 처리**: SIGINT, SIGTERM 처리
- **타임아웃**: HTTP 요청 타임아웃 설정

## 사용법

### 빌드 및 실행
```bash
# 직접 실행
go run .

# 또는 빌드 후 실행
go build -o daily-feed .
./daily-feed
```

### 출력 방식
프로그램은 결과를 **표준 출력(stdout)**으로 출력합니다.

```bash
# 표준 출력으로 결과 확인
./daily-feed

# 파일로 저장
./daily-feed > daily-feed-$(date +%Y-%m-%d).md

# 클립보드에 복사 (macOS)
./daily-feed | pbcopy

# 다른 명령과 파이프라인 연결
./daily-feed | grep "AI" | head -5
```

### 명령행 옵션
```bash
# 기본 실행 (기본값 사용)
./daily-feed

# 프리셋 지정
./daily-feed --preset executive
./daily-feed --preset developer
./daily-feed --preset casual
./daily-feed --preset simple

# 상세 설정
./daily-feed --feeds feeds.csv --model gemini-2.5-pro --cutoff 24 --timeout 15 --preset executive

# 피드 파일 변경
./daily-feed --feeds my-feeds.csv --preset developer

# 도움말 확인
./daily-feed --help
```

### 플래그 옵션
- `--feeds`: RSS 피드 목록 파일 경로 (기본값: feeds.csv)
- `--model`: Gemini 모델명 (기본값: gemini-2.5-pro)
- `--cutoff`: 피드 수집 시간 범위, 시간 단위 (기본값: 24)
- `--timeout`: HTTP 요청 타임아웃, 초 단위 (기본값: 15)
- `--preset`: 요약 프리셋 (기본값: default)

### 환경변수
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

### macOS 단축어와 연동
macOS 단축어 앱에서 "셸 스크립트 실행" 액션을 사용하여 연동할 수 있습니다:

```bash
cd /Users/your-username/path/to/daily-feed
source ~/.zshrc  # 환경변수 로드
./daily-feed --preset casual | pbcopy  # 원하는 프리셋으로 실행 후 클립보드에 복사
```

## 요약 프리셋

Daily Feed는 다양한 독자층을 위한 5가지 요약 프리셋을 제공합니다:

### 📊 Executive (`--preset executive`)
**대상**: 기업 임원, 의사결정자  
**특징**: 2분 내 읽을 수 있는 전략적 비즈니스 분석
- 핵심 비즈니스 임팩트 요약
- 시장 규모, 성장률, 투자 동향
- 주요 기업 전략, M&A, 파트너십
- 새로운 기회와 잠재적 위험 요소
- 검토가 필요한 전략적 포인트

**[샘플 보기](samples/summary_executive.md)**

### 🚀 Developer (`--preset developer`)
**대상**: 소프트웨어 개발자, 엔지니어  
**특징**: 실무에 바로 활용 가능한 기술적 정보
- 새로운 개발 도구, 프레임워크, 라이브러리
- 클라우드, API, 개발 플랫폼 업데이트
- 보안 이슈, 성능 개선, 베스트 프랙티스
- 개발자가 읽어볼 만한 기술 아티클과 리소스
- 실용적인 개발 팁

**[샘플 보기](samples/summary_developer.md)**

### 👋 Casual (`--preset casual`)
**대상**: 일반 기술 관심자  
**특징**: 친구가 들려주는 편안한 톤의 기술 소식
- 친근하고 대화체 문장 ("이거 진짜 대박이야")
- 개인적 의견과 재미있는 관점 포함
- 유머러스하고 재미있는 분석
- 기술 관련 잡지식과 TMI

**[샘플 보기](samples/summary_casual.md)**

### 🎓 Default (`--preset default`)
**대상**: 대학생, 일반 성인  
**특징**: 3-5분 안에 읽을 수 있는 균형잡힌 기술 뉴스
- 대학생 수준의 적절한 언어 사용
- 전문용어는 간단한 설명과 함께 제공
- 실용적 의미와 트렌드에 집중
- 자연스럽고 읽기 편한 문체

**[샘플 보기](samples/summary_default.md)**

### 🌟 Simple (`--preset simple`)
**대상**: 초등학생, 기술 초보자  
**특징**: 쉬운 단어로 설명하는 친절한 기술 뉴스
- 초등학생도 이해할 수 있는 쉬운 단어
- 복잡한 기술 용어를 일상 단어로 변환
- 비유와 예시를 통한 설명
- 친근하고 따뜻한 말투

**[샘플 보기](samples/summary_simple.md)**

## 아키텍처 원칙

1. **단일 책임 원칙**: 각 패키지는 하나의 책임만 가짐
2. **의존성 역전**: 인터페이스에 의존, 구체 타입에 의존하지 않음
3. **개방-폐쇄 원칙**: 확장에는 열려있고 수정에는 닫혀있음
4. **에러 처리**: 모든 에러는 적절히 처리되고 전파됨
5. **테스트 가능성**: 모든 컴포넌트가 독립적으로 테스트 가능

## 코드 품질

- **Go 관례 준수**: 표준 Go 프로젝트 구조
- **타입 안전성**: 강타입 언어의 장점 활용
- **메모리 효율성**: 채널과 고루틴을 활용한 동시성
- **에러 처리**: Go의 명시적 에러 처리 패턴
- **문서화**: 패키지와 함수별 명확한 문서화