# Daily Feed - 2025-07-11

## 🚀 Dev Daily Digest

Docker, AI 에이전트 개발을 위한 Compose 확장 및 VS Code 최신 릴리스 등 개발자 도구의 대대적인 업데이트가 있었습니다. [^5][^54]

## 💻 Tech Updates

### 🔧 New Tools & Frameworks
- **Docker, Compose 기능 대폭 확장**: Docker Compose v2.36.0부터 'Provider services'가 도입되어 컨테이너를 넘어 외부 시스템과 상호작용이 가능해졌습니다. [^1] 또한, AI 에이전트 개발을 용이하게 하는 새로운 기능이 추가되어, Docker Compose를 통해 에이전트 기반 워크로드를 정의, 실행, 공유하는 표준을 마련하고 있습니다. [^5]
- **TypeScript 5.9 베타 출시**: TypeScript 5.9 베타 버전이 공개되었습니다. [^45] 주요 업데이트로는 `tsc --init`의 미니멀 지원, 지연된 `import` 문(`import defer`), 그리고 `node20` 모듈 지원 등이 포함되어 개발 환경 설정을 간소화합니다. [^45]
- **VS Code 6월 업데이트 (v1.102)**: Visual Studio Code의 2025년 6월 릴리스에는 GitHub Copilot Chat 확장 기능 오픈소스화, 프로젝트 규칙을 반영하는 사용자 지정 지침 생성, MCP(Model Context Protocol) 지원 정식 버전 전환 등 AI 개발 경험을 향상시키는 여러 기능이 추가되었습니다. [^3][^54]

### 📦 Platform & Services
- **AWS, SageMaker AI 기능 강화**: Amazon SageMaker에 완전 관리형 MLflow 3.0 지원, 로컬 VS Code에서 SageMaker Studio로의 원격 연결 기능, SageMaker HyperPod의 모델 배포 및 원클릭 관찰 기능이 추가되었습니다. [^106][^110] 이를 통해 생성형 AI 모델 개발 수명 주기가 단축되고 워크플로우가 간소화됩니다. [^109]
- **Google Cloud, BigQuery에 TimesFM 통합**: Google Research의 시계열 파운데이션 모델인 TimesFM이 BigQuery에 통합되어 `AI.FORECAST` 함수를 통해 제로샷 예측 기능을 제공합니다. [^140] 이 모델은 4,000억 개의 실제 시계열 데이터 포인트로 사전 훈련되어 별도의 모델 훈련 없이도 정확한 예측이 가능합니다. [^140]
- **Hugging Face, 비동기 로봇 추론 공개**: 로봇의 행동 예측과 실행을 분리하는 비동기 추론(Asynchronous Robot Inference) 기술이 공개되었습니다. [^4] 이 접근법은 로봇이 다음 행동을 계산하는 동안에도 현재 작업을 수행할 수 있게 하여, 응답성을 크게 향상시키고 유휴 시간을 줄입니다. [^4]

### 🔒 Security & Performance
- **Git, 7개 보안 취약점 패치 릴리스**: Git 프로젝트가 모든 이전 버전에 영향을 미치는 7개의 보안 취약점을 해결한 새로운 버전을 발표했습니다. [^26] 개발자들은 즉시 최신 버전으로 업데이트할 것이 권장됩니다.
- **Apple, LLM 추론 최적화 연구 발표**: Apple 연구진이 긴 컨텍스트 LLM 추론 시 GPU 메모리와 지연 시간 병목 현상을 해결하기 위한 두 가지 새로운 KV 캐시 압축 기술, `CommVQ(Commutative Vector Quantization)`와 `QuantSpec`을 발표했습니다. [^59][^57] 이 기술들은 양자화를 통해 KV 캐시 메모리 사용량을 크게 줄여 엣지 디바이스에서의 성능을 향상시킵니다. [^59][^57]
- **Cloudflare, 분산 KV 스토어 Quicksilver v2 공개**: Cloudflare가 초당 30억 개 이상의 키를 처리하는 분산 키-값 저장소인 Quicksilver를 재설계한 Quicksilver v2를 공개했습니다. [^90] 이번 업데이트는 전 세계적으로 더 높은 성능과 안정성을 제공하는 데 초점을 맞췄습니다. [^90]

## 📚 Worth Reading
- **"The Gentle Singularity" - Sam Altman**: OpenAI의 CEO 샘 알트먼은 디지털 초지능의 도래가 이미 시작되었으며, 이는 점진적이고 생각보다 평범한 방식으로 진행되고 있다고 말합니다. [^127] 그는 AI가 과학 발전과 생산성을 극적으로 향상시켜 삶의 질을 높일 것이며, 2030년대에는 지능과 에너지가 풍부해져 인류의 근본적인 한계를 극복할 수 있을 것이라고 전망합니다. [^127]
- **"How To Be Successful" - Sam Altman**: 성공을 위한 13가지 생각을 공유하는 글로, 자신을 복리처럼 성장시키고, 거의 망상에 가까울 정도로 자신을 믿으며, 독립적으로 생각하는 법을 배우라고 조언합니다. [^134] 또한, 장기적인 안목으로 중요한 소수의 일에 집중하고, 대담해지며, 강력한 네트워크를 구축하는 것의 중요성을 강조합니다. [^134]
- **"Netflix Tudum Architecture: from CQRS with Kafka to CQRS with RAW Hollow"**: Netflix 기술 블로그에서 자사의 팬 사이트인 Tudum의 아키텍처 변화 과정을 공유했습니다. [^8] 초기 Kafka를 사용한 CQRS(명령 및 쿼리 책임 분리) 모델에서, 데이터 복제 및 전파를 위한 인메모리 데이터스토어 및 라이브러리인 Hollow를 활용하는 방식으로 전환하여 성능과 확장성을 개선한 사례를 자세히 설명합니다. [^8]

