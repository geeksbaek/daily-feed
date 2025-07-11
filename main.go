package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jongyeol/daily-feed/internal/app"
)

func main() {
	// 플래그 정의
	feedsFile := flag.String("feeds", "feeds.csv", "RSS 피드 목록 파일 경로")
	geminiModel := flag.String("model", "gemini-2.5-pro", "Gemini 모델명")
	cutoffHours := flag.Int("cutoff", 24, "피드 수집 시간 범위 (시간)")
	httpTimeout := flag.Int("timeout", 15, "HTTP 요청 타임아웃 (초)")
	summaryPreset := flag.String("preset", "default", "요약 프리셋 (default, developer, casual, community)")
	debug := flag.Bool("debug", false, "디버그 모드 활성화 (Gemini API 파라미터 로그 출력)")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		cancel()
	}()

	application, err := app.New(*feedsFile, *geminiModel, *cutoffHours, *httpTimeout, *summaryPreset, *debug)
	if err != nil {
		log.Fatal(err)
	}

	if err := application.Run(ctx); err != nil {
		log.Fatal(err)
	}
}