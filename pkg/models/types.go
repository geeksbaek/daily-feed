package models

import "time"

type Feed struct {
	Title    string
	RSSUrl   string
	Website  string
	Category string
}

type RSS struct {
	Channel Channel `xml:"channel"`
}

type Channel struct {
	Title       string `xml:"title"`
	Description string `xml:"description"`
	Link        string `xml:"link"`
	Items       []Item `xml:"item"`
}

type Item struct {
	Title       string `xml:"title"`
	Description string `xml:"description"`
	Link        string `xml:"link"`
	PubDate     string `xml:"pubDate"`
	GUID        string `xml:"guid"`
}

type FeedItem struct {
	Title       string
	Link        string
	PubDate     time.Time
	Description string
	Category    string
	Source      string
}

type Summary struct {
	Content string
	Error   error
}