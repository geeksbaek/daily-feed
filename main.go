package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"iter"
	"log"
	"maps"
	"net"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"google.golang.org/genai"
)

type Feed struct {
	Title    string
	RSSUrl   string
	Website  string
	Category string
}

type RSS struct {
	Channel Channel `xml:"channel"`
}

type Channel struct {
	Title       string `xml:"title"`
	Description string `xml:"description"`
	Link        string `xml:"link"`
	Items       []Item `xml:"item"`
}

type Item struct {
	Title       string `xml:"title"`
	Description string `xml:"description"`
	Link        string `xml:"link"`
	PubDate     string `xml:"pubDate"`
	GUID        string `xml:"guid"`
}

type FeedItem struct {
	Title       string
	Link        string
	PubDate     time.Time
	Description string
	Category    string
	Source      string
}

type Config struct {
	FeedsFile    string `json:"feeds_file"`
	GeminiModel  string `json:"gemini_model"`
	CutoffHours  int    `json:"cutoff_hours"`
	HTTPTimeout  int    `json:"http_timeout_seconds"`
}

const (
	MaxURLs = 20 // 최대 URL 개수 (고정값)
)

var (
	client       *http.Client
	geminiClient *genai.Client
	config       Config
)

func main() {
	// 설정 파일 로드
	err := loadConfig("config.json")
	if err != nil {
		log.Fatal("설정 파일 로드 실패:", err)
	}

	// Gemini 클라이언트 초기화
	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY 환경변수가 설정되지 않았습니다")
	}

	geminiClient, err = genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal("Gemini 클라이언트 초기화 실패:", err)
	}

	feeds, err := loadFeeds(config.FeedsFile)
	if err != nil {
		log.Fatal("feeds 파일을 읽는 중 오류:", err)
	}

	cutoffTime := time.Now().Add(-time.Duration(config.CutoffHours) * time.Hour)
	var wg sync.WaitGroup
	itemsChan := make(chan FeedItem, 1000)

	for _, feed := range feeds {
		wg.Add(1)
		go func(f Feed) {
			defer wg.Done()
			processFeed(f, cutoffTime, itemsChan)
		}(feed)
	}

	go func() {
		wg.Wait()
		close(itemsChan)
	}()

	var allItems []FeedItem
	for item := range itemsChan {
		allItems = append(allItems, item)
	}

	if len(allItems) == 0 {
		fmt.Printf("최근 %d시간 내 새로운 피드가 없습니다.\n", config.CutoffHours)
		return
	}

	// AI 요약 수행
	fmt.Println("AI 요약을 생성하고 있습니다...")
	summary, err := generateAISummary(allItems)
	if err != nil {
		log.Printf("AI 요약 생성 실패: %v", err)
		summary = "AI 요약을 생성할 수 없습니다."
	}

	outputMarkdown(allItems, summary)
}

func loadFeeds(filename string) ([]Feed, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	var feeds []Feed
	for i, record := range records {
		if i == 0 { // 헤더 스킵
			continue
		}
		if len(record) < 4 {
			log.Printf("CSV 레코드 %d번째 줄: 필드가 부족합니다 (필요: 4개, 실제: %d개)", i+1, len(record))
			continue
		}
		if strings.TrimSpace(record[1]) == "" {
			log.Printf("CSV 레코드 %d번째 줄: RSS URL이 비어있습니다", i+1)
			continue
		}
		feeds = append(feeds, Feed{
			Title:    strings.TrimSpace(record[0]),
			RSSUrl:   strings.TrimSpace(record[1]),
			Website:  strings.TrimSpace(record[2]),
			Category: strings.TrimSpace(record[3]),
		})
	}

	return feeds, nil
}

// initHTTPClient initializes HTTP client with Go 1.23+ network improvements
func initHTTPClient() {
	client = &http.Client{
		Timeout: time.Duration(config.HTTPTimeout) * time.Second,
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
				KeepAliveConfig: net.KeepAliveConfig{
					Enable:   true,
					Idle:     30 * time.Second,
					Interval: 10 * time.Second,
					Count:    3,
				},
			}).DialContext,
		},
	}
}