## 🎯 Quick Takeaway
AI 페어 프로그래머(예: GitHub Copilot)와 더 나은 파트너가 되기 위해서는 완벽한 프롬프트 작성 기술을 넘어, AI에게 충분한 '컨텍스트'를 제공하는 것이 핵심입니다. [^23] 코드의 품질을 높이려면 AI가 프로젝트의 전체적인 맥락을 이해할 수 있도록 명확하고 구조화된 코드를 작성하고 관련 파일을 함께 열어두는 것이 좋습니다. [^23]

[^1]: Compose your way with Provider services! - https://www.docker.com/blog/docker-compose-with-provider-services/
[^2]: Gemini is coming to your Wear OS smartwatch - https://blog.google/products/wear-os/gemini-wear-os-watches/
[^3]: June 2025 (version 1.102) - https://code.visualstudio.com/updates/v1_102
[^4]: Asynchronous Robot Inference: Decoupling Action Prediction and Execution - https://huggingface.co/blog/async-robot-inference
[^5]: Docker Brings Compose to the Agent Era: Building AI Agents is Now Easy - https://www.docker.com/blog/build-ai-agents-with-docker-compose/
[^6]: Sam & Jony - https://openai.com/sam-and-jony
[^7]: PG and Jessica - https://blog.samaltman.com/pg-and-jessica
[^8]: Netflix Tudum Architecture: from CQRS with Kafka to CQRS with RAW Hollow - https://netflixtechblog.com/netflix-tudum-architecture-from-cqrs-with-kafka-to-cqrs-with-raw-hollow-86d141b72e52?source=rss----2615bd06b42e---4
[^9]: Docker MCP Gateway: Open Source, Secure Infrastructure for Agentic AI - https://www.docker.com/blog/docker-mcp-gateway-secure-infrastructure-for-agentic-ai/
[^10]: Dive deeper with AI Mode and get gaming help in Circle to Search - https://blog.google/products/search/circle-to-search-ai-mode-gaming/
[^11]: v15.4.0-canary.121 - https://github.com/vercel/next.js/releases/tag/v15.4.0-canary.121
[^12]: Query Amazon Aurora PostgreSQL using Amazon Bedrock Knowledge Bases structured data - https://aws.amazon.com/blogs/machine-learning/query-amazon-aurora-postgresql-using-amazon-bedrock-knowledge-bases-structured-data/
[^13]: What I Wish Someone Had Told Me - https://blog.samaltman.com/what-i-wish-someone-had-told-me
[^14]: Apple announces chief operating officer transition - https://www.apple.com/newsroom/2025/07/apple-announces-chief-operating-officer-transition/
[^15]: OpenAI 🤝 @teamganassi - https://www.youtube.com/shorts/LxYpRZYPNZ0
[^16]: Reachy Mini - The Open-Source Robot for Today's and Tomorrow's AI Builders - https://huggingface.co/blog/reachy-mini
[^17]: Upskill your LLMs with Gradio MCP Servers - https://huggingface.co/blog/gradio-mcp-servers
[^18]: Target Concrete Score Matching: A Holistic Framework for Discrete Diffusion - https://machinelearning.apple.com/research/target-concrete
[^19]: Grok 4 출시 - https://news.hada.io/topic?id=21917
[^20]: Declutter your inbox with Gmail’s newest feature - https://blog.google/products/gmail/new-manage-subscriptions-unsubscribe/
[^23]: Beyond prompt crafting: How to be a better partner for your AI pair programmer - https://github.blog/ai-and-ml/github-copilot/beyond-prompt-crafting-how-to-be-a-better-partner-for-your-ai-pair-programmer/
[^26]: Git security vulnerabilities announced - https://github.blog/open-source/git/git-security-vulnerabilities-announced-6/
[^45]: Announcing TypeScript 5.9 Beta - https://devblogs.microsoft.com/typescript/announcing-typescript-5-9-beta/
[^54]: June 2025 - https://github.com/microsoft/vscode/releases/tag/1.102.0
[^57]: QuantSpec: Self-Speculative Decoding with Hierarchical Quantized KV Cache - https://machinelearning.apple.com/research/quantspec
[^59]: CommVQ: Commutative Vector Quantization for KV Cache Compression - https://machinelearning.apple.com/research/commutative-vector-quantization
[^90]: Quicksilver v2: evolution of a globally distributed key-value store (Part 1) - https://blog.cloudflare.com/quicksilver-v2-evolution-of-a-globally-distributed-key-value-store-part-1/
[^106]: New capabilities in Amazon SageMaker AI continue to transform how organizations develop AI models - https://aws.amazon.com/blogs/machine-learning/new-capabilities-in-amazon-sagemaker-ai-continue-to-transform-how-organizations-develop-ai-models/
[^109]: Amazon SageMaker HyperPod launches model deployments to accelerate the generative AI model development lifecycle - https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-hyperpod-launches-model-deployments-to-accelerate-the-generative-ai-model-development-lifecycle/
[^110]: Supercharge your AI workflows by connecting to SageMaker Studio from Visual Studio Code - https://aws.amazon.com/blogs/machine-learning/supercharge-your-ai-workflows-by-connecting-to-sagemaker-studio-from-visual-studio-code/
[^127]: The Gentle Singularity - https://blog.samaltman.com/the-gentle-singularity
[^134]: How To Be Successful - https://blog.samaltman.com/how-to-be-successful
[^140]: Zero-shot forecasting in BigQuery with the TimesFM foundation model - https://cloud.google.com/blog/products/data-analytics/bigquery-ml-timesfm-models-now-in-preview/