package utils

import (
	"iter"

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