func loadConfig(filename string) error {
	// 기본값 설정
	config = Config{
		FeedsFile:   "feeds.csv",
		GeminiModel: "gemini-2.5-pro",
		CutoffHours: 24,
		HTTPTimeout: 15,
	}

	// HTTP 클라이언트 초기화
	initHTTPClient()

	// 파일이 존재하지 않으면 기본값 사용
	if _, err := os.Stat(filename); os.IsNotExist(err) {
		log.Printf("설정 파일 %s이 존재하지 않습니다. 기본값을 사용합니다.", filename)
		return nil
	}

	// 파일 읽기
	file, err := os.Open(filename)
	if err != nil {
		return fmt.Errorf("설정 파일 열기 실패: %v", err)
	}
	defer file.Close()

	// JSON 파싱
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&config); err != nil {
		return fmt.Errorf("설정 파일 파싱 실패: %v", err)
	}

	// HTTP 클라이언트 재초기화
	initHTTPClient()

	log.Printf("설정 로드 완료: feeds_file=%s, gemini_model=%s, cutoff_hours=%d, max_urls=%d(고정), http_timeout=%d", 
		config.FeedsFile, config.GeminiModel, config.CutoffHours, MaxURLs, config.HTTPTimeout)
	return nil
}

func processFeed(feed Feed, cutoffTime time.Time, itemsChan chan<- FeedItem) {
	resp, err := client.Get(feed.RSSUrl)
	if err != nil {
		log.Printf("피드 %s 가져오기 실패: %v", feed.Title, err)
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("피드 %s 읽기 실패: %v", feed.Title, err)
		return
	}

	// XML 엔티티 오류 수정
	bodyStr := fixXMLEntities(string(body))

	var rss RSS
	if err := xml.Unmarshal([]byte(bodyStr), &rss); err != nil {
		log.Printf("피드 %s XML 파싱 실패: %v", feed.Title, err)
		return
	}

	for _, item := range rss.Channel.Items {
		pubDate, err := parseDate(item.PubDate)
		if err != nil {
			continue
		}

		if pubDate.After(cutoffTime) {
			itemsChan <- FeedItem{
				Title:       item.Title,
				Link:        item.Link,
				PubDate:     pubDate,
				Description: item.Description,
				Category:    feed.Category,
				Source:      feed.Title,
			}
		}
	}
}

func parseDate(dateStr string) (time.Time, error) {
	formats := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC822Z,
		time.RFC822,
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05-07:00",
		"2006-01-02 15:04:05",
		"Mon, 02 Jan 2006 15:04:05 -0700",
		"Mon, 02 Jan 2006 15:04:05 MST",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("날짜 파싱 실패: %s", dateStr)
}


func generateAISummary(items []FeedItem) (string, error) {
	ctx := context.Background()
	
	// 피드 데이터와 URL 준비
	feedData, urls := prepareFeedData(items)
	
	// 프롬프트 생성
	prompt := generatePrompt(feedData, urls)
	
	// Gemini API 호출
	return callGeminiAPI(ctx, prompt)
}

// prepareFeedData prepares feed data and extracts URLs using Go 1.23+ iterators
func prepareFeedData(items []FeedItem) (string, []string) {
	var feedData strings.Builder
	feedData.WriteString("다음은 최신 AI 관련 피드 데이터입니다:\n\n")

	// Go 1.23+ iterator를 사용하여 피드 아이템 처리
	var urls []string
	i := 1
	for item := range feedItemIterator(items) {
		feedData.WriteString(fmt.Sprintf("%d. **%s**\n", i, item.Title))
		feedData.WriteString(fmt.Sprintf("   - 출처: %s\n", item.Source))
		feedData.WriteString(fmt.Sprintf("   - 링크: %s\n", item.Link))
		feedData.WriteString(fmt.Sprintf("   - 날짜: %s\n", item.PubDate.Format("2006-01-02")))
		if item.Description != "" {
			feedData.WriteString(fmt.Sprintf("   - 요약: %s\n", cleanHTML(item.Description)))
		}
		feedData.WriteString("\n")
		i++
	}

	// URL iterator를 사용하여 URL 수집
	for url := range urlIterator(items) {
		urls = append(urls, url)
	}

	// 중복 URL 제거 및 최대 개수 제한
	urls = removeDuplicateURLs(urls, MaxURLs)

	// URL들을 추가로 명시
	if len(urls) > 0 {
		feedData.WriteString("위 기사들의 전체 내용을 분석하기 위해 다음 URL들을 참조하세요:\n")
		for _, url := range urls {
			feedData.WriteString(fmt.Sprintf("- %s\n", url))
		}
		feedData.WriteString("\n")
	}
	
	return feedData.String(), urls
}

