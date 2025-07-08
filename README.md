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
├── config.json       # 설정 파일
├── feeds.csv         # RSS 피드 목록
└── main.go           # 기존 코드
└── main-refactored.go # 리팩토링된 코드
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

### 4. 로깅 시스템
- **인터페이스 기반**: 테스트 가능한 로거
- **레벨별 로깅**: Info, Error, Fatal
- **구조화된 로깅**: 일관된 로그 형식

### 5. 컨텍스트 처리
- **취소 가능**: Graceful shutdown 지원
- **시그널 처리**: SIGINT, SIGTERM 처리
- **타임아웃**: HTTP 요청 타임아웃 설정

## 사용법

### 빌드 및 실행
```bash
# 리팩토링된 버전 실행
go run main-refactored.go

# 또는 빌드 후 실행
go build -o daily-feed main-refactored.go
./daily-feed
```

### 설정 파일 (config.json)
```json
{
  "feeds_file": "feeds.csv",
  "gemini_model": "gemini-2.5-pro",
  "cutoff_hours": 24,
  "http_timeout_seconds": 15
}
```

### 환경변수
```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

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