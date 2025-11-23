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

const (
	citationMarker = "`[^n]`"
	citationList   = "`[^n]: 기사제목 - URL`"
)

const magazineSystemPrompt = `당신은 매일 아침 기술 뉴스를 정리해주는 '프리미엄 테크 뉴스 브리핑 봇'입니다.

**핵심 목표:**
1. **정보의 완결성:** 제공된 피드 데이터(30개 이상)를 절대 누락하지 말고 모두 포함하세요.
2. **정보의 위계화:** 모든 정보를 나열하는 대신, 중요도에 따라 섹션을 나누어 강약을 조절하세요.
3. **가독성 극대화:** 바쁜 현대인이 3분 안에 훑어볼 수 있도록 매거진 스타일로 편집하세요.
4. **URL 컨텍스트 활용:** 제공된 URL의 실제 콘텐츠를 분석하여, 제목 뒤에 숨겨진 맥락과 통찰을 찾아내세요.

**콘텐츠 분류 및 작성 알고리즘 (반드시 준수):**
1. 🏆 Top Story (1개): 가장 파급력이 크고 중요한 뉴스 1개를 선정하여 심층 분석.
2. 🔍 Deep Dive (3~4개): 업계 주요 트렌드 뉴스 선정 (What/Why/Impact 구조).
3. 🛠️ Geek's Corner: 개발 도구, 라이브러리, 논문, 영상은 반드시 이 섹션의 '표(Table)'로 정리.
4. ⚡ Lightning Round: 위 섹션에 포함되지 않은 **나머지 모든 뉴스**를 주제별로 분류하여 1줄 요약. (절대 누락 금지)

**인용(Citation) 규칙 🚨 CRITICAL:**` +
	"\n- 문장이나 항목 끝에 반드시 " + citationMarker + " 형태로 출처를 남기세요." +
	"\n- 보고서 맨 마지막에 " + citationList + " 리스트를 생성하세요.\n\n" +
	`**보고서 출력 템플릿:**
<REPORT_STRUCTURE_START>
# ☕️ {오늘날짜}: 데일리 테크 브리핑

> **💡 오늘의 한 줄 요약:** {{전체 핵심 요약}}

---

## 🏆 Top Story: 오늘의 헤드라인
### {{기사 제목}}
{{심층 분석 내용}}
> **Key Point:** {{핵심 요약}} [^n]

---

## 🔍 주요 이슈 Deep Dive
### 1. {{제목}}
- **What:** {{요약}}
- **Why:** {{이유}}
- **Impact:** {{전망}} [^n]

(3~4개 항목 작성)

---

## 🛠️ Geek's Corner: 도구 & 리소스
| 구분 | 이름 | 설명 |
| :--- | :--- | :--- |
| **Tool** | **{{이름}}** | {{설명}} [^n] |
| **Paper** | **{{제목}}** | {{주제}} [^n] |

---

## ⚡️ Lightning Round: 분야별 단신 모음
#### 💻 개발 & 인프라
* **{{제목}}**: {{1줄 요약}} [^n]
(나머지 카테고리 계속)

---

## 📝 큐레이터의 한마디
{{총평}}

{{Footnotes}}
<REPORT_STRUCTURE_END>`

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
			Content:      "AI 요약을 생성할 수 없습니다.",
			SystemPrompt: systemPrompt,
			UserPrompt:   userPrompt,
			Error:        err,
		}, nil
	}

	return &models.Summary{
		Content:      content,
		SystemPrompt: systemPrompt,
		UserPrompt:   userPrompt,
		Error:        nil,
	}, nil
}

func (s *geminiSummarizer) prepareFeedData(items []models.FeedItem) string {
	var feedData strings.Builder

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

	userPrompt := fmt.Sprintf(`다음 RSS 피드 데이터를 분석하여, 시스템 프롬프트에 정의된 '데일리 테크 브리핑' 형식으로 보고서를 작성해주세요.

**입력 데이터:**
%s
`, feedData)

	return systemPrompt, userPrompt
}

func (s *geminiSummarizer) getSystemPrompt() string {
	return magazineSystemPrompt
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
			Role:  "user",
			Parts: []*genai.Part{{Text: userPrompt}},
		},
	}

	thinkingBudget := int32(-1)
	temperature := float32(0.4)
	generateConfig := &genai.GenerateContentConfig{
		Tools: tools,
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingBudget: &thinkingBudget,
		},
		SystemInstruction: &genai.Content{
			Role:  "system",
			Parts: []*genai.Part{{Text: systemPrompt}},
		},
		Temperature:      &temperature,
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
