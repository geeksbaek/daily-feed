package feed

import (
	"context"
	"encoding/csv"
	"encoding/xml"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/jongyeol/daily-feed/pkg/models"
	"github.com/jongyeol/daily-feed/pkg/utils"
)

// 문제가 되는 피드들을 테스트
var problematicFeeds = []models.Feed{
	{
		Title:    "GitHub Blog",
		RSSUrl:   "https://github.blog/feed/",
		Website:  "https://github.blog/",
		Category: "tech",
	},
	{
		Title:    "GitHub Copilot Blog",
		RSSUrl:   "https://github.blog/ai-and-ml/github-copilot/feed/",
		Website:  "https://github.blog/ai-and-ml/github-copilot/",
		Category: "tech",
	},
	{
		Title:    "Microsoft AI Blogs",
		RSSUrl:   "https://www.microsoft.com/en-us/ai/blog/feed/",
		Website:  "https://www.microsoft.com/en-us/ai/blog/",
		Category: "tech",
	},
	{
		Title:    "GeekNews",
		RSSUrl:   "https://feeds.feedburner.com/geeknews-feed",
		Website:  "https://news.hada.io/",
		Category: "tech",
	},
}

func TestProblematicFeedsIndividually(t *testing.T) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	for _, feed := range problematicFeeds {
		t.Run(feed.Title, func(t *testing.T) {
			testSingleFeed(t, client, feed)
		})
	}
}

func testSingleFeed(t *testing.T, client *http.Client, feed models.Feed) {
	ctx := context.Background()
	
	// 1. HTTP 요청 테스트
	req, err := http.NewRequestWithContext(ctx, "GET", feed.RSSUrl, nil)
	if err != nil {
		t.Fatalf("HTTP 요청 생성 실패: %v", err)
	}

	// User-Agent 헤더 추가
	req.Header.Set("User-Agent", "daily-feed/1.0")

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP 요청 실패: %v", err)
	}
	defer resp.Body.Close()

	// 응답 상태 코드 확인
	if resp.StatusCode != 200 {
		t.Fatalf("HTTP 상태 코드 오류: %d", resp.StatusCode)
	}

	// Content-Type 확인
	contentType := resp.Header.Get("Content-Type")
	t.Logf("Content-Type: %s", contentType)

	// 2. 응답 본문 읽기
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("응답 본문 읽기 실패: %v", err)
	}

	bodyStr := string(body)
	t.Logf("응답 크기: %d bytes", len(bodyStr))
	
	// 첫 500자 출력 (디버깅용)
	if len(bodyStr) > 500 {
		t.Logf("응답 본문 시작: %s...", bodyStr[:500])
	} else {
		t.Logf("응답 본문: %s", bodyStr)
	}

	// 3. XML 기본 구조 확인
	trimmed := strings.TrimSpace(bodyStr)
	if !strings.HasPrefix(trimmed, "<?xml") && !strings.HasPrefix(trimmed, "<rss") && !strings.HasPrefix(trimmed, "<feed") {
		t.Errorf("응답이 XML 형식이 아님: %s", bodyStr[:100])
	}

	// 4. XML Entity 수정 전 파싱 테스트
	var rss1 models.RSS
	err1 := xml.Unmarshal(body, &rss1)
	
	// 5. XML Entity 수정 후 RSS 파싱 테스트
	fixedBodyStr := utils.FixXMLEntities(bodyStr)
	var rss2 models.RSS
	err2 := xml.Unmarshal([]byte(fixedBodyStr), &rss2)

	// 6. Atom 피드 파싱 시도
	var atom1 models.AtomFeed
	err3 := xml.Unmarshal(body, &atom1)
	
	var atom2 models.AtomFeed
	err4 := xml.Unmarshal([]byte(fixedBodyStr), &atom2)

	// 결과 출력
	t.Logf("원본 RSS 파싱 결과: %v", err1)
	t.Logf("수정된 RSS 파싱 결과: %v", err2)
	t.Logf("원본 Atom 파싱 결과: %v", err3)
	t.Logf("수정된 Atom 파싱 결과: %v", err4)

	// RSS 파싱 성공 확인
	if err2 == nil && len(rss2.Channel.Items) > 0 {
		t.Logf("RSS 파싱 성공! 아이템 수: %d", len(rss2.Channel.Items))
		if len(rss2.Channel.Items) > 0 {
			t.Logf("첫 번째 RSS 아이템: %s", rss2.Channel.Items[0].Title)
		}
	} else if err4 == nil && len(atom2.Entries) > 0 {
		t.Logf("Atom 파싱 성공! 엔트리 수: %d", len(atom2.Entries))
		if len(atom2.Entries) > 0 {
			t.Logf("첫 번째 Atom 엔트리: %s", atom2.Entries[0].Title)
		}
	} else {
		t.Errorf("RSS와 Atom 파싱 모두 실패:")
		t.Errorf("  원본 RSS: %v", err1)
		t.Errorf("  수정 RSS: %v", err2)
		t.Errorf("  원본 Atom: %v", err3)
		t.Errorf("  수정 Atom: %v", err4)
		
		// 구체적인 XML 오류 위치 찾기
		if err2 != nil {
			findXMLError(t, fixedBodyStr, err2)
		}
		if err4 != nil {
			findXMLError(t, fixedBodyStr, err4)
		}
	}
}

