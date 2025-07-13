package ai

import (
	"fmt"
	"strings"
	"time"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/models"
)

type OutputWriter interface {
	WriteMarkdown(items []models.FeedItem, summary *models.Summary) (string, error)
}

type markdownWriter struct {
	logger logger.Logger
}

func NewOutputWriter(logger logger.Logger) OutputWriter {
	return &markdownWriter{logger: logger}
}

func (w *markdownWriter) WriteMarkdown(items []models.FeedItem, summary *models.Summary) (string, error) {
	now := time.Now()

	var content strings.Builder
	content.WriteString(fmt.Sprintf("# Daily Feed - %s\n\n", now.Format("2006-01-02")))

	if summary.Content != "" {
		content.WriteString(summary.Content)
	}

	return content.String(), nil
}
