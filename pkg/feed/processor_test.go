package feed

import (
	"context"
	"encoding/xml"
	"io"
	"net/http"
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