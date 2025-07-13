# Firebase Cloud Messaging 설정 가이드

## 🔥 **Firebase 프로젝트 설정**

### **1. Firebase Console에서 프로젝트 생성**
1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `daily-feed-notifications`
4. Google Analytics 비활성화 (선택사항)
5. 프로젝트 생성 완료

### **2. 웹 앱 추가**
1. Firebase 콘솔에서 "웹" 아이콘 클릭
2. 앱 닉네임: `Daily Feed Web`
3. Firebase Hosting 설정하지 않음
4. 앱 등록 완료

### **3. Firebase 설정 정보 복사**
생성된 설정 정보를 복사해두세요:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "daily-feed-notifications.firebaseapp.com",
  projectId: "daily-feed-notifications", 
  storageBucket: "daily-feed-notifications.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijk123456"
};
```

### **4. Cloud Messaging 설정**
1. Firebase 콘솔 → "프로젝트 설정" (⚙️ 아이콘)
2. "Cloud Messaging" 탭 클릭
3. "웹 구성" 섹션에서 "키 쌍 생성" 클릭
4. 생성된 VAPID 키 복사

## 🔧 **코드에 설정 적용**

### **1. Firebase 설정 업데이트**

`web/components/firebase-push-manager.js` 파일의 설정을 업데이트:

```javascript
// 실제 Firebase 설정으로 교체
this.firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "daily-feed-notifications.firebaseapp.com",
  projectId: "daily-feed-notifications",
  storageBucket: "daily-feed-notifications.appspot.com", 
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};

this.vapidKey = "YOUR_ACTUAL_VAPID_KEY";
```

### **2. Service Worker 설정 업데이트**

`web/firebase-messaging-sw.js` 파일의 설정도 동일하게 업데이트:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "daily-feed-notifications.firebaseapp.com", 
  projectId: "daily-feed-notifications",
  storageBucket: "daily-feed-notifications.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## 🚀 **테스트 방법**

### **1. 로컬 테스트**
```bash
cd web
python3 -m http.server 8081
```

브라우저에서 `http://localhost:8081` 접속 후:
1. 알림 토글 버튼 클릭
2. 권한 허용
3. 개발자 도구 콘솔에서 FCM 토큰 확인

### **2. Firebase Console에서 테스트 메시지 발송**
1. Firebase 콘솔 → "Cloud Messaging"
2. "첫 번째 캠페인 만들기" → "Firebase 알림 메시지"
3. 제목: "Daily Feed 테스트"
4. 텍스트: "Firebase FCM 테스트 메시지입니다"
5. "테스트 메시지 전송" → FCM 토큰 입력
6. "테스트" 클릭

### **3. 백엔드에서 프로그래밍 방식 발송**

Go 백엔드에서 FCM 메시지 발송:

```go
// Firebase Admin SDK 사용
import "firebase.google.com/go/v4/messaging"

func sendFCMNotification(token, title, body string) error {
    ctx := context.Background()
    
    message := &messaging.Message{
        Data: map[string]string{
            "date": "2025-07-13",
            "url": "/daily-feed/?date=2025-07-13",
        },
        Notification: &messaging.Notification{
            Title: title,
            Body:  body,
        },
        Token: token,
    }
    
    response, err := client.Send(ctx, message)
    if err != nil {
        return err
    }
    
    fmt.Println("FCM 메시지 발송 성공:", response)
    return nil
}
```

## 📱 **실제 동작 확인**

### **구독 상태 확인**
```javascript
console.log('FCM 구독 상태:', firebasePushManager.isSubscribed());
console.log('FCM 토큰:', localStorage.getItem('fcm-token'));
```

### **알림 수신 확인**
- **포그라운드**: 브라우저가 활성 상태일 때
- **백그라운드**: 브라우저가 백그라운드에 있을 때
- **모바일**: 모바일 브라우저에서도 동일하게 작동

## ⚠️ **주의사항**

### **보안**
- Firebase 설정 정보는 공개되어도 괜찮지만 Server Key는 비공개 유지
- 백엔드에서 FCM 발송 시 Firebase Admin SDK 사용 권장

### **브라우저 지원**
- ✅ Chrome, Firefox, Edge, Safari (iOS 16.4+)
- ✅ 모바일 브라우저 전체 지원
- ✅ PWA 설치 없이도 작동

### **HTTPS 필요**
- 프로덕션에서는 HTTPS 필수
- `localhost`에서는 HTTP도 가능

## 🎯 **다음 단계**

1. ✅ Firebase 프로젝트 생성
2. ✅ 설정 정보 코드에 적용  
3. ✅ 로컬에서 테스트
4. 📧 백엔드 FCM 발송 구현
5. 🚀 GitHub Actions 연동
6. 🌐 프로덕션 배포

Firebase 설정을 완료하시면 실제 푸시 알림이 작동합니다!