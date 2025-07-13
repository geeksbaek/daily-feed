package fcm

import (
	"context"
	"fmt"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

// Client FCM 클라이언트
type Client struct {
	messagingClient *messaging.Client
}

// NotificationData FCM 알림 데이터
type NotificationData struct {
	Title string `json:"title"`
	Body  string `json:"body"`
	Date  string `json:"date"`
	URL   string `json:"url"`
}

// NewClient Firebase FCM 클라이언트 생성
func NewClient(ctx context.Context, serviceAccountKey []byte) (*Client, error) {
	// Firebase 앱 초기화
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		projectID = "daily-feed-notifications" // 기본값
	}

	conf := &firebase.Config{
		ProjectID: projectID,
	}

	app, err := firebase.NewApp(ctx, conf, option.WithCredentialsJSON(serviceAccountKey))
	if err != nil {
		return nil, fmt.Errorf("Firebase 앱 초기화 실패: %w", err)
	}

	// Messaging 클라이언트 생성
	messagingClient, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("FCM 클라이언트 생성 실패: %w", err)
	}

	return &Client{
		messagingClient: messagingClient,
	}, nil
}

// SendToToken 특정 토큰으로 알림 발송
func (c *Client) SendToToken(ctx context.Context, token string, data NotificationData) error {
	message := &messaging.Message{
		Data: map[string]string{
			"date": data.Date,
			"url":  data.URL,
		},
		Notification: &messaging.Notification{
			Title: data.Title,
			Body:  data.Body,
		},
		Token: token,
		Android: &messaging.AndroidConfig{
			Priority: "high",
		},
		Webpush: &messaging.WebpushConfig{
			Notification: &messaging.WebpushNotification{
				Title: data.Title,
				Body:  data.Body,
				Icon:  "/icons/icon.svg",
				Badge: "/icons/icon.svg",
				Tag:   fmt.Sprintf("daily-feed-%s", data.Date),
				Data: map[string]interface{}{
					"date": data.Date,
					"url":  data.URL,
				},
			},
			FCMOptions: &messaging.WebpushFCMOptions{
				Link: data.URL,
			},
		},
	}

	response, err := c.messagingClient.Send(ctx, message)
	if err != nil {
		return fmt.Errorf("FCM 메시지 발송 실패: %w", err)
	}

	log.Printf("FCM 메시지 발송 성공: %s", response)
	return nil
}

// SendToTopic 토픽으로 알림 발송
func (c *Client) SendToTopic(ctx context.Context, topic string, data NotificationData) error {
	message := &messaging.Message{
		Data: map[string]string{
			"date": data.Date,
			"url":  data.URL,
		},
		Notification: &messaging.Notification{
			Title: data.Title,
			Body:  data.Body,
		},
		Topic: topic,
		Android: &messaging.AndroidConfig{
			Priority: "high",
		},
		Webpush: &messaging.WebpushConfig{
			Notification: &messaging.WebpushNotification{
				Title: data.Title,
				Body:  data.Body,
				Icon:  "/icons/icon.svg",
				Badge: "/icons/icon.svg",
				Tag:   fmt.Sprintf("daily-feed-%s", data.Date),
				Data: map[string]interface{}{
					"date": data.Date,
					"url":  data.URL,
				},
			},
			FCMOptions: &messaging.WebpushFCMOptions{
				Link: data.URL,
			},
		},
	}

	response, err := c.messagingClient.Send(ctx, message)
	if err != nil {
		return fmt.Errorf("토픽 메시지 발송 실패: %w", err)
	}

	log.Printf("토픽 메시지 발송 성공: %s", response)
	return nil
}


// SubscribeToTopic 토큰을 토픽에 구독
func (c *Client) SubscribeToTopic(ctx context.Context, tokens []string, topic string) error {
	response, err := c.messagingClient.SubscribeToTopic(ctx, tokens, topic)
	if err != nil {
		return fmt.Errorf("토픽 구독 실패: %w", err)
	}

	log.Printf("토픽 구독 완료: 성공 %d, 실패 %d", response.SuccessCount, response.FailureCount)
	return nil
}

// UnsubscribeFromTopic 토픽에서 구독 해제
func (c *Client) UnsubscribeFromTopic(ctx context.Context, tokens []string, topic string) error {
	response, err := c.messagingClient.UnsubscribeFromTopic(ctx, tokens, topic)
	if err != nil {
		return fmt.Errorf("토픽 구독 해제 실패: %w", err)
	}

	log.Printf("토픽 구독 해제 완료: 성공 %d, 실패 %d", response.SuccessCount, response.FailureCount)
	return nil
}
