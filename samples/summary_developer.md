# Daily Feed - 2025-07-10

## 🚀 Dev Daily Digest

오늘의 한 줄 요약: BigQuery의 제로샷 예측부터 스마트워치에 탑재된 Gemini까지, AI가 개발자의 모든 도구에 통합되고 있습니다.

## 💻 Tech Updates

### 🔧 New Tools & Frameworks
- **Google Cloud, Conversational Analytics API 공개**: 이제 개발자들은 Gemini 기반의 새로운 Conversational Analytics API를 사용하여 자연어-쿼리(NL2Query) 기능을 자체 애플리케이션에 통합할 수 있습니다 [^12]. 이 API는 BigQuery 및 Looker의 데이터를 SQL 작성 없이 일상적인 언어로 질문하여 분석하고, Python 코드 인터프리터를 통해 복잡한 통계 분석과 시각화까지 자동 생성합니다 [^12]. 현재 프리뷰 버전으로 제공됩니다 [^12].
- **BigQuery ML, TimesFM 시계열 예측 모델 탑재**: Google Cloud는 사전 훈련된 시계열 파운데이션 모델인 TimesFM을 BigQuery에 통합했습니다 [^5]. 개발자는 `AI.FORECAST`라는 간단한 SQL 함수 하나로 별도의 모델 훈련 없이 '제로샷' 예측을 수행할 수 있습니다 [^5]. 이 모델은 4,000억 개의 실제 시점을 학습했으며, 여러 시계열을 한 번에 예측하는 것도 가능합니다 [^5].
- **LangChain, 에이전트 구축 가이드 공개**: LangChain은 현실적인 작업 예제 선택부터 MVP 구축, 품질 및 안전성 테스트, 프로덕션 배포에 이르기까지 AI 에이전트를 구축하는 전체 과정을 다루는 상세 가이드를 블로그에 게시했습니다 [^6].

### 📦 Platform & Services
- **Gemini, Wear OS 스마트워치에 탑재**: Google의 AI 비서 Gemini가 Wear OS 4+가 설치된 스마트워치에 출시됩니다 [^14]. Pixel Watch, Samsung Galaxy Watch8 시리즈 등에서 "Hey Google"로 호출하거나 버튼을 길게 눌러 사용할 수 있으며, Gmail, Google Calendar 등과 연동하여 손목 위에서 바로 요약, 일정 추가, 메시지 전송 등의 작업을 수행할 수 있습니다 [^4][^14].
- **Circle to Search, AI 모드 및 게임 지원 추가**: 안드로이드의 Circle to Search 기능에 'AI 모드'가 추가되어, 이미지나 텍스트를 선택한 후 대화형으로 후속 질문을 이어가며 깊이 있는 정보를 탐색할 수 있게 됐습니다 [^2]. 또한, 이제 모바일 게임 플레이 중에 Circle to Search를 활성화하면 현재 게임 화면에 맞는 공략 팁이나 비디오를 즉시 찾아볼 수 있습니다 [^2][^4].
- **Pixel 9 Pro, Veo 3 탑재**: 새로운 Pixel Drop의 일환으로, Pixel 9 Pro 사용자는 1년 간 Google AI Pro 구독을 무료로 제공받으며, 여기에는 아이디어를 짧은 고품질 동영상으로 만들어주는 Veo 3가 포함됩니다 [^8].

### 🔒 Security & Performance
- **Apple, LLM KV 캐시 압축 기술 CommVQ 발표**: Apple 연구진이 LLM의 긴 컨텍스트 처리 시 메모리 병목 현상을 해결하기 위해 CommVQ(Commutative Vector Quantization) 기술을 제안했습니다 [^16]. 이는 경량 인코더와 코드북을 활용한 덧셈적 양자화(additive quantization)를 통해 KV 캐시를 크게 압축하고, 간단한 행렬 곱셈으로 디코딩하여 메모리 사용량을 대폭 줄입니다 [^16].
- **Apple, 차분 프라이버시 알고리즘 개선**: Apple은 적대적 밴딧(adversarial bandits) 문제에 대한 새로운 차분 프라이버시(differentially private) 알고리즘을 설계했습니다 [^7]. 이 알고리즘은 기존 기법보다 향상된 후회 상한(regret upper bound)을 보여주며, 중앙 집중식과 로컬 차분 프라이버시 간의 첫 번째 알려진 분리를 확립했습니다 [^7].