func findXMLError(t *testing.T, xmlStr string, err error) {
	if err == nil {
		return
	}

	errStr := err.Error()
	t.Logf("XML 오류 분석: %s", errStr)

	// 라인 번호 추출 시도
	lines := strings.Split(xmlStr, "\n")
	if len(lines) >= 6 {
		t.Logf("라인 6 내용: %s", lines[5])
	}
	if len(lines) >= 984 {
		t.Logf("라인 984 내용: %s", lines[983])
	}

	// 특정 패턴 검색
	if strings.Contains(errStr, "element <hr> closed by </body>") {
		t.Logf("HTML 태그 혼재 문제 감지")
		// <hr> 태그가 있는 위치 찾기
		if idx := strings.Index(xmlStr, "<hr>"); idx != -1 {
			start := max(0, idx-100)
			end := min(len(xmlStr), idx+100)
			t.Logf("<hr> 태그 주변: %s", xmlStr[start:end])
		}
	}

	if strings.Contains(errStr, "invalid character entity") {
		t.Logf("잘못된 Character Entity 문제 감지")
		// & 문자 패턴 검색
		ampersandPattern := regexp.MustCompile(`&[^;]*[^;]`)
		matches := ampersandPattern.FindAllString(xmlStr, 10)
		if len(matches) > 0 {
			t.Logf("문제가 될 수 있는 & 패턴들: %v", matches)
		}
	}
}

func TestXMLEntityFix(t *testing.T) {
	testCases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "nbsp entity",
			input:    "Hello&nbsp;World",
			expected: "Hello World",
		},
		{
			name:     "quote entities",
			input:    "&ldquo;Hello&rdquo; &lsquo;World&rsquo;",
			expected: "\"Hello\" 'World'",
		},
		{
			name:     "dash entities",
			input:    "Hello&mdash;World&ndash;Test",
			expected: "Hello-World-Test",
		},
		{
			name:     "invalid entity without semicolon",
			input:    "Hello & World",
			expected: "Hello & World",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := utils.FixXMLEntities(tc.input)
			if result != tc.expected {
				t.Errorf("Expected: %s, Got: %s", tc.expected, result)
			}
		})
	}
}

