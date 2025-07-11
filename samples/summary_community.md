# Daily Feed - 2025-07-11

## 🔥 오늘의 테크 썰

ㄹㅇ 오늘 폼 미쳤다 ㅋㅋㅋ 개발자들 곡소리 나던 AI 에이전트 개발, 이제 Docker가 다 해결해준다고 나섬. [^11] "AI? 그냥 `docker compose up` 해" 이 한마디로 요약 가능. [^11] 예전에 마이크로서비스 아키텍처 나왔을 때 Docker가 '내 컴퓨터에선 되는데' 문제를 해결한 것처럼, 이번엔 AI 개발 생태계를 통째로 삼키려는 각. 이건 그냥 업데이트가 아니라 거의 선전포고 수준임. ㅋㅋㅋ 레전드.

## 💣 폭격당한 소식들

### 🏢 기업들 현실체크

- **AWS**: 역시 물량공세의 제왕 아마존. SageMaker에 새로운 기능들을 폭탄처럼 쏟아부음. [^16] HyperPod 성능 관측 기능 강화, 로컬 VS Code에서 원격 접속, MLflow 3.0 지원까지... [^16] 개발자들 못 도망가게 생태계에 말뚝 박는 솜씨가 여전함. "우리 거 쓰면 다 돼"라고 속삭이는 소리가 여기까지 들린다. [^16] 거기에 실시간 음성 AI 개발을 쉽게 해준다고 Amazon Nova Sonic이랑 LiveKit을 붙여버림. [^7] 그냥 뭐... 돈으로 다 해결하겠다는 의지.

- **넷플릭스**: 얘네는 뭐 맨날 지들이 직접 만들어서 씀. ㅋㅋㅋ 이번엔 자사 팬사이트 Tudum 아키텍처를 Kafka 쓰다가 느리다고 RAW Hollow라는 자체 인메모리 DB 만들어서 바꿨다고 자랑함. [^5] 덕분에 페이지 구축 시간이 1.4초에서 0.4초로 줄었다나 뭐라나. [^5] 역시 '없으면 만든다'의 장인들. 우리 같은 평민들은 상상도 못할 스케일.

- **애플**: "연구는 우리가 최고" 모드 ON. LLM 추론 속도를 높이는 기술(QuantSpec) [^13], AI가 학습 데이터 표절 못하게 막는 기술(Shielded Diffusion) [^14], AI 목소리를 더 자연스럽게 만드는 기술 [^15] 등등 논문을 그냥 막 쏟아냄. 근데 그래서 이걸로 시리(Siri)는 언제쯤 똑똑해지는 건데? 현실은? 맨날 연구만 하고 출시는 5년 뒤에 할 듯.

- **구글**: AI 영상 도구 Flow에 이미지 올리면 말하는 영상 만들어주는 기능 추가하고, 서비스 국가도 76개나 늘림. [^4] 이제 짤방에 목소리 넣는 게 유행할지도? 한편으로는 AI로 미국 인프라 개선하겠다는 스타트업 17개 모아서 교육도 시켜줌. [^8] 착한 기업 이미지 챙기는 거 잊지 않았네.

### ⚡ 기술계 ㄹㅇ 소식

- **Docker Compose, AI 에이전트 시대 개막**: 이게 오늘 제일 중요한 소식. 이제 `compose.yaml` 파일 하나로 LLM 모델, 각종 도구, 에이전트까지 다 정의해서 한방에 실행 가능. [^11] LangGraph, CrewAI 같은 요즘 핫한 프레임워크도 다 지원함. [^11] 노트북 사양 딸려서 70B 모델 못 돌리겠다고? 'Docker Offload' 기능으로 클라우드 GPU에 작업을 던져버리면 그만. [^11] ㄹㅇ 개발의 신세계가 열림.

- **Ktor의 의존성 주입(DI) 혁신**: 코틀린 좀 만져본 형들은 알 Ktor 프레임워크가 3.2 버전부터 자체 DI 플러그인을 제공함. [^17] 이전에는 외부 라이브러리 찾아 헤맸어야 했는데, 이제 깔끔하게 내장 기능으로 모듈 관리가 가능해짐. [^17] 덕분에 유지보수 편한 모듈형 백엔드 구축이 한결 수월해질 듯. 뭐, 쓰는 사람만 쓰겠지만.

### 🎯 현실적 한마디

빅테크들 보면 다들 "우리 플랫폼이 AI 개발 표준임"이라고 외치는 것 같음. AWS는 SageMaker로, 구글은 Vertex AI로, 이제 Docker는 아예 개발 환경 자체를 집어삼키려 하고 있음. [^11][^16] 결국 기술의 핵심은 '누가 더 똑똑한 모델을 만드냐'에서 '누가 더 개발자 친화적인 생태계를 제공하셔'로 넘어가고 있는 거. 개발자들 편하게 해주는 놈이 최후의 승자가 될 거라는 건 불변의 팩트.

## 😎 오늘의 핵심 팩트

Docker Compose가 AI 에이전트 개발을 위해 환골탈태했다는 것. [^11] 로컬 개발부터 클라우드 배포까지 `docker compose up` 하나로 통일하려는 야망은, 과거 마이크로서비스 시대를 평정했던 전략의 재림이다. [^11]

[^2]: Addressing Misspecification in Simulation-based Inference through Data-driven Calibration - Apple Machine Learning Research
[^4]: Flow adds speech to videos and expands to more countries - The Keyword
[^5]: Netflix Tudum Architecture: from CQRS with Kafka to CQRS with RAW Hollow - Netflix TechBlog
[^7]: Build real-time conversational AI experiences using Amazon Nova Sonic and LiveKit - AWS Machine Learning Blog
[^8]: New cohort for Google for Startups AI Academy: American Infrastructure - The Keyword
[^11]: Docker Brings Compose to the AI Agent Era - Docker Blog
[^13]: QuantSpec: Self-Speculative Decoding with Hierarchical Quantized KV Cache - Apple Machine Learning Research
[^14]: Shielded Diffusion: Generating Novel and Diverse Images using Sparse Repellency - Apple Machine Learning Research
[^15]: A Variational Framework for Improving Naturalness in Generative Spoken Language Models - Apple Machine Learning Research
[^16]: New capabilities in Amazon SageMaker AI continue to transform how organizations develop AI models - AWS Machine Learning Blog
[^17]: Modular Ktor: Building Backends for Scale - The Kotlin Blog