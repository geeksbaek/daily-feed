package ai

import "testing"

func TestNormalizeBoldQuotes(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "single quotes",
			input:    "오늘의 뉴스는 **'기본으로의 회귀'**로 시작합니다.",
			expected: "오늘의 뉴스는 '**기본으로의 회귀**'로 시작합니다.",
		},
		{
			name:     "double quotes",
			input:    "헤드라인은 **\"기술의 양면성\"**입니다.",
			expected: "헤드라인은 \"**기술의 양면성**\"입니다.",
		},
		{
			name:     "korean corner quotes",
			input:    "오늘의 추천은 **「최신 도구 모음」**입니다.",
			expected: "오늘의 추천은 「**최신 도구 모음**」입니다.",
		},
		{
			name:     "already normalized",
			input:    "이미 정리된 '**제목**'은 그대로 둡니다.",
			expected: "이미 정리된 '**제목**'은 그대로 둡니다.",
		},
		{
			name:     "mixed without quotes",
			input:    "**굵게만** 사용된 경우 그대로 유지합니다.",
			expected: "**굵게만** 사용된 경우 그대로 유지합니다.",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := normalizeBoldQuotes(tc.input)
			if got != tc.expected {
				t.Errorf("normalizeBoldQuotes() = %q, want %q", got, tc.expected)
			}
		})
	}
}