func TestHTTPHeaders(t *testing.T) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	for _, feed := range problematicFeeds {
		t.Run(feed.Title, func(t *testing.T) {
			req, err := http.NewRequestWithContext(context.Background(), "GET", feed.RSSUrl, nil)
			if err != nil {
				t.Fatalf("HTTP 요청 생성 실패: %v", err)
			}

			// 다양한 User-Agent 테스트
			userAgents := []string{
				"daily-feed/1.0",
				"Mozilla/5.0 (compatible; RSS Reader)",
				"Go-http-client/1.1",
			}

			for _, ua := range userAgents {
				req.Header.Set("User-Agent", ua)
				resp, err := client.Do(req)
				if err != nil {
					t.Errorf("User-Agent %s 실패: %v", ua, err)
					continue
				}
				
				t.Logf("User-Agent: %s, Status: %d, Content-Type: %s", 
					ua, resp.StatusCode, resp.Header.Get("Content-Type"))
				resp.Body.Close()
			}
		})
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// feeds.csv에서 모든 피드 로드
func loadAllFeeds(t *testing.T) []models.Feed {
	file, err := os.Open("../../feeds.csv")
	if err != nil {
		t.Fatalf("feeds.csv 파일을 열 수 없습니다: %v", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		t.Fatalf("CSV 파일을 읽을 수 없습니다: %v", err)
	}

	var feeds []models.Feed
	// 첫 번째 줄(헤더) 건너뛰기
	for i := 1; i < len(records); i++ {
		if len(records[i]) >= 4 {
			feeds = append(feeds, models.Feed{
				Title:    records[i][0],
				RSSUrl:   records[i][1],
				Website:  records[i][2],
				Category: records[i][3],
			})
		}
	}

	return feeds
}

// 모든 피드 테스트 (feeds.csv 기반)
func TestAllFeedsFromCSV(t *testing.T) {
	feeds := loadAllFeeds(t)
	
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	for _, feed := range feeds {
		t.Run(feed.Title, func(t *testing.T) {
			testFeedFieldParsing(t, client, feed)
		})
	}
}

// 필드 파싱 검증을 포함한 강화된 테스트
func testFeedFieldParsing(t *testing.T, client *http.Client, feed models.Feed) {
	ctx := context.Background()
	
	// 1. HTTP 요청 테스트
	req, err := http.NewRequestWithContext(ctx, "GET", feed.RSSUrl, nil)
	if err != nil {
		t.Fatalf("HTTP 요청 생성 실패: %v", err)
	}

	req.Header.Set("User-Agent", "daily-feed/1.0")

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP 요청 실패: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		t.Fatalf("HTTP 상태 코드 오류: %d", resp.StatusCode)
	}

	// 2. 응답 본문 읽기
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("응답 본문 읽기 실패: %v", err)
	}

	bodyStr := utils.FixXMLEntities(string(body))
	
	// 3. RSS 피드 파싱 시도
	var rss models.RSS
	rssErr := xml.Unmarshal([]byte(bodyStr), &rss)
	
	// 4. Atom 피드 파싱 시도
	var atom models.AtomFeed
	atomErr := xml.Unmarshal([]byte(bodyStr), &atom)

	// 5. 파싱 결과 확인 및 필드 검증
	if rssErr == nil && len(rss.Channel.Items) > 0 {
		t.Logf("RSS 파싱 성공! 아이템 수: %d", len(rss.Channel.Items))
		validateRSSFields(t, rss.Channel.Items, feed)
	} else if atomErr == nil && len(atom.Entries) > 0 {
		t.Logf("Atom 파싱 성공! 엔트리 수: %d", len(atom.Entries))
		validateAtomFields(t, atom.Entries, feed)
	} else {
		t.Errorf("RSS와 Atom 파싱 모두 실패:")
		t.Errorf("  RSS 오류: %v", rssErr)
		t.Errorf("  Atom 오류: %v", atomErr)
	}
}

// RSS 필드 검증
func validateRSSFields(t *testing.T, items []models.Item, _ models.Feed) {
	for i, item := range items {
		if i >= 3 { // 처음 3개 아이템만 검증
			break
		}
		
		t.Logf("RSS 아이템 #%d 검증:", i+1)
		
		// Title 검증
		if strings.TrimSpace(item.Title) == "" {
			t.Errorf("  Title이 비어있음")
		} else {
			t.Logf("  Title: %s", truncateString(item.Title, 50))
		}
		
		// Link 검증
		if strings.TrimSpace(item.Link) == "" {
			t.Errorf("  Link가 비어있음")
		} else {
			t.Logf("  Link: %s", truncateString(item.Link, 50))
		}
		
		// PubDate 검증
		if strings.TrimSpace(item.PubDate) == "" {
			t.Errorf("  PubDate가 비어있음")
		} else {
			pubDate, err := utils.ParseDate(item.PubDate)
			if err != nil {
				t.Errorf("  PubDate 파싱 실패: %v (원본: %s)", err, item.PubDate)
			} else {
				t.Logf("  PubDate: %s", pubDate.Format(time.RFC3339))
			}
		}
		
		// Description 검증
		if strings.TrimSpace(item.Description) == "" {
			t.Logf("  Description이 비어있음 (선택사항)")
		} else {
			t.Logf("  Description: %s", truncateString(item.Description, 50))
		}
	}
}

// Atom 필드 검증
func validateAtomFields(t *testing.T, entries []models.AtomEntry, _ models.Feed) {
	for i, entry := range entries {
		if i >= 3 { // 처음 3개 엔트리만 검증
			break
		}
		
		t.Logf("Atom 엔트리 #%d 검증:", i+1)
		
		// Title 검증
		if strings.TrimSpace(entry.Title) == "" {
			t.Errorf("  Title이 비어있음")
		} else {
			t.Logf("  Title: %s", truncateString(entry.Title, 50))
		}
		
		// Link 검증
		var link string
		for _, l := range entry.Link {
			if l.Rel == "alternate" || l.Rel == "" {
				link = l.Href
				break
			}
		}
		if strings.TrimSpace(link) == "" {
			t.Errorf("  Link가 비어있음")
		} else {
			t.Logf("  Link: %s", truncateString(link, 50))
		}
		
		// Published/Updated 검증
		dateStr := entry.Published
		if dateStr == "" {
			dateStr = entry.Updated
		}
		
		if strings.TrimSpace(dateStr) == "" {
			t.Errorf("  Published/Updated가 모두 비어있음")
		} else {
			pubDate, err := utils.ParseDate(dateStr)
			if err != nil {
				t.Errorf("  날짜 파싱 실패: %v (원본: %s)", err, dateStr)
			} else {
				if entry.Published != "" {
					t.Logf("  Published: %s", pubDate.Format(time.RFC3339))
				} else {
					t.Logf("  Updated: %s", pubDate.Format(time.RFC3339))
				}
			}
		}
		
		// Summary/Content 검증
		description := entry.Summary
		if description == "" && entry.Content.Text != "" {
			description = entry.Content.Text
		}
		if strings.TrimSpace(description) == "" {
			t.Logf("  Description이 비어있음 (선택사항)")
		} else {
			t.Logf("  Description: %s", truncateString(description, 50))
		}
	}
}

