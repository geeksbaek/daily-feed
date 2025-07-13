# Firebase FCM GitHub Actions 설정 가이드

## 🔑 **Firebase Service Account 키 생성**

### **1. Firebase Console에서 Service Account 키 생성**
1. https://console.firebase.google.com 접속
2. **daily-feed-notifications** 프로젝트 선택
3. ⚙️ **프로젝트 설정** → **서비스 계정** 탭
4. **새 비공개 키 생성** 클릭
5. **JSON** 선택 후 **키 생성**
6. 다운로드된 JSON 파일 내용을 복사

### **2. GitHub Secrets 설정**
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
4. **Secret**: 복사한 JSON 내용 전체 붙여넣기
5. **Add secret** 클릭

## 🚀 **GitHub Actions Workflows**

### **독립적인 FCM 알림 발송**
- **파일**: `.github/workflows/fcm-notification.yml`
- **용도**: 수동으로 FCM 알림 발송 또는 다른 workflow에서 호출

**수동 실행 방법:**
1. GitHub 저장소 → **Actions** 탭
2. **FCM Push Notification** workflow 선택
3. **Run workflow** 클릭
4. 매개변수 입력:
   - **title**: 알림 제목 (기본값: "Daily Feed")
   - **body**: 알림 내용 (기본값: "새로운 기술 뉴스가 준비되었습니다!")
   - **date**: 날짜 (기본값: 오늘)
   - **topic**: 토픽 (기본값: "all_users")
   - **test_token**: 테스트용 개별 토큰 (선택사항)

### **자동화된 Daily Feed + FCM 알림**
- **파일**: `.github/workflows/daily-feed.yml`
- **용도**: 매일 오전 7시 자동 실행, 새 데이터 생성 시 FCM 알림 발송

**동작 과정:**
1. RSS 피드 수집 및 AI 요약 생성
2. 새로운 데이터가 있으면 커밋 및 푸시
3. 성공 시 FCM 알림 자동 발송 (토픽: "all_users")

## 🧪 **테스트 방법**

### **1. 개별 토큰으로 테스트**
```bash
# 로컬에서 테스트
cd backend
export FIREBASE_SERVICE_ACCOUNT_KEY="path/to/service-account.json"
go run cmd/fcm-send/main.go \
  --token "YOUR_FCM_TOKEN" \
  --title "테스트 알림" \
  --body "Firebase FCM 테스트입니다!"
```

### **2. GitHub Actions에서 테스트**
1. Actions → FCM Push Notification
2. Run workflow 클릭
3. **test_token**에 브라우저에서 획득한 FCM 토큰 입력
4. 다른 매개변수 설정 후 실행

### **3. 토픽 구독 확인**
브라우저 콘솔에서:
```javascript
// 현재 FCM 토큰 확인
console.log('FCM 토큰:', localStorage.getItem('fcm-token'));

// 토픽 구독 (현재는 클라이언트 측에서 수동 구독 필요)
// 향후 백엔드 API로 자동화 가능
```

## 📱 **토픽 관리**

### **기본 토픽**
- **all_users**: 모든 사용자 (기본값)
- **daily_feed**: Daily Feed 관련 알림
- **tech_news**: 기술 뉴스 알림

### **토픽 구독/해제** (향후 구현)
```go
// 백엔드에서 토큰을 토픽에 구독
client.SubscribeToTopic(ctx, []string{token}, "all_users")

// 구독 해제
client.UnsubscribeFromTopic(ctx, []string{token}, "all_users")
```

## 🔧 **Workflow 커스터마이징**

### **알림 내용 변경**
`.github/workflows/daily-feed.yml` 파일에서:
```yaml
with:
  title: "🗞️ Daily Feed"
  body: "새로운 기술 뉴스 요약이 준비되었습니다!"
  topic: "all_users"
```

### **발송 조건 변경**
```yaml
# 매일 발송 (변경사항 없어도)
if: always()

# 특정 요일만 발송
if: needs.generate-feeds.outputs.changes == 'true' && contains('1,3,5', strftime('%w'))
```

## ⚠️ **주의사항**

### **보안**
- ✅ Service Account 키는 GitHub Secrets에 안전하게 저장
- ✅ 클라이언트 Firebase 설정은 공개되어도 안전
- ❌ Server Key나 Private Key는 절대 노출 금지

### **권한**
- FCM 메시지 발송: Firebase Admin SDK 권한 필요
- GitHub Actions: `secrets: inherit` 로 Secret 전달

### **할당량**
- Firebase FCM: 무료 계정 기준 무제한 (Google 정책 변경 가능)
- GitHub Actions: 퍼블릭 저장소 무제한, 프라이빗 월 2000분

## 🎯 **다음 단계**

1. ✅ Firebase Service Account 키 GitHub Secrets 등록
2. ✅ FCM 알림 workflow 테스트
3. 📧 백엔드에 FCM 토큰 관리 API 추가
4. 🔔 토픽 구독/해제 기능 구현
5. 📊 알림 전송 로그 및 분석 추가

이제 GitHub Actions에서 자동으로 푸시 알림을 발송할 수 있습니다!