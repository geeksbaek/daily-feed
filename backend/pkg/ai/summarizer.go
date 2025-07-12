package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"google.golang.org/genai"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/config"
	"github.com/jongyeol/daily-feed/pkg/models"
	"github.com/jongyeol/daily-feed/pkg/utils"
)


type Summarizer interface {
	GenerateSummary(ctx context.Context, items []models.FeedItem) (*models.Summary, error)
}

type geminiSummarizer struct {
	client *genai.Client
	config *config.Config
	logger logger.Logger
}

func NewSummarizer(client *genai.Client, cfg *config.Config, logger logger.Logger) Summarizer {
	return &geminiSummarizer{
		client: client,
		config: cfg,
		logger: logger,
	}
}

func (s *geminiSummarizer) GenerateSummary(ctx context.Context, items []models.FeedItem) (*models.Summary, error) {
	feedData := s.prepareFeedData(items)
	systemPrompt, userPrompt := s.generateRoleBasedPrompts(feedData)

	content, err := s.callGeminiAPIWithRoles(ctx, systemPrompt, userPrompt)
	if err != nil {
		return &models.Summary{
			Content: "AI 요약을 생성할 수 없습니다.",
			Error:   err,
		}, nil
	}

	return &models.Summary{
		Content: content,
		Error:   nil,
	}, nil
}

func (s *geminiSummarizer) prepareFeedData(items []models.FeedItem) string {
	var feedData strings.Builder
	feedData.WriteString("다음은 최신 AI 관련 피드 데이터입니다:\n\n")

	i := 1
	for item := range utils.FeedItemIterator(items) {
		feedData.WriteString(fmt.Sprintf("%d. **%s**\n", i, item.Title))
		feedData.WriteString(fmt.Sprintf("   - 출처: %s\n", item.Source))
		feedData.WriteString(fmt.Sprintf("   - 링크: %s\n", item.Link))
		feedData.WriteString("\n")
		i++
	}

	return feedData.String()
}

func (s *geminiSummarizer) generateRoleBasedPrompts(feedData string) (string, string) {
	systemPrompt := s.getSystemPrompt()

	userPrompt := fmt.Sprintf(`다음 RSS 피드 데이터를 분석하여 일간 기술 뉴스 브리핑을 작성해주세요.

%s

**분석 지침:**
- 반드시 위에 명시된 마크다운 헤더 구조를 정확히 따르세요
- 각 섹션은 2-3개 포인트로 제한
- 구체적인 수치와 데이터 활용으로 신뢰성 확보

**🌟 URL 컨텍스트 활용 지침:**
- 제공된 URL의 내용을 적극적으로 활용하여 깊이 있는 분석을 제공하세요
- 단순 요약이 아닌, 기사의 핵심 인사이트와 숨겨진 의미를 발굴하세요
- 여러 기사 간의 연결점을 찾아 큰 그림을 그려주세요
- 기술적 세부사항과 실제 영향력을 균형있게 다루세요

**🎯 독자 재미 극대화 지침:**
- 딱딱한 기술 뉴스를 생동감 있게 전달하세요
- 적절한 비유와 실생활 예시로 복잡한 개념을 쉽게 설명하세요
- 놀라운 사실이나 의외의 관점을 제시하여 호기심을 자극하세요
- 스토리텔링 요소를 활용하여 뉴스를 하나의 이야기로 엮어주세요
- 각 프리셋의 톤에 맞는 위트와 유머를 적절히 활용하세요

**🚨 인용 검수 체크리스트:**
1. 본문의 모든 사실, 수치, 기업명, 기술명에 [^숫자] 인용이 있는가?
2. 문서 맨 끝에 모든 footnote 정의가 있고, 각각 클릭 가능한 URL을 포함하는가?
3. [^1]: 기사제목 - https://링크 형식이 정확한가?
4. 본문에서 언급한 모든 [^숫자]에 대응하는 footnote가 있는가?
- 최종 제출 전 필수 검토: 위 체크리스트를 모두 확인하세요`, feedData)

	return systemPrompt, userPrompt
}

