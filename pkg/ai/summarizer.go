package ai

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/genai"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/config"
	"github.com/jongyeol/daily-feed/pkg/models"
	"github.com/jongyeol/daily-feed/pkg/utils"
)

const MaxURLs = 20

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
	feedData, urls := s.prepareFeedData(items)
	systemPrompt, userPrompt := s.generateRoleBasedPrompts(feedData, urls)

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

func (s *geminiSummarizer) prepareFeedData(items []models.FeedItem) (string, []string) {
	var feedData strings.Builder
	feedData.WriteString("다음은 최신 AI 관련 피드 데이터입니다:\n\n")

	var urls []string
	i := 1
	for item := range utils.FeedItemIterator(items) {
		feedData.WriteString(fmt.Sprintf("%d. **%s**\n", i, item.Title))
		feedData.WriteString(fmt.Sprintf("   - 출처: %s\n", item.Source))
		feedData.WriteString(fmt.Sprintf("   - 링크: %s\n", item.Link))
		feedData.WriteString(fmt.Sprintf("   - 날짜: %s\n", item.PubDate.Format("2006-01-02")))
		if item.Description != "" {
			feedData.WriteString(fmt.Sprintf("   - 요약: %s\n", utils.CleanHTML(item.Description)))
		}
		feedData.WriteString("\n")
		i++
	}

	for url := range utils.URLIterator(items) {
		urls = append(urls, url)
	}

	urls = utils.RemoveDuplicateURLs(urls, MaxURLs)

	if len(urls) > 0 {
		feedData.WriteString("위 기사들의 전체 내용을 분석하기 위해 다음 URL들을 참조하세요:\n")
		for _, url := range urls {
			feedData.WriteString(fmt.Sprintf("- %s\n", url))
		}
		feedData.WriteString("\n")
	}

	return feedData.String(), urls
}

func (s *geminiSummarizer) generateRoleBasedPrompts(feedData string, urls []string) (string, string) {
	systemPrompt := `당신은 기술 뉴스를 명확하게 설명하는 전문 에디터입니다. 

**역할과 목표:**
- 바쁜 대학생들이 매일 3-5분 안에 읽을 수 있는 명확하고 흥미로운 일간 브리핑 작성
- 오늘 기술 업계에서 일어난 중요한 일들을 대학생 수준에서 이해할 수 있게 설명

**작성 스타일:**
- 대학생이 이해할 수 있는 적절한 수준의 언어 사용
- 전문용어는 간단한 설명과 함께 사용 (너무 쉽게 풀어쓰지 말고)
- 기술적 원리보다는 실용적 의미와 트렌드에 집중
- 자연스럽고 읽기 편한 문체 사용

**보고서 구조 (반드시 이 형식을 지켜주세요):**

<REPORT_STRUCTURE_START>
## 🌅 오늘의 테크 헤드라인

{{가장 중요한 2-3개 이슈를 한 줄로}}

## 🔥 주목할 소식

### 📱 주요 기업 동향

{{피드에 등장하는 기업들의 최신 발표와 그 의미}}

### 🚀 기술 발전  

{{새로운 기술 트렌드와 발전 방향}}

### 💼 비즈니스 관점

{{산업 변화와 진로에 주는 시사점}}

## ⚡ 한 줄 요약

{{오늘 소식 중 가장 기억할 만한 것 하나}}
<REPORT_STRUCTURE_END>

**중요 출력 지침:**
- 응답에 URL 접근 상태, 분석 과정, 내부 처리 정보 등의 디버그 내용을 포함하지 마세요
- 바로 완성된 마크다운 보고서만 출력하세요
- 응답은 반드시 "## 🌅 오늘의 테크 헤드라인"으로 시작해야 합니다
- 어떤 메타 정보나 과정 설명도 포함하지 말고, 순수한 뉴스 브리핑만 제공하세요
- GitHub Flavored Markdown을 완벽히 지원하도록 작성하세요
- ⚠️ <REPORT_STRUCTURE_START>와 <REPORT_STRUCTURE_END> 사이의 구조를 정확히 복제하세요

**인용 규칙:**
- 🚨 CRITICAL: 본문에 인용 없으면 완전히 실패입니다! 🚨
- 모든 사실, 수치, 회사명, 발표 내용, 기술명 뒤에 반드시 [^1], [^2], [^3] 형태 인용 필수
- 본문 작성 규칙: 문장을 쓸 때마다 "이 정보는 어느 기사에서 왔는가?"를 자문하고 즉시 [^숫자] 추가
- 중요: 여러 개를 인용할 때 [^3, ^4] 금지! 반드시 [^3][^4] 형태로 연속 작성
- 반드시 문서 맨 끝에 footnote 정의를 다음 형식으로 추가하세요:
  [^1]: 기사제목 - 출처 링크
  [^2]: 기사제목 - 출처 링크
- 기업 이름은 피드 내용에 등장하는 기업들만 언급하고, 임의로 특정 기업을 예시로 들지 마세요`

	userPrompt := fmt.Sprintf(`다음 RSS 피드 데이터를 분석하여 일간 기술 뉴스 브리핑을 작성해주세요.

%s

**분석 지침:**
- 위에 나열된 URL들의 전체 내용을 실제로 읽고 분석하세요
- URL context 도구를 사용해서 각 기사의 상세 내용을 파악하세요
- 필요시 Google Search 도구를 사용해서 추가 배경 정보나 관련 뉴스를 검색하세요
- 반드시 위에 명시된 마크다운 헤더 구조를 정확히 따르세요
- 각 섹션은 2-3개 포인트로 제한
- 구체적인 수치와 데이터 활용으로 신뢰성 확보
- 최종 제출 전 필수 검토: 본문에 [^숫자] 인용이 충분히 있는지 다시 한번 확인하세요`, feedData)

	return systemPrompt, userPrompt
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

	resp, err := s.client.Models.GenerateContent(ctx, s.config.GeminiModel, content, generateConfig)
	if err != nil {
		return "", &utils.AIError{
			Operation: "요약 생성",
			Err:       err,
		}
	}

	return resp.Text(), nil
}
