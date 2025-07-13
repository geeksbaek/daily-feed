package app

import (
	"context"
	"fmt"
	"os"
	"time"

	"google.golang.org/genai"

	"github.com/jongyeol/daily-feed/internal/logger"
	"github.com/jongyeol/daily-feed/pkg/ai"
	"github.com/jongyeol/daily-feed/pkg/config"
	"github.com/jongyeol/daily-feed/pkg/feed"
	"github.com/jongyeol/daily-feed/pkg/models"
)

type App struct {
	config       *config.Config
	logger       logger.Logger
	feedLoader   feed.Loader
	processor    feed.Processor
	summarizer   ai.Summarizer
	outputWriter ai.OutputWriter
}

func New(feedsFile, geminiModel string, cutoffHours, httpTimeout int, summaryPreset string, debug bool) (*App, error) {
	logger := logger.New()

	// Config 구조체 직접 생성
	cfg := &config.Config{
		FeedsFile:     feedsFile,
		GeminiModel:   geminiModel,
		CutoffHours:   cutoffHours,
		HTTPTimeout:   httpTimeout,
		SummaryPreset: summaryPreset,
		Debug:         debug,
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("설정 검증 실패: %w", err)
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY 환경변수가 설정되지 않았습니다")
	}

	ctx := context.Background()
	geminiClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("Gemini 클라이언트 초기화 실패: %w", err)
	}

	logger.Info("설정 로드 완료: feeds_file=%s, gemini_model=%s, cutoff_hours=%d, http_timeout=%d, summary_preset=%s",
		cfg.FeedsFile, cfg.GeminiModel, cfg.CutoffHours, cfg.HTTPTimeout, cfg.SummaryPreset)

	return &App{
		config:       cfg,
		logger:       logger,
		feedLoader:   feed.NewLoader(logger),
		processor:    feed.NewProcessor(cfg, logger),
		summarizer:   ai.NewSummarizer(geminiClient, cfg, logger),
		outputWriter: ai.NewOutputWriter(logger),
	}, nil
}

func (a *App) Run(ctx context.Context) error {
	feeds, err := a.feedLoader.LoadFeeds(a.config.FeedsFile)
	if err != nil {
		return fmt.Errorf("feeds 파일을 읽는 중 오류: %w", err)
	}

	cutoffTime := time.Now().Add(-time.Duration(a.config.CutoffHours) * time.Hour)

	allItems, err := a.processor.ProcessFeeds(ctx, feeds, cutoffTime)
	if err != nil {
		return fmt.Errorf("피드 처리 중 오류: %w", err)
	}

	if len(allItems) == 0 {
		a.logger.Info("최근 %d시간 내 새로운 피드가 없습니다", a.config.CutoffHours)
		return nil
	}

	a.logger.Info("AI 요약을 생성하고 있습니다...")
	summary, err := a.summarizer.GenerateSummary(ctx, allItems)
	if err != nil {
		return fmt.Errorf("AI 요약 생성 실패: %w", err)
	}

	if summary.Error != nil {
		a.logger.Error("AI 요약 생성 중 오류: %v", summary.Error)
	}

	output, err := a.outputWriter.WriteMarkdown(allItems, summary)
	if err != nil {
		return fmt.Errorf("출력 생성 실패: %w", err)
	}

	fmt.Print(output)
	return nil
}

// RunAndReturnData는 JSON 생성을 위해 요약과 아이템 데이터를 반환하는 함수
func (a *App) RunAndReturnData(ctx context.Context) (string, string, string, []models.FeedItem, error) {
	feeds, err := a.feedLoader.LoadFeeds(a.config.FeedsFile)
	if err != nil {
		return "", "", "", nil, fmt.Errorf("feeds 파일을 읽는 중 오류: %w", err)
	}

	cutoffTime := time.Now().Add(-time.Duration(a.config.CutoffHours) * time.Hour)

	allItems, err := a.processor.ProcessFeeds(ctx, feeds, cutoffTime)
	if err != nil {
		return "", "", "", nil, fmt.Errorf("피드 처리 중 오류: %w", err)
	}

	if len(allItems) == 0 {
		a.logger.Info("최근 %d시간 내 새로운 피드가 없습니다", a.config.CutoffHours)
		return "", "", "", nil, nil
	}

	a.logger.Info("AI 요약을 생성하고 있습니다...")
	summary, err := a.summarizer.GenerateSummary(ctx, allItems)
	if err != nil {
		return "", "", "", allItems, fmt.Errorf("AI 요약 생성 실패: %w", err)
	}

	if summary.Error != nil {
		a.logger.Error("AI 요약 생성 중 오류: %v", summary.Error)
		return "", "", "", allItems, summary.Error
	}

	return summary.Content, summary.SystemPrompt, summary.UserPrompt, allItems, nil
}