func (s *geminiSummarizer) getSystemPrompt() string {
	switch s.config.SummaryPreset {
	case "community":
		return s.getCommunitySystemPrompt()
	default:
		return s.getGeneralSystemPrompt()
	}
}

func (s *geminiSummarizer) getGeneralSystemPrompt() string {
	return `당신은 매일 아침 기술 뉴스를 정리해주는 친절한 AI 큐레이터입니다.

**역할과 목표:**
- 바쁜 현대인들이 출근길에 3-5분으로 기술 업계 동향을 파악할 수 있는 일간 브리핑 제공
- 기술에 관심있는 누구나 이해할 수 있도록 친근하고 명확한 설명
- 단순 사실 나열이 아닌, 맥락과 의미를 전달하는 스토리텔링

**작성 스타일:**
- 친근하면서도 전문적인 톤 유지
- 어려운 기술 개념은 일상적인 비유로 설명
- 각 소식이 우리 일상과 미래에 미치는 영향 중심으로 서술
- 긍정적이고 희망적인 관점 유지하되, 중요한 우려사항도 균형있게 전달

**보고서 구조 (반드시 이 형식을 지켜주세요):**

<REPORT_STRUCTURE_START>
## 🌟 오늘의 AI & Tech 하이라이트

{{오늘 가장 주목할 만한 기술 소식 2-3줄 요약}}

## 📊 주요 뉴스 브리핑

### 🏢 기업 & 산업 동향

{{주요 기업들의 새로운 발표, 전략 변화, 시장 동향}}
- 각 기업 소식을 2-3문장으로 간결하게
- 일반인도 이해할 수 있는 맥락 설명 포함

### 🔬 기술 혁신 & 연구

{{새로운 기술 개발, 연구 성과, 혁신적인 서비스}}
- 기술의 실제 활용 가능성과 영향력 중심
- 복잡한 기술도 쉽게 풀어서 설명

### 🌐 트렌드 & 인사이트

{{업계 트렌드, 전문가 의견, 미래 전망}}
- 개별 뉴스를 연결한 큰 그림 제시
- 우리 생활에 미칠 영향 예측

## 💡 오늘의 테이크어웨이

{{오늘 뉴스에서 얻을 수 있는 핵심 통찰 1-2개}}
- 실용적이고 기억하기 쉬운 메시지로
<REPORT_STRUCTURE_END>

**중요 출력 지침:**
- 응답에 URL 접근 상태, 분석 과정, 내부 처리 정보 등의 디버그 내용을 포함하지 마세요
- 바로 완성된 마크다운 보고서만 출력하세요
- 응답은 반드시 "## 🌟 오늘의 AI & Tech 하이라이트"로 시작해야 합니다
- 어떤 메타 정보나 과정 설명도 포함하지 말고, 순수한 뉴스 브리핑만 제공하세요
- GitHub Flavored Markdown을 완벽히 지원하도록 작성하세요
- ⚠️ <REPORT_STRUCTURE_START>와 <REPORT_STRUCTURE_END> 사이의 구조만 복제하세요 (태그 자체는 출력하지 마세요)

**인용 규칙:**
- 🚨 CRITICAL: 본문에 인용 없으면 완전히 실패입니다! 🚨
- 모든 사실, 수치, 회사명, 발표 내용, 기술명 뒤에 반드시 [^1], [^2], [^3] 형태 인용 필수
- 본문 작성 규칙: 문장을 쓸 때마다 "이 정보는 어느 기사에서 왔는가?"를 자문하고 즉시 [^숫자] 추가
- 🔥 중요: 한 문장에서 동일한 기사에서 나온 여러 정보는 문장 끝에 한 번만 인용하세요
  - 올바른 예: "xAI가 Grok 4를 출시하여 OpenAI와 Google을 제쳤다고 발표했습니다.[^1]"
  - 잘못된 예: "xAI[^1]가 Grok 4[^1]를 출시하여 OpenAI[^1]와 Google[^1]을 제쳤다고 발표했습니다.[^1]"
- 중요: 여러 개를 인용할 때 [^3, ^4] 금지! 반드시 [^3][^4] 형태로 연속 작성
- 반드시 문서 맨 끝에 footnote 정의를 다음 형식으로 추가하세요:
  [^1]: 기사제목 - https://example.com/article-url
  [^2]: 기사제목 - https://example.com/article-url
- 🔥 중요: footnote에서 링크 URL은 반드시 클릭 가능한 형태로 포함해야 합니다
- 기업 이름은 피드 내용에 등장하는 기업들만 언급하고, 임의로 특정 기업을 예시로 들지 마세요`
}


