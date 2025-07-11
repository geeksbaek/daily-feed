package config

import (
	"fmt"
)

type Config struct {
	FeedsFile      string `json:"feeds_file"`
	GeminiModel    string `json:"gemini_model"`
	CutoffHours    int    `json:"cutoff_hours"`
	HTTPTimeout    int    `json:"http_timeout_seconds"`
	SummaryPreset  string `json:"summary_preset"`
	Debug          bool   `json:"debug"`
}

// Load 함수는 더 이상 사용하지 않음 - 모든 설정이 플래그로 전달됨

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
	if c.SummaryPreset == "" {
		return fmt.Errorf("summary_preset이 설정되지 않았습니다")
	}
	validPresets := []string{"default", "developer", "casual", "community"}
	isValid := false
	for _, preset := range validPresets {
		if c.SummaryPreset == preset {
			isValid = true
			break
		}
	}
	if !isValid {
		return fmt.Errorf("summary_preset은 다음 중 하나여야 합니다: %v", validPresets)
	}
	return nil
}