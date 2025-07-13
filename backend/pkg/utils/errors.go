package utils

import "fmt"

type FeedError struct {
	FeedTitle string
	Operation string
	Err       error
}

func (e *FeedError) Error() string {
	return fmt.Sprintf("피드 %s %s 실패: %v", e.FeedTitle, e.Operation, e.Err)
}

func (e *FeedError) Unwrap() error {
	return e.Err
}

type ConfigError struct {
	Field string
	Err   error
}

func (e *ConfigError) Error() string {
	return fmt.Sprintf("설정 오류 (%s): %v", e.Field, e.Err)
}

func (e *ConfigError) Unwrap() error {
	return e.Err
}

type AIError struct {
	Operation string
	Err       error
}

func (e *AIError) Error() string {
	return fmt.Sprintf("AI %s 실패: %v", e.Operation, e.Err)
}

func (e *AIError) Unwrap() error {
	return e.Err
}
