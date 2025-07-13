package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jongyeol/daily-feed/pkg/fcm"
)

type SubscribeRequest struct {
	Token string `json:"token"`
	Topic string `json:"topic"`
}

type SubscribeResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// FCM 클라이언트 초기화
	serviceAccountKey := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
	if serviceAccountKey == "" {
		log.Fatal("FIREBASE_SERVICE_ACCOUNT_KEY 환경변수가 필요합니다")
	}

	fcmClient, err := fcm.NewClient(context.Background(), []byte(serviceAccountKey))
	if err != nil {
		log.Fatalf("FCM 클라이언트 초기화 실패: %v", err)
	}

	// CORS 미들웨어
	corsHandler := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// FCM 구독 엔드포인트
	http.Handle("/api/fcm/subscribe", corsHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req SubscribeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if req.Token == "" {
			http.Error(w, "Token is required", http.StatusBadRequest)
			return
		}

		if req.Topic == "" {
			req.Topic = "daily-feed"
		}

		// FCM 토픽에 구독
		tokens := []string{req.Token}
		err := fcmClient.SubscribeToTopic(context.Background(), tokens, req.Topic)
		
		response := SubscribeResponse{
			Success: err == nil,
		}

		if err != nil {
			log.Printf("FCM 토픽 구독 실패: %v", err)
			response.Message = "구독 실패: " + err.Error()
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			log.Printf("FCM 토픽 구독 성공: 토큰=%s, 토픽=%s", req.Token[:20]+"...", req.Topic)
			response.Message = "토픽 구독 완료"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// FCM 구독 해제 엔드포인트
	http.Handle("/api/fcm/unsubscribe", corsHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req SubscribeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if req.Token == "" {
			http.Error(w, "Token is required", http.StatusBadRequest)
			return
		}

		if req.Topic == "" {
			req.Topic = "daily-feed"
		}

		// FCM 토픽에서 구독 해제
		tokens := []string{req.Token}
		err := fcmClient.UnsubscribeFromTopic(context.Background(), tokens, req.Topic)
		
		response := SubscribeResponse{
			Success: err == nil,
		}

		if err != nil {
			log.Printf("FCM 토픽 구독 해제 실패: %v", err)
			response.Message = "구독 해제 실패: " + err.Error()
			w.WriteHeader(http.StatusInternalServerError)
		} else {
			log.Printf("FCM 토픽 구독 해제 성공: 토큰=%s, 토픽=%s", req.Token[:20]+"...", req.Topic)
			response.Message = "토픽 구독 해제 완료"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// 헬스체크 엔드포인트
	http.Handle("/health", corsHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "healthy",
			"service": "fcm-api"
		})
	})))

	log.Printf("FCM API 서버 시작: http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}