# Daily Feed - 2025-07-11

## 🗞️ 오늘 재미있던 기술 소식

진짜 SF 영화에서나 보던 일들이 현실이 되고 있어. OpenAI의 CEO 샘 알트만은 이제 인간과 기계의 통합, 즉 '머지(The Merge)'가 이미 시작되었다고 말했어. [^8] 우리가 스마트폰 알고리즘에 좌우되는 것부터가 그 시작이라는 거야. [^8] 앞으로는 유전자 강화, 뇌-기계 인터페이스까지 현실이 될 거라고. [^8] 조금 무섭기도 한데, 이게 인류에게 최상의 시나리오일 수 있다는 말이 더 소름 돋아. [^8]

## 📰 주목할 만한 이야기들

### 🏢 기업들 근황
- **Google**, 이제 사진 한 장만 있으면 8초짜리 비디오를 뚝딱 만들어주는 미친 기능을 Gemini에 추가했어. [^1] 최신 AI 모델인 Veo 3를 사용하는데, Google AI Pro나 Ultra 구독자라면 바로 써볼 수 있대. [^1] 심지어 손목 위에서도 AI를 쓸 수 있게 됐어. Wear OS 스마트워치에 Gemini가 탑재돼서 폰 없이도 이메일 요약이나 일정 추가 같은 걸 할 수 있게 된 거지. [^4]
- **OpenAI**는 미국 교사 연맹(AFT)이랑 손잡고 1,000만 달러를 투자해서 'AI 교육 국립 아카데미'를 만든대. [^10] 목표는 40만 명의 교사들에게 AI 활용법을 가르치는 거라고. [^10] 교실에서 AI를 어떻게 쓸지 교사들이 직접 결정하게 하겠다는 건데, 진짜 멋진 생각인 것 같아.
- **AWS**는 진짜 개발자랑 기업들을 위한 AI 도구를 쏟아내고 있어. 복잡한 쿠버네티스 클러스터 관리를 도와주는 'K8sGPT'와 Amazon Bedrock 연동 서비스를 내놨고 [^5], 소매업을 위한 AI 비서 'Amazon Q Business'도 출시했어. [^6] 심지어 금융 사기를 잡는 'GraphRAG'라는 기술도 공개했는데, 이건 데이터들 사이의 '관계'를 분석해서 복잡한 사기 수법을 잡아내는 거래. [^11]
- **Hugging Face**가 Pollen Robotics와 함께 엄청난 걸 내놨어. 'Reachy Mini'라는 오픈소스 로봇인데, 가격이 299달러부터 시작해! [^14] AI를 가지고 놀고, 배우고, 공유할 수 있게 만든 책상 위 작은 로봇이야. [^14] 이제 진짜 1인 1로봇 시대가 멀지 않은 것 같아.

### 🚀 눈에 띄는 기술
- **AI 개발, 더 똑똑하게**: GitHub에서는 이제 Copilot을 더 잘 쓰려면 좋은 프롬프트만으로는 부족하다고 말해. [^3] 코드에 주석을 잘 달고, 프로젝트 맞춤형 지침 파일(`copilot-instructions.md`)을 만들어서 AI에게 컨텍스트를 잘 알려주는 게 핵심이래. [^3] AWS도 비슷한 흐름인데, 머신러닝 프로젝트 관리 도구인 MLflow 3.0을 SageMaker에서 완벽 지원해서 AI 앱의 모든 단계를 추적하고 디버깅하기 쉽게 만들었어. [^12]
- **데이터 분석의 민주화**: 물류 플랫폼 회사인 Parcel Perform은 이제 데이터 분석가 없이도 비즈니스팀이 자연어로 데이터를 분석할 수 있게 됐어. [^13] AWS Bedrock을 이용한 text-to-SQL AI 에이전트 덕분인데, 며칠씩 걸리던 데이터 분석이 10분 만에 끝난대. [^13] 생산성이 99%나 향상됐다니, 이건 뭐 혁명 수준이야.
- **보안은 기본, 거버넌스는 필수**: AI 모델을 그냥 막 쓰는 시대는 끝났어. AWS는 SageMaker Unified Studio에서 어떤 사용자가 어떤 AI 모델에 접근할 수 있는지 아주 세밀하게 통제하는 방법을 발표했어. [^15] 기업 입장에선 보안과 거버넌스를 확실히 챙기면서 AI를 도입할 수 있으니 정말 중요하지.
- **자바의 진화**: 자바의 Z Garbage Collector(ZGC)는 잘 쓰면 기적 같은 성능을 보여주지만, 설정이 잘못되면 성능 저하의 주범이 될 수 있대. [^9] 최근 JavaOne 세션에서는 이런 함정을 피하는 방법과, 앞으로는 복잡한 설정 없이도 ZGC를 쉽게 쓸 수 있도록 개선 중이라는 소식이 전해졌어. [^9]

