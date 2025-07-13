package main

import (
	"context"
	"flag"
	"log"
	"os"

	"github.com/jongyeol/daily-feed/pkg/fcm"
)

func main() {
	var (
		serviceAccountFile = flag.String("service-account", "", "Firebase Service Account JSON 파일 경로")
		token             = flag.String("token", "", "FCM 토큰")
		topic             = flag.String("topic", "daily-feed", "구독할 토픽")
		unsubscribe       = flag.Bool("unsubscribe", false, "토픽에서 구독 해제")
	)
	flag.Parse()

	if *token == "" {
		log.Fatal("FCM 토큰을 지정해주세요: --token")
	}

	// Service Account 키 로드
	var serviceAccountKey []byte
	var err error

	if *serviceAccountFile != "" {
		serviceAccountKey, err = os.ReadFile(*serviceAccountFile)
		if err != nil {
			log.Fatalf("Service Account 파일 읽기 실패: %v", err)
		}
	} else {
		// 환경 변수에서 키 로드
		keyData := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
		if keyData == "" {
			log.Fatal("Service Account 키를 지정해주세요: --service-account 플래그 또는 FIREBASE_SERVICE_ACCOUNT_KEY 환경변수")
		}
		serviceAccountKey = []byte(keyData)
	}

	// FCM 클라이언트 생성
	ctx := context.Background()
	client, err := fcm.NewClient(ctx, serviceAccountKey)
	if err != nil {
		log.Fatalf("FCM 클라이언트 생성 실패: %v", err)
	}

	// 토픽 구독/해제
	tokens := []string{*token}
	
	if *unsubscribe {
		log.Printf("토픽 '%s'에서 구독 해제 중...", *topic)
		err = client.UnsubscribeFromTopic(ctx, tokens, *topic)
		if err != nil {
			log.Fatalf("토픽 구독 해제 실패: %v", err)
		}
		log.Println("✅ 토픽 구독 해제 완료!")
	} else {
		log.Printf("토픽 '%s'에 구독 중...", *topic)
		err = client.SubscribeToTopic(ctx, tokens, *topic)
		if err != nil {
			log.Fatalf("토픽 구독 실패: %v", err)
		}
		log.Println("✅ 토픽 구독 완료!")
	}
}