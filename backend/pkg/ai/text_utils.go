package ai

import (
	"fmt"
	"regexp"
)

// normalizeBoldQuotes moves quotation marks outside bold markers to prevent Markdown rendering issues
// like **"title"**. For supported quote pairs, it rewrites them to "**title**".
func normalizeBoldQuotes(text string) string {
	quotePairs := []struct {
		open  string
		close string
	}{
		{"'", "'"},
		{"\"", "\""},
		{"“", "”"},
		{"‘", "’"},
		{"「", "」"},
		{"『", "』"},
		{"‹", "›"},
		{"«", "»"},
	}

	normalized := text
	for _, pair := range quotePairs {
		pattern := regexp.MustCompile(fmt.Sprintf(`\*\*%s(.*?)%s\*\*`, regexp.QuoteMeta(pair.open), regexp.QuoteMeta(pair.close)))
		normalized = pattern.ReplaceAllString(normalized, pair.open+"**$1**"+pair.close)
	}

	return normalized
}