// generatePrompt creates the AI prompt
func generatePrompt(feedData string, urls []string) string {
	return fmt.Sprintf(`당신은 기술 뉴스를 명확하게 설명하는 에디터입니다. 바쁜 대학생들이 매일 3-5분 안에 읽을 수 있는 명확하고 흥미로운 일간 브리핑을 작성해주세요.

%s

**중요한 출력 지침:**
- 응답에 URL 접근 상태, 분석 과정, 내부 처리 정보 등의 디버그 내용을 포함하지 마세요
- 바로 완성된 마크다운 보고서만 출력하세요
- 응답은 반드시 "## 🌅 오늘의 테크 헤드라인"으로 시작해야 합니다
- 어떤 메타 정보나 과정 설명도 포함하지 말고, 순수한 뉴스 브리핑만 제공하세요
- GitHub Flavored Markdown을 완벽히 지원하도록 작성하세요 (테이블, 코드 블록, 체크박스 등 필요시 사용)

**목표:** 
오늘 기술 업계에서 일어난 중요한 일들을 대학생 수준에서 이해할 수 있게 설명하세요.

**작성 스타일:**
- 대학생이 이해할 수 있는 적절한 수준의 언어 사용
- 전문용어는 간단한 설명과 함께 사용 (너무 쉽게 풀어쓰지 말고)
- 기술적 원리보다는 실용적 의미와 트렌드에 집중
- 자연스럽고 읽기 편한 문체 사용

**보고서 구조 (반드시 이 형식을 지켜주세요):**

## 🌅 오늘의 테크 헤드라인
*가장 중요한 2-3개 이슈를 한 줄로*

## 🔥 주목할 소식
### 📱 주요 기업 동향
*피드에 등장하는 기업들의 최신 발표와 그 의미*

### 🚀 기술 발전  
*새로운 기술 트렌드와 발전 방향*

### 💼 비즈니스 관점
*산업 변화와 진로에 주는 시사점*

## ⚡ 한 줄 요약
*오늘 소식 중 가장 기억할 만한 것 하나*

**중요 지시사항:**
- 위에 나열된 URL들의 전체 내용을 실제로 읽고 분석하세요
- URL context 도구를 사용해서 각 기사의 상세 내용을 파악하세요
- 필요시 Google Search 도구를 사용해서 추가 배경 정보나 관련 뉴스를 검색하세요
- **반드시 위에 명시된 마크다운 헤더 구조를 정확히 따르세요 (## 🌅 오늘의 테크 헤드라인, ## 🔥, ### 📱, ### 🚀, ### 💼, ## ⚡)**
- 전문 용어는 간단한 설명과 함께 사용 (예: "파운데이션 모델(대규모 AI 기반 모델)")
- 각 섹션은 2-3개 포인트로 제한
- 구체적인 수치와 데이터 활용으로 신뢰성 확보
- **🚨 CRITICAL: 본문에 인용 없으면 완전히 실패입니다! 🚨**
- **모든 사실, 수치, 회사명, 발표 내용, 기술명 뒤에 반드시 [^1], [^2], [^3] 형태 인용 필수**
- **본문 작성 규칙: 문장을 쓸 때마다 "이 정보는 어느 기사에서 왔는가?"를 자문하고 즉시 [^숫자] 추가**
- **중요: 여러 개를 인용할 때 [^3, ^4] 금지! 반드시 [^3][^4] 형태로 연속 작성**
- 올바른 예시들:
  - "Apple이 16만 2천 명의 데이터를 분석했습니다[^2]"
  - "Google이 정신건강 AI 도구를 발표했습니다[^4]" 
  - "시간당 100TB 속도로 이전했습니다[^5]"
  - "Gemini는 멀티모달 모델입니다[^1]"
  - "Google과 Apple의 사례를 보면[^3][^4]" (여러 인용 시)
- **잘못된 예시 (절대 금지):**
  - "Apple이 16만 2천 명의 데이터를 분석했습니다" (인용 없음)
  - "최근 AI 기술이 발전하고 있습니다" (출처 없는 일반론)
  - "Google과 Apple의 사례를 보면[^3, ^4]" (쉼표 사용 금지)
- **인용 검증 체크리스트:**
  ✅ 회사명 언급시 인용 있음
  ✅ 수치/데이터 언급시 인용 있음  
  ✅ 제품/기술명 언급시 인용 있음
  ✅ 발표/연구 내용 언급시 인용 있음
- **반드시 문서 맨 끝에 footnote 정의를 다음 형식으로 추가하세요 (앞뒤에 --- 디바이더 넣지 마세요):**
  [^1]: 기사제목 - 출처 링크
  [^2]: 기사제목 - 출처 링크
  [^3]: 기사제목 - 출처 링크
- 기업 이름은 피드 내용에 등장하는 기업들만 언급하고, 임의로 특정 기업을 예시로 들지 마세요
- **최종 제출 전 필수 검토: 본문에 [^숫자] 인용이 충분히 있는지 다시 한번 확인하세요**`, feedData)
}

