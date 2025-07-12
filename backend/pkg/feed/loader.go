package feed

import (
	"encoding/csv"
	"os"
	"strings"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/models"
	"github.com/jongyeol/daily-feed/pkg/utils"
)

type Loader interface {
	LoadFeeds(filename string) ([]models.Feed, error)
}

type csvLoader struct {
	logger logger.Logger
}

func NewLoader(logger logger.Logger) Loader {
	return &csvLoader{logger: logger}
}

func (l *csvLoader) LoadFeeds(filename string) ([]models.Feed, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, &utils.ConfigError{
			Field: "feeds_file",
			Err:   err,
		}
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, &utils.ConfigError{
			Field: "feeds_file",
			Err:   err,
		}
	}

	var feeds []models.Feed
	for i, record := range records {
		if i == 0 {
			continue
		}
		if len(record) < 4 {
			l.logger.Error("CSV 레코드 %d번째 줄: 필드가 부족합니다 (필요: 4개, 실제: %d개)", i+1, len(record))
			continue
		}
		if strings.TrimSpace(record[1]) == "" {
			l.logger.Error("CSV 레코드 %d번째 줄: RSS URL이 비어있습니다", i+1)
			continue
		}
		feeds = append(feeds, models.Feed{
			Title:    strings.TrimSpace(record[0]),
			RSSUrl:   strings.TrimSpace(record[1]),
			Website:  strings.TrimSpace(record[2]),
			Category: strings.TrimSpace(record[3]),
		})
	}

	return feeds, nil
}