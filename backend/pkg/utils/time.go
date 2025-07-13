package utils

import (
	"fmt"
	"time"
)

func ParseDate(dateStr string) (time.Time, error) {
	formats := []string{
		time.RFC3339,     // Atom 피드 표준 형식 (2006-01-02T15:04:05Z07:00)
		time.RFC3339Nano, // Atom 피드 나노초 포함 형식
		time.RFC1123Z,    // RSS 피드 표준 형식
		time.RFC1123,
		time.RFC822Z,
		time.RFC822,
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05-07:00",
		"2006-01-02 15:04:05",
		"Mon, 02 Jan 2006 15:04:05 -0700",
		"Mon, 02 Jan 2006 15:04:05 MST",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("날짜 파싱 실패: %s", dateStr)
}
