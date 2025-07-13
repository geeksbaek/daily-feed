package utils

import (
	"strings"
)

func FixXMLEntities(bodyStr string) string {
	body := bodyStr
	body = strings.ReplaceAll(body, "&nbsp;", " ")
	body = strings.ReplaceAll(body, "&ldquo;", "\"")
	body = strings.ReplaceAll(body, "&rdquo;", "\"")
	body = strings.ReplaceAll(body, "&lsquo;", "'")
	body = strings.ReplaceAll(body, "&rsquo;", "'")
	body = strings.ReplaceAll(body, "&mdash;", "-")
	body = strings.ReplaceAll(body, "&ndash;", "-")
	return body
}

