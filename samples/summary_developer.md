# Daily Feed - 2025-07-10

## 🚀 Dev Daily Digest

Google BigQuery, 이제 SQL 한 줄로 제로샷 시계열 예측이 가능해집니다. [^2]

## 💻 Tech Updates

### 🔧 New Tools & Frameworks
- **Google BigQuery, TimesFM 모델 통합**: Google Research가 개발한 시계열 파운데이션 모델 `TimesFM`이 BigQuery에 내장되었습니다. [^2] 이제 `AI.FORECAST` 함수를 사용하여 별도의 모델 훈련 없이 SQL 쿼리만으로 제로샷(zero-shot) 시계열 예측을 수행할 수 있습니다. [^2] 이 기능은 4,000억 개의 실제 시계열 데이터로 사전 훈련된 5억 파라미터 모델을 기반으로 하며, 여러 시계열 데이터를 한 번에 처리하는 것도 지원합니다. [^2]
- **LangChain, 에이전트 빌드 가이드 공개**: LangChain이 프로덕션 환경에서 LLM 에이전트를 구축하는 방법에 대한 포괄적인 가이드를 발표했습니다. [^5] 이 가이드는 현실적인 작업 예제 선택부터 MVP 구축, 품질 및 안전성 테스트, 최종 배포까지 전 과정을 다룹니다. [^5]

### 📦 Platform & Services
- **Google Cloud, Conversational Analytics API 프리뷰 출시**: 자연어를 사용해 BigQuery나 Looker 데이터에 직접 질문할 수 있는 `Conversational Analytics API`가 프리뷰로 공개되었습니다. [^1] 이 API는 Gemini 기반의 NL2Query(자연어-쿼리 변환) 엔진과 Python 코드 인터프리터를 내장하여, 복잡한 SQL 작성 없이 데이터 조회, 고급 분석 및 시각화 생성이 가능합니다. [^1]
- **Gemini, Wear OS 탑재**: Google의 AI 비서 Gemini가 Wear OS 4+가 설치된 스마트워치에 탑재됩니다. [^3] 이제 스마트워치에서 "Hey Google" 호출을 통해 Gmail 요약, 캘린더 일정 추가, 자연어 질문 등 복합적인 작업을 휴대폰 없이 처리할 수 있습니다. [^3]

### 🔒 Security & Performance
- **Apple, LLM KV 캐시 압축 기술 'CommVQ' 발표**: Apple 연구원들이 긴 컨텍스트를 사용하는 LLM의 GPU 메모리 병목 현상을 해결하기 위해 새로운 KV 캐시 압축 기술인 `Commutative Vector Quantization (CommVQ)`를 제안했습니다. [^4] 이 기술은 경량 인코더와 코드북을 활용한 덧셈적 양자화(additive quantization)를 통해 메모리 사용량을 크게 줄이면서, 간단한 행렬 곱셈으로 디코딩이 가능하도록 설계되었습니다. [^4]
- **Apple, 'Shielded Diffusion'으로 이미지 생성 다양성 확보**: 텍스트-이미지 변환 모델의 문제점인 생성 이미지의 다양성 부족과 훈련 데이터셋의 이미지 복제 경향을 해결하기 위한 `Shielded Diffusion` 기술이 공개되었습니다. [^6] 이 방법은 기존에 훈련된 확산 모델의 샘플링 과정에 '반발 항(repellency terms)'을 추가하여, 참조 데이터셋 외부의 새롭고 다양한 이미지를 생성하도록 유도합니다. [^6]

## 📚 Worth Reading
- **How to Build an Agent (LangChain Blog)**: LLM 기반 에이전트 개발의 전 과정을 다루는 실용적인 가이드입니다. [^5] 아이디어 구상부터 프로덕션 배포 및 모니터링까지, 개발자가 겪을 수 있는 문제와 해결책을 단계별로 제시하여 바로 실무에 적용해볼 수 있습니다. [^5]
- **Zero-shot forecasting in BigQuery with the TimesFM foundation model (Google Cloud Blog)**: BigQuery에 새로 추가된 `AI.FORECAST` 함수의 기술적 배경과 활용법을 소개합니다. [^2] 간단한 SQL 예제를 통해 단일 및 다중 시계열 데이터를 예측하는 방법을 보여주며, 기존 ARIMA 모델과의 차이점도 설명합니다. [^2]

## 🎯 Quick Takeaway
오늘의 가장 유용한 개발 팁은 BigQuery의 새로운 `AI.FORECAST` 함수입니다. [^2] 단 한 줄의 SQL로 별도 훈련 없이 시계열 예측을 할 수 있어, 복잡한 설정이나 MLOps 파이프라인 없이도 데이터 분석 및 비즈니스 계획 수립에 즉시 활용할 수 있습니다. [^2]

```sql
SELECT *
FROM
  AI.FORECAST(
    (
      SELECT TIMESTAMP_TRUNC(start_date, DAY) AS trip_date, COUNT(*) AS num_trips
      FROM `bigquery-public-data.san_francisco_bikeshare.bikeshare_trips`
      GROUP BY 1
    ),
    timestamp_col => 'trip_date',
    data_col => 'num_trips');
```
---
[^1]: How to tap into natural language AI services using the Conversational Analytics API - https://cloud.google.com/blog/products/business-intelligence/use-conversational-analytics-api-for-natural-language-ai/
[^2]: Zero-shot forecasting in BigQuery with the TimesFM foundation model - https://cloud.google.com/blog/products/data-analytics/bigquery-ml-timesfm-models-now-in-preview/
[^3]: Gemini is coming to your Wear OS smartwatch - https://blog.google/products/wear-os/gemini-wear-os-watches/
[^4]: CommVQ: Commutative Vector Quantization for KV Cache Compression - https://machinelearning.apple.com/research/commutative-vector-quantization
[^5]: How to Build an Agent - https://blog.langchain.com/how-to-build-an-agent/
[^6]: Shielded Diffusion: Generating Novel and Diverse Images using Sparse Repellency - https://machinelearning.apple.com/research/diffusion