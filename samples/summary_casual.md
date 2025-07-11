# Daily Feed - 2025-07-11

## 🗞️ 오늘 재미있던 기술 소식

오늘 제일 눈에 들어온 건 AWS가 내놓은 VS Code 연동 기능이야.[^4] 이제 내 로컬 VS Code에서 바로 SageMaker Studio의 강력한 AI 개발 환경이랑 컴퓨팅 자원을 쓸 수 있게 됐어. 개발자들은 익숙한 환경에서 작업하면서 클라우드의 파워를 그대로 쓰니까 생산성이 엄청 올라갈 것 같아. 맨날 환경 맞추느라 고생했는데, 이런 업데이트는 진짜 환영이야! [^4]

## 📰 주목할 만한 이야기들

### 🏢 기업들 근황
- **AWS의 AI 개발 생태계 강화**: AWS가 정말 작정했나 봐. SageMaker 업데이트가 쏟아지고 있어. VS Code 연동은 물론이고[^4], 이제 MLflow 3.0을 완전 관리형으로 지원해서 실험 추적부터 앱 관찰까지 한 번에 할 수 있게 됐어.[^7] HyperPod에는 원클릭 관찰 기능이 추가돼서 클러스터 상태랑 GPU 활용도를 쉽게 파악할 수 있게 됐고, 이제 Mistral 같은 외부 모델도 쉽게 연동해서 쓸 수 있대.[^8][^19] 개발자들이 AI 모델 만들고 관리하기 훨씬 편하게 만드는 데 엄청 집중하는 게 보여.

- **Apple의 조용한 ML 혁신**: Apple은 신기한 연구 논문을 대거 발표했어.[^9][^10] 특히 LLM이 얼마나 메모리를 적게 쓰면서도 빠르게 돌아갈 수 있는지에 대한 연구(QuantSpec)가 인상 깊었어.[^9] 이런 연구들은 앞으로 나올 아이폰이나 맥북에 더 강력한 온디바이스 AI 기능이 탑재될 거라는 신호 아닐까? 겉으로 드러나는 신제품 발표는 없어도, 내실을 엄청 다지고 있는 느낌이야.

- **Google의 AI 대중화**: Google은 Gemini 앱에서 사진 한 장을 올리면 그걸로 동영상을 만들어주는 Veo 3 기능을 추가했대.[^26] 진짜 신기하지 않아? 이제 누구나 쉽게 AI로 콘텐츠를 만들 수 있는 시대가 오는 것 같아. 그리고 미국 인프라 개선을 위해 AI를 사용하는 스타트업 17개를 지원하는 프로그램을 시작했다는데, AI 기술로 현실 문제를 해결하려는 모습이 보기 좋았어.[^20]

### 🚀 눈에 띄는 기술
- **이제는 기본이 된 RAG**: 요즘 AI 좀 만져본다 하면 RAG (검색 증강 생성) 얘기를 빼놓을 수 없지. 우리 회사 내부 문서나 데이터를 기반으로 똑똑하게 답변하는 AI 챗봇을 만드는 기술인데, AWS 서비스를 활용하는 방법이나 오픈소스인 ChromaDB를 쓰는 방법들이 소개됐어.[^5][^12] 그냥 똑똑한 척하는 AI가 아니라, 진짜 내 데이터에 기반해서 답을 주니까 훨씬 유용해.

- **Ktor 모듈화로 확장성 잡기**: 가벼운 웹 프레임워크로 알려진 Ktor가 모듈화를 통해 대규모 백엔드도 감당할 수 있게 하는 방법을 공유했어.[^17] 처음에는 너무 미니멀해서 복잡한 프로젝트에 쓸 수 있을까 싶었는데, 의존성 주입(DI) 플러그인 같은 걸로 기능을 깔끔하게 분리하고 확장할 수 있게 만들었더라고. 가벼움과 확장성, 두 마리 토끼를 다 잡으려는 시도가 엿보여.[^17]

