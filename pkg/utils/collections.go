package utils

import (
	"iter"
	"maps"

	"github.com/jongyeol/daily-feed/pkg/models"
)

func FeedItemIterator(items []models.FeedItem) iter.Seq[models.FeedItem] {
	return func(yield func(models.FeedItem) bool) {
		for _, item := range items {
			if !yield(item) {
				return
			}
		}
	}
}

func URLIterator(items []models.FeedItem) iter.Seq[string] {
	return func(yield func(string) bool) {
		for _, item := range items {
			if item.Link != "" {
				if !yield(item.Link) {
					return
				}
			}
		}
	}
}

func RemoveDuplicateURLs(urls []string, maxCount int) []string {
	urlMap := make(map[string]bool, len(urls))

	for _, url := range urls {
		urlMap[url] = true
	}

	var result []string
	count := 0
	for url := range maps.All(urlMap) {
		result = append(result, url)
		count++
		if count >= maxCount {
			break
		}
	}

	return result
}