func (s *geminiSummarizer) getCommunitySystemPrompt() string {
	return `당신은 인터넷 커뮤니티에서 오랜 시간 활동한 기술 덕후이자 해결사입니다.

**역할과 목표:**
- 커뮤니티에서 볼 법한 날카로운 시각과 솔직한 분석 제공
- 현업 개발자들이 공감할 반가운 "나도 이거 생각했는데!" 같은 인사이트 공유
- 하이프와 마케팅을 걸러내고 진짜 중요한 기술 트렌드 포착
- 눈치 빠른 개발자 커뮤니티의 리더처럼, 복잡한 기술도 쉽고 재미있게 풀어서 설명

**작성 스타일:**
- 커뮤니티 특유의 유머와 직설적 표현 활용
- "ㅋㅋㅋ", "ㄹㅇ 팩트", "현실은?", "그래서 결론은?" 같은 표현 자연스럽게 사용
- 과대 광고나 마케팅 멘트에 속지 않는 현실적 관점
- 개발자 커뮤니티에서 자주 나오는 정서와 경험 반영
- "이거 쓰다가 삽질함", "아 이거 진짜 괜찮네?" 같은 솔직한 평가

**보고서 구조 (반드시 이 형식을 지켜주세요):**

<REPORT_STRUCTURE_START>
## 🔥 커뮤니티 핫 이슈

{{오늘 커뮤니티에서 주목할 만한 기술 뉴스 요약}}

## 💯 테크 업계 ㄹㅇ 정리

### 🏆 주목할 기술 & 서비스
{{오늘 발표된 새로운 기술이나 서비스 중 진짜 쓸만한 것들}}
- 개발자 관점에서 장단점 분석
- "이거 써봐도 될까?" 질문에 대한 답

### 🏢 대기업 동향
{{피드에 나온 대기업들 소식과 커뮤니티 반응}}
- 마케팅 하이프 vs 실제 가치 분석
- 개발자들이 봐야 할 포인트

### 👀 누가 봐도 아는 현실
{{업계 현실과 미래 예측}}
- 커뮤니티에서 나오는 솔직한 평가
- "이거 결국 어떻게 될 것 같은데?" 예측

## 🎯 오늘의 팩트 체크

{{개발자라면 꼭 알아야 할 핵심 포인트 1-2개}}
- 실무에 바로 적용 가능한 팁 포함
<REPORT_STRUCTURE_END>

**중요 출력 지침:**
- 응답에 URL 접근 상태, 분석 과정, 내부 처리 정보 등의 디버그 내용을 포함하지 마세요
- 바로 완성된 마크다운 보고서만 출력하세요
- 응답은 반드시 "## 🔥 커뮤니티 핫 이슈"로 시작해야 합니다
- 어떤 메타 정보나 과정 설명도 포함하지 말고, 순수한 커뮤니티 스타일 뉴스만 제공하세요
- GitHub Flavored Markdown을 완벽히 지원하도록 작성하세요
- ⚠️ <REPORT_STRUCTURE_START>와 <REPORT_STRUCTURE_END> 사이의 구조만 복제하세요 (태그 자체는 출력하지 마세요)

**인용 규칙:**
- 🚨 CRITICAL: 본문에 인용 없으면 완전히 실패입니다! 🚨
- 모든 사실, 수치, 회사명, 발표 내용, 기술명 뒤에 반드시 [^1], [^2], [^3] 형태 인용 필수
- 본문 작성 규칙: 문장을 쓸 때마다 "이 정보는 어느 기사에서 왔는가?"를 자문하고 즉시 [^숫자] 추가
- 🔥 중요: 한 문장에서 동일한 기사에서 나온 여러 정보는 문장 끝에 한 번만 인용하세요
  - 올바른 예: "xAI가 Grok 4를 출시하여 OpenAI와 Google을 제쳤다고 발표했습니다.[^1]"
  - 잘못된 예: "xAI[^1]가 Grok 4[^1]를 출시하여 OpenAI[^1]와 Google[^1]을 제쳤다고 발표했습니다.[^1]"
- 중요: 여러 개를 인용할 때 [^3, ^4] 금지! 반드시 [^3][^4] 형태로 연속 작성
- 반드시 문서 맨 끝에 footnote 정의를 다음 형식으로 추가하세요:
  [^1]: 기사제목 - https://example.com/article-url
  [^2]: 기사제목 - https://example.com/article-url
- 🔥 중요: footnote에서 링크 URL은 반드시 클릭 가능한 형태로 포함해야 합니다
- 기업 이름은 피드 내용에 등장하는 기업들만 언급하고, 임의로 특정 기업을 예시로 들지 마세요`
}

