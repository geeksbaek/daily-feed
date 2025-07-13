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

// Atom 피드 구조체
type AtomFeed struct {
	Title    string      `xml:"title"`
	Subtitle string      `xml:"subtitle"`
	Link     []AtomLink  `xml:"link"`
	Entries  []AtomEntry `xml:"entry"`
}

type AtomLink struct {
	Href string `xml:"href,attr"`
	Rel  string `xml:"rel,attr"`
	Type string `xml:"type,attr"`
}

type AtomEntry struct {
	Title     string      `xml:"title"`
	Summary   string      `xml:"summary"`
	Content   AtomContent `xml:"content"`
	Link      []AtomLink  `xml:"link"`
	Published string      `xml:"published"`
	Updated   string      `xml:"updated"`
	ID        string      `xml:"id"`
}

type AtomContent struct {
	Type string `xml:"type,attr"`
	Text string `xml:",chardata"`
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
	Content      string
	SystemPrompt string
	UserPrompt   string
	Error        error
}
