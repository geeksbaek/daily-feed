package feed

import (
	"context"
	"encoding/xml"
	"io"
	"net"
	"net/http"
	"sync"
	"time"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/config"
	"github.com/jongyeol/daily-feed/pkg/models"
	"github.com/jongyeol/daily-feed/pkg/utils"
)

type Processor interface {
	ProcessFeeds(ctx context.Context, feeds []models.Feed, cutoffTime time.Time) ([]models.FeedItem, error)
}

type processor struct {
	client *http.Client
	logger logger.Logger
}

func NewProcessor(cfg *config.Config, logger logger.Logger) Processor {
	client := &http.Client{
		Timeout: time.Duration(cfg.HTTPTimeout) * time.Second,
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

	return &processor{
		client: client,
		logger: logger,
	}
}

func (p *processor) ProcessFeeds(ctx context.Context, feeds []models.Feed, cutoffTime time.Time) ([]models.FeedItem, error) {
	var wg sync.WaitGroup
	itemsChan := make(chan models.FeedItem, 1000)
	errChan := make(chan error, len(feeds))

	for _, feed := range feeds {
		wg.Add(1)
		go func(f models.Feed) {
			defer wg.Done()
			if err := p.processFeed(ctx, f, cutoffTime, itemsChan); err != nil {
				errChan <- err
			}
		}(feed)
	}

	go func() {
		wg.Wait()
		close(itemsChan)
		close(errChan)
	}()

	var allItems []models.FeedItem
	for item := range itemsChan {
		allItems = append(allItems, item)
	}

	var errors []error
	for err := range errChan {
		errors = append(errors, err)
		p.logger.Error(err.Error())
	}

	return allItems, nil
}

func (p *processor) processFeed(ctx context.Context, feed models.Feed, cutoffTime time.Time, itemsChan chan<- models.FeedItem) error {
	req, err := http.NewRequestWithContext(ctx, "GET", feed.RSSUrl, nil)
	if err != nil {
		return &utils.FeedError{
			FeedTitle: feed.Title,
			Operation: "요청 생성",
			Err:       err,
		}
	}

	// User-Agent 헤더 추가 (일부 서버에서 Go 기본 User-Agent를 차단함)
	req.Header.Set("User-Agent", "daily-feed/1.0 (RSS Reader)")

	resp, err := p.client.Do(req)
	if err != nil {
		return &utils.FeedError{
			FeedTitle: feed.Title,
			Operation: "가져오기",
			Err:       err,
		}
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return &utils.FeedError{
			FeedTitle: feed.Title,
			Operation: "읽기",
			Err:       err,
		}
	}

	bodyStr := utils.FixXMLEntities(string(body))

	// RSS 피드 파싱 시도
	var rss models.RSS
	if err := xml.Unmarshal([]byte(bodyStr), &rss); err == nil && len(rss.Channel.Items) > 0 {
		return p.processRSSItems(rss.Channel.Items, feed, cutoffTime, itemsChan)
	}

	// Atom 피드 파싱 시도
	var atom models.AtomFeed
	if err := xml.Unmarshal([]byte(bodyStr), &atom); err == nil && len(atom.Entries) > 0 {
		return p.processAtomEntries(atom.Entries, feed, cutoffTime, itemsChan)
	}

	return &utils.FeedError{
		FeedTitle: feed.Title,
		Operation: "XML 파싱",
		Err:       err,
	}
}

func (p *processor) processRSSItems(items []models.Item, feed models.Feed, cutoffTime time.Time, itemsChan chan<- models.FeedItem) error {
	for _, item := range items {
		pubDate, err := utils.ParseDate(item.PubDate)
		if err != nil {
			continue
		}

		if pubDate.After(cutoffTime) {
			itemsChan <- models.FeedItem{
				Title:       item.Title,
				Link:        item.Link,
				PubDate:     pubDate,
				Description: item.Description,
				Category:    feed.Category,
				Source:      feed.Title,
			}
		}
	}
	return nil
}

func (p *processor) processAtomEntries(entries []models.AtomEntry, feed models.Feed, cutoffTime time.Time, itemsChan chan<- models.FeedItem) error {
	for _, entry := range entries {
		// published 필드를 우선적으로 사용하고, 없으면 updated 사용
		dateStr := entry.Published
		if dateStr == "" {
			dateStr = entry.Updated
		}
		
		pubDate, err := utils.ParseDate(dateStr)
		if err != nil {
			continue
		}

		if pubDate.After(cutoffTime) {
			// Atom 피드에서 링크 추출
			var link string
			for _, l := range entry.Link {
				if l.Rel == "alternate" || l.Rel == "" {
					link = l.Href
					break
				}
			}

			// 설명 추출 (Summary 또는 Content)
			description := entry.Summary
			if description == "" && entry.Content.Text != "" {
				description = entry.Content.Text
			}

			itemsChan <- models.FeedItem{
				Title:       entry.Title,
				Link:        link,
				PubDate:     pubDate,
				Description: description,
				Category:    feed.Category,
				Source:      feed.Title,
			}
		}
	}
	return nil
}