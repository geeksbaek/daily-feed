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

	var rss models.RSS
	if err := xml.Unmarshal([]byte(bodyStr), &rss); err != nil {
		return &utils.FeedError{
			FeedTitle: feed.Title,
			Operation: "XML 파싱",
			Err:       err,
		}
	}

	for _, item := range rss.Channel.Items {
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