### 💬 솔직한 한마디
샘 알트만이 쓴 '성공하는 법'이라는 글을 읽어봤는데, "복리처럼 성장하라", "거의 망상에 가까울 정도로 스스로를 믿어라", "결국 중요한 건 소유하는 것이다" 같은 조언들이 인상 깊었어. [^7] 특히 "대담한 아이디어가 사람들을 움직인다"는 말, 이거 완전 팩트 아니야? [^2] 세상을 바꾸는 기술들은 다들 처음엔 '이게 되겠어?' 싶었던 것들이잖아. 지금 쏟아지는 AI 기술들도 마찬가지인 것 같아. 당장은 혼란스러워도 결국 이 기술들을 잘 활용하는 소수의 사람이나 기업이 엄청난 기회를 잡게 되겠지. 우리는 그냥 구경만 할 게 아니라, 이 흐름에 어떻게 올라탈지 진지하게 고민해봐야 할 때야.

## 🎯 오늘의 핵심
AI는 이제 단순한 도구를 넘어, 우리 일과 삶의 방식을 근본적으로 바꾸는 운영체제(OS)가 되어가고 있어. Gemini가 사진을 영상으로 만들고, Copilot이 내 코드의 맥락을 이해하고, Reachy Mini 같은 로봇이 책상 위 동료가 되는 세상이야. 중요한 건 이 변화의 흐름 위에서 '어떤 질문을 던지고, 무엇을 만들 것인가'를 고민하는 우리 자신인 것 같아.

[^1]: Turn your photos into videos in Gemini - Google Blog[^2]: What I Wish Someone Had Told Me - Sam Altman[^3]: Beyond prompt crafting: How to be a better partner for your AI pair programmer - The GitHub Blog[^4]: How to use Gemini on a Wear OS smartwatch - Google Blog[^5]: Use K8sGPT and Amazon Bedrock for simplified Kubernetes cluster maintenance | Artificial Intelligence - AWS[^6]: Unlock retail intelligence by transforming data into actionable insights using generative AI with Amazon Q Business | Artificial Intelligence - AWS[^7]: How To Be Successful - Sam Altman[^8]: The Merge - Sam Altman[^9]: ZGC - Paving the GC On-Ramp – Inside.java[^10]: Working with 400,000 teachers to shape the future of AI in schools | OpenAI[^11]: Combat financial fraud with GraphRAG on Amazon Bedrock Knowledge Bases | Artificial Intelligence - AWS[^12]: Accelerating generative AI development with fully managed MLflow 3.0 on Amazon SageMaker AI | Artificial Intelligence - AWS[^13]: Democratize data for timely decisions with text-to-SQL at Parcel Perform | Artificial Intelligence - AWS[^14]: Reachy Mini - The Open-Source Robot for Today's and Tomorrow's AI Builders - Hugging Face[^15]: Configure fine-grained access to Amazon Bedrock models using Amazon SageMaker Unified Studio | Artificial Intelligence - AWS