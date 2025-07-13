package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/jongyeol/daily-feed/pkg/fcm"
)

func main() {
	var (
		serviceAccountFile = flag.String("service-account", "", "Firebase Service Account JSON 파일 경로")
		token             = flag.String("token", "", "FCM 토큰")
		topic             = flag.String("topic", "", "FCM 토픽 (토큰 대신 사용 가능)")
		title             = flag.String("title", "Daily Feed", "알림 제목")
		body              = flag.String("body", "새로운 기술 뉴스가 준비되었습니다!", "알림 내용")
		date              = flag.String("date", "", "날짜 (YYYY-MM-DD)")
		url               = flag.String("url", "/daily-feed/", "이동할 URL")
	)
	flag.Parse()

	// 기본값 설정
	if *date == "" {
		*date = time.Now().Format("2006-01-02")
	}
	
	if *url == "/daily-feed/" && *date != "" {
		*url = fmt.Sprintf("/daily-feed/?date=%s", *date)
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
		keyPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
		if keyPath == "" {
			log.Fatal("Service Account 키를 지정해주세요: --service-account 플래그 또는 FIREBASE_SERVICE_ACCOUNT_KEY 환경변수")
		}
		
		// 상대 경로면 절대 경로로 변환
		if !filepath.IsAbs(keyPath) {
			wd, _ := os.Getwd()
			keyPath = filepath.Join(wd, keyPath)
		}
		
		serviceAccountKey, err = os.ReadFile(keyPath)
		if err != nil {
			log.Fatalf("환경변수 Service Account 파일 읽기 실패: %v", err)
		}
	}

	// FCM 클라이언트 생성
	ctx := context.Background()
	client, err := fcm.NewClient(ctx, serviceAccountKey)
	if err != nil {
		log.Fatalf("FCM 클라이언트 생성 실패: %v", err)
	}

	// 알림 데이터 준비
	notificationData := fcm.NotificationData{
		Title: *title,
		Body:  *body,
		Date:  *date,
		URL:   *url,
	}

	// 알림 발송
	if *topic != "" {
		// 토픽으로 발송
		log.Printf("토픽 '%s'로 알림 발송 중...", *topic)
		err = client.SendToTopic(ctx, *topic, notificationData)
	} else if *token != "" {
		// 개별 토큰으로 발송
		log.Printf("토큰으로 알림 발송 중...")
		err = client.SendToToken(ctx, *token, notificationData)
	} else {
		log.Fatal("토큰(--token) 또는 토픽(--topic)을 지정해주세요")
	}

	if err != nil {
		log.Fatalf("알림 발송 실패: %v", err)
	}

	log.Println("✅ 알림 발송 완료!")
}