- **CodeQL로 CORS 취약점 찾기**: GitHub에서 CodeQL로 CORS(Cross-Origin Resource Sharing) 설정 오류를 찾는 방법을 공유했어.[^18] 보안은 항상 중요하잖아. 특히 웹 개발에서 CORS 설정 잘못하면 큰일 나는데, CodeQL 같은 정적 분석 도구를 사용해서 개발 단계에서부터 이런 취약점을 미리 잡아낼 수 있다는 게 중요해. Gin 같은 특정 프레임워크의 구조를 모델링해서 자동으로 찾아준다는 점이 진짜 편할 것 같아.[^18]

### 💬 솔직한 한마디
- **AI 코드, 얼마나 믿어야 할까?**: 개발팀의 코드 중 몇 퍼센트를 AI가 짜는 게 적당할까? 라는 질문에 한 글이 되게 좋은 답을 줬어.[^2] 중요한 건 비율이 아니라 '맥락'과 '신뢰'라는 거야. AI가 아무리 코드를 잘 짜줘도 우리 프로젝트의 아키텍처나 코딩 표준을 이해하지 못하면 결국 사람이 다 뜯어고쳐야 하거든. AI를 그냥 코드 생성기로만 볼 게 아니라, 우리 팀의 맥락을 이해하는 똑똑한 동료로 만드는 게 진짜 과제인 것 같아.

- **디지털 강의실의 빛과 그림자**: 코로나 이후로 원격/하이브리드 수업이 당연해졌는데, 우리가 뭘 얻고 뭘 잃었는지 돌아보는 글이 있었어.[^6] 유연한 학습 환경과 교육 접근성은 좋아졌지만, 인간적인 교류가 줄고 디지털 격차가 심해진 건 뼈아픈 현실이지. 특히 선생님들의 번아웃 문제가 심각하다고 해.[^6] 기술이 만능 해결책은 아니라는 걸 다시 한번 생각하게 됐어. 결국 중요한 건 기술을 '어떻게' 현명하게 사용하느냐인 것 같아.

## 🎯 오늘의 핵심
오늘의 핵심은 **'AI 개발 경험의 대중화'**야. AWS가 VS Code 연동이나 MLflow 지원을 강화하고[^4][^7], Docker가 Compose로 AI 에이전트를 쉽게 만들게 해주는 것처럼[^14], 이제 기업들은 'AI를 만드는 것'을 넘어 '누구나 AI를 쉽고 효율적으로 만들게 하는 것'에 집중하고 있어. 복잡한 인프라 걱정 없이 개발자들이 아이디어만으로 멋진 AI 서비스를 만들 수 있는 시대가 성큼 다가온 거지.

[^2]: Target Concrete Score Matching: A Holistic Framework for Discrete ... - Apple Machine Learning Research
[^4]: Supercharge your AI workflows by connecting to SageMaker Studio ... - AWS
[^5]: Smart Search Meets LLM: AWS-Powered Retrieval-Augmented Generation - DEV Community
[^6]: 📚 The Digital Classroom: What We’ve Gained—and What We’ve Lost - DEV Community
[^7]: Accelerating generative AI development with fully managed MLflow ... - AWS
[^8]: Build an MCP application with Mistral models on AWS | Artificial ... - AWS
[^9]: QuantSpec: Self-Speculative Decoding with Hierarchical Quantized ... - Apple Machine Learning Research
[^10]: Addressing Misspecification in Simulation-based Inference through ... - Apple Machine Learning Research
[^12]: Next-Gen Q&A: Retrieval-Augmented AI with Chroma Vector Store - DEV Community
[^14]: Docker Brings Compose to the Agent Era: Building AI Agents is Now Easy - Docker Blog
[^17]: Modular Ktor: Building Backends for Scale | The Kotlin Blog - Kotlin Blog
[^18]: Modeling CORS frameworks with CodeQL to find security ... - The GitHub Blog
[^19]: Accelerate foundation model development with one-click ... - AWS - AWS
[^20]: New cohort for Google for Startups AI Academy: American ... - The Keyword
[^26]: Turn your photos into videos in Gemini - Gemini