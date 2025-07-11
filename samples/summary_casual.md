# Daily Feed - 2025-07-11

## 🗞️ 오늘 재미있던 기술 소식

xAI가 'Grok 4'를 내놓으면서 "우리가 이제 최고"라고 선언했어요. [^11] [^12] 진짜 AI 왕좌의 게임이 시작된 느낌이랄까? 벤치마크 점수로는 기존 강자들을 제쳤다고 하니, 앞으로 판도가 어떻게 바뀔지 너무 궁금하네요.

## 📰 주목할 만한 이야기들

### 🏢 기업들 근황
- **xAI [^11][^12]:** 완전히 작정하고 나왔어요, Grok 4! 주요 성능 지표에서 OpenAI[^11]나 Google[^11] 모델을 앞섰다고 발표하면서 시장에 충격을 줬습니다. 특히 추론 능력이 엄청나다고 하는데, 이제는 정말 똑똑한 AI를 넘어 '지혜로운' AI를 기대해야 하나 봐요.
- **Apple [^1][^3][^16]:** 애플은 조용히 논문으로 실력을 증명하고 있어요. LLM을 아이폰 같은 기기에서 더 빠르고 효율적으로 돌리는 기술(QuantSpec)[^1]부터, 웨어러블 데이터로 건강 예측을 더 정확하게 하는 모델[^3], 그리고 AI가 만든 이미지가 특정 이미지를 베끼지 않고 더 다양하게 만들도록 하는 기술(Shielded Diffusion)[^16]까지, 내실을 다지는 모습이 인상적이에요.
- **AWS [^4][^5]:** 개발자들을 위한 AI 개발 놀이터를 계속 확장하고 있습니다. 이제 아마존 세이지메이커(Amazon SageMaker)[^4]에서 복잡한 AI 실험 과정을 쉽게 관리하고(MLflow 3.0)[^4], 만든 모델을 하이퍼파드(HyperPod)라는 고성능 인프라에 바로 배포까지 할 수 있게 됐어요.[^5] 개발부터 배포까지 한 번에 쭉 이어지게 만들어서 개발자들 시간을 아껴주려는 노력이 엿보여요.
- **Docker [^18]:** "이제 AI 에이전트도 `docker compose up` 하나로 끝!"이라고 외치는 것 같아요. 복잡한 AI 에이전트 시스템을 도커 컴포즈(Docker Compose) 파일 하나로 간단하게 정의하고 실행할 수 있게 됐습니다.[^18] 로컬 컴퓨터에서 작업이 버거우면 클라우드 GPU를 빌려 쓰는 '도커 오프로드(Docker Offload)' 기능까지 선보였어요.[^18] AI 개발의 복잡함을 도커가 또 한 번 해결해주려나 봐요.
- **Google [^17][^8]:** 구글은 AI를 더 재밌고 의미 있는 방향으로 활용하는 데 집중하는 모습이에요. 제미나이(Gemini) 앱에서 사진을 올리면 8초짜리 영상으로 만들어주는 기능이 새로 나왔고[^17], AI를 이용해서 사라져가는 소수 언어 30개를 배울 수 있는 '울라루(Woolaroo)' 프로젝트도 업데이트했어요.[^8] 기술로 이런 걸 할 수 있다니, 정말 멋지지 않나요?

### 🚀 눈에 띄는 기술
- **Grok 4 [^11][^12]:** 이건 정말 괴물 스펙이에요. 한 번에 처리할 수 있는 데이터 양(컨텍스트 윈도우)이 256k 토큰에 달하고, 글자뿐만 아니라 이미지도 이해할 수 있다고 해요.[^11] 가격은 좀 비싸지만, 성능만큼은 확실히 보여주려는 것 같아요.
- **NativeMind [^7]:** 내 모든 대화가 클라우드로 가지 않고 내 컴퓨터 안에서만 처리되는 AI 비서가 나왔어요. '네이티브마인드(NativeMind)'는 크롬 확장 프로그램 형태로 설치해서 쓸 수 있는데, 개인정보에 민감한 사람들에게는 정말 반가운 소식일 것 같아요.[^7]
- **Ktor 신규 기능 [^13]:** 코틀린(Kotlin)으로 서버 만드는 개발자들에게 희소식이에요. 제트브레인즈(JetBrains)의 Ktor 프레임워크가 모듈 관리를 더 쉽게 해주는 의존성 주입(DI) 플러그인을 기본으로 제공하기 시작했어요.[^13] 덕분에 더 깔끔하고 확장성 있는 서버 개발이 가능해졌습니다.

