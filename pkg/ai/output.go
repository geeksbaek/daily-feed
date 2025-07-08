package ai

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/models"
)

type OutputWriter interface {
	WriteMarkdown(items []models.FeedItem, summary *models.Summary) error
}

type markdownWriter struct {
	logger logger.Logger
}

func NewOutputWriter(logger logger.Logger) OutputWriter {
	return &markdownWriter{logger: logger}
}

func (w *markdownWriter) WriteMarkdown(items []models.FeedItem, summary *models.Summary) error {
	now := time.Now()
	filename := fmt.Sprintf("daily-feed-%s.md", now.Format("2006-01-02-15-04-05"))

	var content strings.Builder
	content.WriteString(fmt.Sprintf("# Daily Feed - %s\n\n", now.Format("2006-01-02")))

	if summary.Content != "" {
		content.WriteString(summary.Content)
	}

	err := os.WriteFile(filename, []byte(content.String()), 0644)
	if err != nil {
		return fmt.Errorf("파일 저장 실패: %w", err)
	}

	w.logger.Info("피드가 %s 파일로 저장되었습니다", filename)
	return nil
}