## 📚 Worth Reading
- **Apple, 웨어러블 행동 데이터 기반 건강 예측 모델 연구**: Apple은 16만 2천 명의 사용자로부터 수집한 25억 시간 분량의 웨어러블 데이터를 사용하여, 저수준 센서 데이터가 아닌 '행동' 데이터에 초점을 맞춘 파운데이션 모델을 개발했습니다 [^1]. 이 모델은 57개의 건강 관련 태스크에서 높은 성능을 보였으며, 특히 수면 예측과 같은 행동 기반 작업에서 뛰어난 결과를 나타냈습니다 [^1].
- **Lush, Google Cloud AI로 계산대 혁신 사례**: 코스메틱 브랜드 Lush는 Google Cloud의 Vertex AI와 Gemini를 활용하여 포장 없는 제품을 카메라로 즉시 인식하는 시스템을 구축했습니다 [^3]. 이를 통해 성수기 매장 대기 시간이 눈에 띄게 줄었으며(글래스고 매장 사례), 직원 교육 시간을 단축하고 물 사용량을 절약하는 등 지속가능성 목표에도 기여했습니다 [^3].

## 🎯 Quick Takeaway
BigQuery에서 `AI.FORECAST` 함수를 사용하면 단 한 줄의 SQL로 복잡한 시계열 예측을 수행할 수 있습니다. 예를 들어, 일일 사용자 수를 예측하려면 다음과 같이 쿼리하면 됩니다:
```sql
SELECT *
FROM
  AI.FORECAST(
    (SELECT date, daily_users FROM my_table),
    timestamp_col => 'date',
    data_col => 'daily_users'
  );
```
이는 인프라 관리나 모델 튜닝 없이 Google의 TimesFM 파운데이션 모델을 즉시 활용하는 가장 빠른 방법입니다 [^5].

[^1]: Beyond Sensor Data: Foundation Models of Behavioral Data from Wearables Improve Health Predictions - https://machinelearning.apple.com/research/beyond-sensor
[^2]: Bringing AI Mode to Circle to Search for follow-ups, and gaming help - https://blog.google/products/search/circle-to-search-ai-mode-gaming/
[^3]: How Lush and Google Cloud AI are reinventing retail checkout - https://blog.google/around-the-globe/google-europe/united-kingdom/how-lush-and-google-cloud-ai-are-reinventing-retail-checkout/
[^4]: 4 new AI updates on Android coming to Samsung Galaxy devices - https://blog.google/products/android/galaxy-unpacked-2025-android-updates/
[^5]: Zero-shot forecasting in BigQuery with the TimesFM foundation model - https://cloud.google.com/blog/products/data-analytics/bigquery-ml-timesfm-models-now-in-preview/
[^6]: How to Build an Agent - https://blog.langchain.com/how-to-build-an-agent/
[^7]: Faster Rates for Private Adversarial Bandits - https://machinelearning.apple.com/research/private-adversarial-bandits
[^8]: We've got a surprise Pixel Drop for you. - https://blog.google/products/pixel/pixel-drop-july-2025/
[^12]: How to tap into natural language AI services using the Conversational Analytics API - https://cloud.google.com/blog/products/business-intelligence/use-conversational-analytics-api-for-natural-language-ai/
[^14]: Gemini is coming to your Wear OS smartwatch - https://blog.google/products/wear-os/gemini-wear-os-watches/
[^16]: CommVQ: Commutative Vector Quantization for KV Cache Compression - https://machinelearning.apple.com/research/commutative-vector-quantization