### 💬 솔직한 한마디
AI가 우리를 더 빠르게 만들어줄 거라는 기대가 넘쳐나지만, 최근 한 연구에서는 숙련된 오픈소스 개발자들이 AI 도구를 썼을 때 오히려 작업 완료 시간이 평균 19% 더 걸렸다는 결과가 나왔어요.[^35] 다들 AI 쓰면 24%는 빨라질 거라고 기대했는데 말이죠.[^35] 어쩌면 지금의 AI는 숙련자에게는 아직 서툰 조수 같아서, 자꾸 고쳐줘야 하니 시간이 더 걸리는 게 아닐까요? "자바스크립트(JavaScript) 중심 개발이 웹을 망가뜨린다"[^30]는 비판처럼, 새로운 기술이 항상 정답은 아닐 수 있다는 생각을 해보게 되네요.

## 🎯 오늘의 핵심
거대한 슈퍼 AI를 만들려는 경쟁(Grok 4 같은)과, 내 손안의 기기에서 가볍고 안전하게 돌아가는 AI(애플의 연구[^1]나 NativeMind[^7] 같은)를 만들려는 노력이 동시에 벌어지고 있다는 점이에요. AI의 미래가 클라우드에만 있는 게 아니라, 우리 각자의 기기 안에도 있다는 걸 보여주는 하루였습니다.

[^1]: QuantSpec: Self-Speculative Decoding with Hierarchical Quantized KV Cache - https://machinelearning.apple.com/research/quantspec
[^3]: Beyond Sensor Data: Foundation Models of Behavioral Data from Wearables Improve Health Predictions - https://machinelearning.apple.com/research/beyond-sensor
[^4]: Accelerating generative AI development with fully managed MLflow 3.0 on Amazon SageMaker AI - https://aws.amazon.com/blogs/machine-learning/accelerating-generative-ai-development-with-fully-managed-mlflow-3-0-on-amazon-sagemaker-ai/
[^5]: Amazon SageMaker HyperPod launches model deployments to accelerate the generative AI model development lifecycle - https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-hyperpod-launches-model-deployments-to-accelerate-the-generative-ai-model-development-lifecycle/
[^7]: NativeMind - 브라우저에서 실행되는 프라이빗 온디바이스 AI 어시스턴트 - https://news.hada.io/topic?id=21918
[^8]: Explore the world around you in 30 endangered languages with Google AI - https://blog.google/outreach-initiatives/arts-culture/explore-the-world-around-you-in-30-endangered-languages-with-google-ai/
[^11]: Grok 4가 이제 선두 AI 모델임 - https://news.hada.io/topic?id=21919
[^12]: Grok 4 출시 - https://news.hada.io/topic?id=21917
[^13]: Modular Ktor: Building Backends for Scale - https://blog.jetbrains.com/kotlin/2025/07/modular-ktor-building-backends-for-scale/
[^16]: Shielded Diffusion: Generating Novel and Diverse Images using Sparse Repellency - https://machinelearning.apple.com/research/diffusion
[^17]: Turn your photos into videos in Gemini - https://blog.google/products/gemini/photo-to-video/
[^18]: Docker Brings Compose to the Agent Era: Building AI Agents is Now Easy - https://www.docker.com/blog/build-ai-agents-with-docker-compose/
[^30]: 과도한 JavaScript 중심 개발, 웹을 망가뜨리다 - https://news.hada.io/topic?id=21925
[^35]: 경험 많은 오픈소스 개발자의 생산성에 미치는 "AI의 임팩트" 측정하기 - https://news.hada.io/topic?id=21920