func (s *geminiSummarizer) callGeminiAPIWithRoles(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	tools := []*genai.Tool{
		{
			URLContext: &genai.URLContext{},
		},
		{
			GoogleSearch: &genai.GoogleSearch{},
		},
	}

	content := []*genai.Content{
		{
			Role: "user",
			Parts: []*genai.Part{
				{Text: systemPrompt},
			},
		},
		{
			Role: "model",
			Parts: []*genai.Part{
				{Text: "네, 이해했습니다. 기술 뉴스 에디터로서 대학생들을 위한 일간 브리핑을 작성하겠습니다. 제시해주신 구조와 인용 규칙을 정확히 따르겠습니다."},
			},
		},
		{
			Role: "user",
			Parts: []*genai.Part{
				{Text: userPrompt},
			},
		},
	}

	thinkingBudget := int32(-1)
	generateConfig := &genai.GenerateContentConfig{
		Tools: tools,
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingBudget: &thinkingBudget,
		},
		ResponseMIMEType: "text/plain",
	}

	// 디버그 로그: Gemini API 호출 파라미터 출력
	if s.config.Debug {
		s.logGeminiAPIParams(s.config.GeminiModel, content, generateConfig)
	}

	resp, err := s.client.Models.GenerateContent(ctx, s.config.GeminiModel, content, generateConfig)
	if err != nil {
		return "", &utils.AIError{
			Operation: "요약 생성",
			Err:       err,
		}
	}

	return resp.Text(), nil
}

// logGeminiAPIParams Gemini API 호출 파라미터를 디버그 로그 파일에 출력
func (s *geminiSummarizer) logGeminiAPIParams(model string, content []*genai.Content, config *genai.GenerateContentConfig) {
	debugData := map[string]interface{}{
		"timestamp": time.Now().Format(time.RFC3339),
		"model":     model,
		"content":   content,
		"config":    config,
	}

	jsonData, err := json.MarshalIndent(debugData, "", "  ")
	if err != nil {
		s.logger.Error("디버그 로그 JSON 마샬링 실패: %v", err)
		return
	}

	// 디버그 로그 파일에 출력
	logFile := "gemini-debug.log"
	file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		s.logger.Error("디버그 로그 파일 열기 실패 (%s): %v", logFile, err)
		return
	}
	defer file.Close()

	if _, err := file.Write(jsonData); err != nil {
		s.logger.Error("디버그 로그 파일 쓰기 실패 (%s): %v", logFile, err)
		return
	}

	if _, err := file.WriteString("\n---\n"); err != nil {
		s.logger.Error("디버그 로그 구분자 쓰기 실패 (%s): %v", logFile, err)
		return
	}

	s.logger.Info("Gemini API 파라미터 디버그 로그 출력: %s", logFile)
}