// callGeminiAPI calls the Gemini API with the given prompt
func callGeminiAPI(ctx context.Context, prompt string) (string, error) {
	// URL Context와 Google Search 도구 모두 활성화
	tools := []*genai.Tool{
		{
			URLContext: &genai.URLContext{},
		},
		{
			GoogleSearch: &genai.GoogleSearch{},
		},
	}

	// 컨텐츠 생성
	parts := []*genai.Part{
		{Text: prompt},
	}

	content := []*genai.Content{{Parts: parts}}

	// Tool과 structured output을 함께 사용할 수 없으므로 tool만 사용
	thinkingBudget := int32(-1)
	generateConfig := &genai.GenerateContentConfig{
		Tools: tools,
		ThinkingConfig: &genai.ThinkingConfig{
			ThinkingBudget: &thinkingBudget,
		},
		ResponseMIMEType: "text/plain",
	}

	// Gemini API 호출
	resp, err := geminiClient.Models.GenerateContent(ctx, config.GeminiModel, content, generateConfig)
	if err != nil {
		return "", fmt.Errorf("Gemini API 호출 실패: %v", err)
	}

	// 응답 텍스트를 바로 반환 (시스템 프롬프트로 디버그 내용 제외 지시)
	return resp.Text(), nil
}

func outputMarkdown(items []FeedItem, aiSummary string) {
	now := time.Now()
	filename := fmt.Sprintf("daily-feed-%s.md", now.Format("2006-01-02-15-04-05"))

	var content strings.Builder
	content.WriteString(fmt.Sprintf("# Daily Feed - %s\n\n", now.Format("2006-01-02")))

	// AI 요약만 추가
	if aiSummary != "" {
		content.WriteString(aiSummary)
	}

	err := os.WriteFile(filename, []byte(content.String()), 0644)
	if err != nil {
		log.Fatal("파일 저장 실패:", err)
	}

	fmt.Printf("피드가 %s 파일로 저장되었습니다.\n", filename)
}

// fixXMLEntities fixes common XML entity issues
func fixXMLEntities(bodyStr string) string {
	body := bodyStr
	body = strings.ReplaceAll(body, "&nbsp;", " ")
	body = strings.ReplaceAll(body, "&ldquo;", "\"")
	body = strings.ReplaceAll(body, "&rdquo;", "\"")
	body = strings.ReplaceAll(body, "&lsquo;", "'")
	body = strings.ReplaceAll(body, "&rsquo;", "'")
	body = strings.ReplaceAll(body, "&mdash;", "-")
	body = strings.ReplaceAll(body, "&ndash;", "-")
	return body
}

func cleanHTML(html string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	return strings.TrimSpace(re.ReplaceAllString(html, ""))
}

// feedItemIterator creates an iterator for processing feed items (Go 1.23+ iter package)
func feedItemIterator(items []FeedItem) iter.Seq[FeedItem] {
	return func(yield func(FeedItem) bool) {
		for _, item := range items {
			if !yield(item) {
				return
			}
		}
	}
}

// urlIterator creates an iterator for processing URLs from feed items
func urlIterator(items []FeedItem) iter.Seq[string] {
	return func(yield func(string) bool) {
		for _, item := range items {
			if item.Link != "" {
				if !yield(item.Link) {
					return
				}
			}
		}
	}
}

// removeDuplicateURLs removes duplicate URLs and limits to maxCount using Go 1.23+ maps package
func removeDuplicateURLs(urls []string, maxCount int) []string {
	// Go 1.23+ maps 패키지를 활용하여 더 효율적인 처리
	urlMap := make(map[string]bool, len(urls))
	
	// URL을 맵에 추가 (중복 자동 제거)
	for _, url := range urls {
		urlMap[url] = true
	}
	
	// maps.Keys를 사용하여 고유 URL 추출
	var result []string
	count := 0
	for url := range maps.All(urlMap) {
		result = append(result, url)
		count++
		if count >= maxCount {
			break
		}
	}
	
	if len(urlMap) > maxCount {
		log.Printf("URL 개수가 %d개를 초과하여 중복 제거 후 최신 %d개를 사용합니다", len(urlMap), len(result))
	}
	
	return result
}