// cutoffTime 적용 테스트
func TestCutoffTimeApplication(t *testing.T) {
	feeds := []models.Feed{
		{
			Title:    "GeekNews",
			RSSUrl:   "https://feeds.feedburner.com/geeknews-feed",
			Website:  "https://news.hada.io/",
			Category: "tech",
		},
	}
	
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	for _, feed := range feeds {
		t.Run(feed.Title, func(t *testing.T) {
			testCutoffTime(t, client, feed)
		})
	}
}

func testCutoffTime(t *testing.T, client *http.Client, feed models.Feed) {
	ctx := context.Background()
	
	// 매우 최근 시간 (1시간 전)으로 cutoff 설정
	cutoffTime := time.Now().Add(-1 * time.Hour)
	
	req, err := http.NewRequestWithContext(ctx, "GET", feed.RSSUrl, nil)
	if err != nil {
		t.Fatalf("HTTP 요청 생성 실패: %v", err)
	}

	req.Header.Set("User-Agent", "daily-feed/1.0")

	resp, err := client.Do(req)
	if err != nil {
		t.Fatalf("HTTP 요청 실패: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("응답 본문 읽기 실패: %v", err)
	}

	bodyStr := utils.FixXMLEntities(string(body))
	
	// Atom 피드 파싱 (GeekNews는 Atom 형식)
	var atom models.AtomFeed
	if err := xml.Unmarshal([]byte(bodyStr), &atom); err != nil {
		t.Fatalf("Atom 파싱 실패: %v", err)
	}

	recentCount := 0
	oldCount := 0
	
	for _, entry := range atom.Entries {
		updated, err := utils.ParseDate(entry.Updated)
		if err != nil {
			t.Logf("날짜 파싱 실패: %v", err)
			continue
		}
		
		if updated.After(cutoffTime) {
			recentCount++
		} else {
			oldCount++
		}
	}
	
	t.Logf("총 엔트리 수: %d", len(atom.Entries))
	t.Logf("cutoff 시간(%s) 이후 엔트리: %d", cutoffTime.Format(time.RFC3339), recentCount)
	t.Logf("cutoff 시간 이전 엔트리: %d", oldCount)
	
	if recentCount == 0 && oldCount == 0 {
		t.Errorf("모든 엔트리의 날짜 파싱이 실패했습니다")
	}
}

// 문자열 자르기 헬퍼 함수
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// 날짜 파싱 테스트
func TestDateParsing(t *testing.T) {
	testCases := []struct {
		name     string
		dateStr  string
		expected bool // 파싱 성공 여부
	}{
		{
			name:     "RFC3339 형식 (Atom 표준)",
			dateStr:  "2025-07-11T10:30:00Z",
			expected: true,
		},
		{
			name:     "RFC3339 with timezone",
			dateStr:  "2025-07-11T10:30:00+09:00",
			expected: true,
		},
		{
			name:     "RFC3339 with nanoseconds",
			dateStr:  "2025-07-11T10:30:00.123456789Z",
			expected: true,
		},
		{
			name:     "RFC1123Z 형식 (RSS 표준)",
			dateStr:  "Thu, 11 Jul 2025 10:30:00 +0000",
			expected: true,
		},
		{
			name:     "RFC1123 형식",
			dateStr:  "Thu, 11 Jul 2025 10:30:00 GMT",
			expected: true,
		},
		{
			name:     "잘못된 형식",
			dateStr:  "2025/07/11 10:30:00",
			expected: false,
		},
		{
			name:     "빈 문자열",
			dateStr:  "",
			expected: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			parsed, err := utils.ParseDate(tc.dateStr)
			
			if tc.expected {
				if err != nil {
					t.Errorf("파싱이 성공해야 하지만 실패: %v", err)
				} else {
					t.Logf("파싱 성공: %s -> %s", tc.dateStr, parsed.Format(time.RFC3339))
				}
			} else {
				if err == nil {
					t.Errorf("파싱이 실패해야 하지만 성공: %s", parsed.Format(time.RFC3339))
				} else {
					t.Logf("예상대로 파싱 실패: %v", err)
				}
			}
		})
	}
}