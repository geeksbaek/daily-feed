package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/jongyeol/daily-feed/internal/app"
)

type SummaryData struct {
	Date        string         `json:"date"`
	Preset      string         `json:"preset"`
	Summary     string         `json:"summary"`
	Articles    []ArticleData  `json:"articles"`
	GeneratedAt time.Time      `json:"generatedAt"`
}

type ArticleData struct {
	Title       string    `json:"title"`
	Link        string    `json:"link"`
	Source      string    `json:"source"`
	Category    string    `json:"category"`
	PublishedAt time.Time `json:"publishedAt"`
	Description string    `json:"description,omitempty"`
}

type IndexEntry struct {
	Date     string   `json:"date"`
	Presets  []string `json:"presets"`
	Articles int      `json:"articles"`
}

func main() {
	ctx := context.Background()
	
	// 한국 시간대 설정
	kst, _ := time.LoadLocation("Asia/Seoul")
	
	// 오늘 날짜 (한국 시간 기준)
	today := time.Now().In(kst).Format("2006-01-02")
	
	// 2가지 프리셋
	presets := []string{"general", "community"}
	
	// 출력 디렉토리 생성 (web/data/summaries)
	outputDir := filepath.Join("..", "web", "data", "summaries", today)
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		fmt.Printf("디렉토리 생성 실패: %v\n", err)
		os.Exit(1)
	}
	
	var allSummaries []SummaryData
	
	// 각 프리셋에 대해 실행
	for _, preset := range presets {
		fmt.Printf("프리셋 '%s' 처리 중...\n", preset)
		
		// 기존 daily-feed 앱 생성 및 실행
		dailyApp, err := app.New("feeds.csv", "gemini-2.5-pro", 24, 15, preset, false)
		if err != nil {
			fmt.Printf("앱 생성 실패 (%s): %v\n", preset, err)
			continue
		}
		
		// 피드 데이터 수집 (내부적으로 처리)
		summary, articles, err := runFeedGeneration(ctx, dailyApp)
		if err != nil {
			fmt.Printf("피드 생성 실패 (%s): %v\n", preset, err)
			continue
		}
		
		// JSON 데이터 구성
		summaryData := SummaryData{
			Date:        today,
			Preset:      preset,
			Summary:     summary,
			Articles:    articles,
			GeneratedAt: time.Now().In(kst),
		}
		
		// JSON 파일로 저장
		filename := fmt.Sprintf("%s.json", preset)
		filePath := filepath.Join(outputDir, filename)
		
		if err := saveJSON(summaryData, filePath); err != nil {
			fmt.Printf("JSON 저장 실패 (%s): %v\n", preset, err)
			continue
		}
		
		allSummaries = append(allSummaries, summaryData)
		fmt.Printf("프리셋 '%s' 완료: %d개 기사 처리됨\n", preset, len(articles))
	}
	
	// 인덱스 파일 업데이트 (성공한 프리셋이 하나라도 있으면 업데이트)
	if len(allSummaries) > 0 {
		if err := updateIndex(today, presets, len(allSummaries[0].Articles)); err != nil {
			fmt.Printf("인덱스 업데이트 실패: %v\n", err)
		}
	} else {
		// 데이터가 없어도 인덱스는 업데이트 (빈 엔트리라도)
		if err := updateIndex(today, presets, 0); err != nil {
			fmt.Printf("인덱스 업데이트 실패: %v\n", err)
		}
	}
	
	fmt.Printf("Daily Feed 생성 완료: %s\n", today)
}

// runFeedGeneration은 기존 app.RunAndReturnData를 사용하여 데이터를 반환
func runFeedGeneration(ctx context.Context, dailyApp *app.App) (string, []ArticleData, error) {
	// 앱에서 요약과 피드 아이템 데이터 가져오기
	summary, feedItems, err := dailyApp.RunAndReturnData(ctx)
	if err != nil {
		return "", nil, err
	}
	
	// 데이터가 없는 경우
	if len(feedItems) == 0 {
		return "최근 24시간 내 새로운 피드가 없습니다.", []ArticleData{}, nil
	}
	
	// FeedItem을 ArticleData로 변환
	var articles []ArticleData
	for _, item := range feedItems {
		article := ArticleData{
			Title:       item.Title,
			Link:        item.Link,
			Source:      item.Source,
			Category:    item.Category,
			PublishedAt: item.PubDate,
			Description: item.Description,
		}
		articles = append(articles, article)
	}
	
	return summary, articles, nil
}

func saveJSON(data interface{}, filePath string) error {
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()
	
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

func updateIndex(date string, presets []string, articleCount int) error {
	indexPath := filepath.Join("..", "web", "data", "summaries", "index.json")
	
	var index []IndexEntry
	
	// 기존 인덱스 파일 읽기
	if data, err := os.ReadFile(indexPath); err == nil {
		json.Unmarshal(data, &index)
	}
	
	// 새 엔트리 추가 (중복 확인)
	found := false
	for i, entry := range index {
		if entry.Date == date {
			index[i] = IndexEntry{
				Date:     date,
				Presets:  presets,
				Articles: articleCount,
			}
			found = true
			break
		}
	}
	
	if !found {
		index = append(index, IndexEntry{
			Date:     date,
			Presets:  presets,
			Articles: articleCount,
		})
	}
	
	// 날짜 역순 정렬 (최신순)
	for i := 0; i < len(index)-1; i++ {
		for j := i + 1; j < len(index); j++ {
			if index[i].Date < index[j].Date {
				index[i], index[j] = index[j], index[i]
			}
		}
	}
	
	return saveJSON(index, indexPath)
}