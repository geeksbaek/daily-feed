package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	FeedsFile   string `json:"feeds_file"`
	GeminiModel string `json:"gemini_model"`
	CutoffHours int    `json:"cutoff_hours"`
	HTTPTimeout int    `json:"http_timeout_seconds"`
}

func Load(filename string) (*Config, error) {
	cfg := &Config{
		FeedsFile:   "feeds.csv",
		GeminiModel: "gemini-2.5-pro",
		CutoffHours: 24,
		HTTPTimeout: 15,
	}

	if _, err := os.Stat(filename); os.IsNotExist(err) {
		return cfg, nil
	}

	file, err := os.Open(filename)
	if err != nil {
		return nil, fmt.Errorf("설정 파일 열기 실패: %w", err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	if err := decoder.Decode(cfg); err != nil {
		return nil, fmt.Errorf("설정 파일 파싱 실패: %w", err)
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.FeedsFile == "" {
		return fmt.Errorf("feeds_file이 설정되지 않았습니다")
	}
	if c.GeminiModel == "" {
		return fmt.Errorf("gemini_model이 설정되지 않았습니다")
	}
	if c.CutoffHours <= 0 {
		return fmt.Errorf("cutoff_hours는 0보다 커야 합니다")
	}
	if c.HTTPTimeout <= 0 {
		return fmt.Errorf("http_timeout_seconds는 0보다 커야 합니다")
	}
	return nil
}