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
	configFile := flag.String("config", "config.json", "설정 파일 경로")
	summaryPreset := flag.String("preset", "", "요약 프리셋 (default, simple, executive, developer, casual)")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		cancel()
	}()

	application, err := app.New(*configFile, *summaryPreset)
	if err != nil {
		log.Fatal(err)
	}

	if err := application.Run(ctx); err != nil {
		log.Fatal(err)
	}
}