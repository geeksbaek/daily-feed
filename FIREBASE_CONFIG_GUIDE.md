# Firebase 설정 보안 가이드

## 🔒 **보안성 이해**

### **안전한 정보 (공개 가능)**
- ✅ `apiKey`: 클라이언트 식별용, 비밀 키 아님
- ✅ `authDomain`, `projectId`: 프로젝트 식별용
- ✅ `messagingSenderId`, `appId`: 클라이언트 식별용  
- ✅ VAPID 키: 웹 푸시 공개 키

### **비공개 정보 (서버만)**
- ❌ Server Key: FCM 발송용, 절대 클라이언트 노출 금지
- ❌ Private Key: Firebase Admin SDK용

## 🛡️ **권장 설정 방법**

### **방법 1: 환경 변수 (권장)**

프로덕션 환경에서는 빌드 시 환경 변수 주입:

```html
<!-- index.html에 동적 주입 -->
<script>
  window.FIREBASE_CONFIG = {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}"
  };
  window.VAPID_KEY = "${VAPID_KEY}";
</script>
```

### **방법 2: 설정 API 엔드포인트**

```javascript
// config.js에서 API 호출
export const getFirebaseConfig = async () => {
  const response = await fetch('/api/config/firebase');
  return await response.json();
};
```

### **방법 3: 현재 방식 (개발용)**

하드코딩된 설정 사용 - 개발/테스트 환경에서는 문제없음

## 🔧 **설정 업데이트 방법**

### **1. 환경 변수로 설정**
```html
<!-- web/index.html에 추가 -->
<script>
  window.FIREBASE_CONFIG = {
    apiKey: "실제_API_키",
    authDomain: "daily-feed-notifications.firebaseapp.com",
    projectId: "daily-feed-notifications",
    storageBucket: "daily-feed-notifications.appspot.com",
    messagingSenderId: "실제_SENDER_ID",
    appId: "실제_APP_ID"
  };
</script>
```

### **2. config.js 직접 수정**
```javascript
// web/config.js
export const getFirebaseConfig = () => {
  return {
    apiKey: "실제_API_키",
    authDomain: "daily-feed-notifications.firebaseapp.com",
    projectId: "daily-feed-notifications", 
    storageBucket: "daily-feed-notifications.appspot.com",
    messagingSenderId: "실제_SENDER_ID",
    appId: "실제_APP_ID"
  };
};
```

### **3. 브라우저 콘솔에서 임시 설정**
```javascript
// 개발 시 브라우저 콘솔에서
window.FIREBASE_CONFIG = {
  apiKey: "실제_API_키",
  // ... 나머지 설정
};
```

## 🚀 **GitHub Actions 연동**

```yaml
# .github/workflows/deploy.yml
env:
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  FIREBASE_SENDER_ID: ${{ secrets.FIREBASE_SENDER_ID }}
  FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

steps:
  - name: Build with Firebase config
    run: |
      envsubst < web/index.template.html > web/index.html
```

## 📱 **현재 구현 상태**

- ✅ 환경 변수 우선 로드 구현
- ✅ 기본값 fallback 제공  
- ✅ 설정 검증 추가
- ✅ 안전한 기본 설정

**결론**: 현재 방식도 보안상 문제없지만, 더 깔끔한 관리를 위해 환경 변수 방식을 권장합니다.