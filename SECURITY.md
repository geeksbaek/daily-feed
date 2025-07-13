# 보안 가이드

## 🔒 **민감한 정보 관리**

### **환경 변수 설정**

#### **필수 환경 변수**
```bash
# AI 요약을 위한 Gemini API 키
export GEMINI_API_KEY="your_gemini_api_key"

# FCM 푸시 알림을 위한 Firebase 서비스 계정 키 파일 경로
export FIREBASE_SERVICE_ACCOUNT_KEY="path/to/service-account.json"

# Firebase 프로젝트 ID (선택사항)
export FIREBASE_PROJECT_ID="daily-feed-notifications"
```

#### **개발 환경 설정 (.env 파일)**
```bash
# .env 파일 생성 (이 파일은 .gitignore에 포함됨)
cat > .env << EOF
GEMINI_API_KEY=your_actual_gemini_api_key
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
FIREBASE_PROJECT_ID=daily-feed-notifications
EOF
```

### **GitHub Secrets 설정**

#### **GitHub Actions에서 사용하는 Secrets**
1. `GEMINI_API_KEY`: Gemini API 키
2. `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase 서비스 계정 JSON 내용 전체

```bash
# GitHub 저장소 → Settings → Secrets and variables → Actions
# New repository secret 클릭하여 각각 추가
```

## 🛡️ **보안 체크리스트**

### **✅ 안전한 것들**
- Firebase 클라이언트 설정 (apiKey, authDomain, projectId 등)
- VAPID 공개 키
- 프로젝트 ID
- 도메인 이름

### **❌ 절대 노출 금지**
- Gemini API 키
- Firebase 서비스 계정 Private Key
- Firebase Server Key (FCM Admin SDK용)
- 개인정보 (이메일, 전화번호)
- 데이터베이스 연결 문자열

## 🔍 **보안 검사 방법**

### **자동 검사 스크립트**
```bash
#!/bin/bash
# 민감한 정보 하드코딩 검사

echo "🔍 민감한 정보 검사 중..."

# API 키 패턴 검사
grep -r "AIza" . --exclude-dir=.git --exclude="*.md" --exclude="SECURITY.md"
grep -r "sk-" . --exclude-dir=.git --exclude="*.md"
grep -r "pk_" . --exclude-dir=.git --exclude="*.md"

# 이메일 패턴 검사
grep -r "@gmail\|@kakao\|@naver" . --exclude-dir=.git --exclude="*.md"

# Firebase 서비스 계정 키 검사
grep -r "private_key_id\|private_key" . --exclude-dir=.git --exclude="*.md"

# 토큰 패턴 검사
grep -r "token.*:" . --exclude-dir=.git --exclude="*.md" | grep -v "localStorage\|test"

echo "✅ 검사 완료"
```

### **정기 검사**
```bash
# pre-commit hook으로 설정
#!/bin/sh
# .git/hooks/pre-commit

if grep -r "AIza\|sk-\|pk_" . --exclude-dir=.git --exclude="*.md"; then
    echo "❌ 민감한 정보가 감지되었습니다. 커밋을 중단합니다."
    exit 1
fi
```

## 🚨 **보안 사고 대응**

### **API 키 노출 시 대응**
1. **즉시 키 무효화**
   - Google Cloud Console에서 Gemini API 키 삭제
   - Firebase Console에서 서비스 계정 키 삭제

2. **새 키 생성 및 배포**
   - 새로운 API 키 생성
   - GitHub Secrets 업데이트
   - 프로덕션 환경 재배포

3. **Git 히스토리 정리**
   ```bash
   # 민감한 정보가 포함된 커밋 제거
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/sensitive/file' \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📋 **추가 보안 권장사항**

### **코드 레벨**
- 환경 변수가 없을 때 명확한 에러 메시지 제공
- 로그에 민감한 정보 출력 금지
- 디버그 모드에서도 민감한 정보 노출 금지

### **인프라 레벨**
- HTTPS 강제 사용
- CORS 정책 적절히 설정
- Firebase Rules 적절히 구성
- 정기적인 의존성 업데이트

### **운영 레벨**
- 접근 권한 최소화 원칙
- 정기적인 키 순환
- 모니터링 및 알람 설정
- 백업 및 복구 계획 수립

이 가이드를 따라 안전하게 Daily Feed 서비스를 운영하세요! 🛡️