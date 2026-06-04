window.visualLabData = {
  "kind": "hub",
  "sequence": "12",
  "title": "Event Driven Visual Lab",
  "description": "주문 생성 결과를 이벤트로 발행하고 소비자가 후속 알림 기록으로 연결하는 흐름을 통해 동기 호출과 이벤트 전달의 책임 차이를 이해합니다.",
  "repo": {
    "name": "spring-boot-event-driven-lab",
    "path": "spring-boot-event-driven-lab"
  },
  "visualLabPath": "docs/visual-lab/index.html",
  "visualLabHubPath": "docs/visual-lab/index.html",
  "flow": [
    {
      "id": "event-flow",
      "label": "Event publish / consume",
      "problem": "주문 생성 뒤 후속 작업이 늘어나면 주문 흐름이 여러 작업의 세부 구현을 알게 됩니다.",
      "concept": "Event DTO, publisher, consumer, follow-up action",
      "action": "주문 생성 결과를 이벤트로 표현하고 소비자가 알림 기록으로 연결합니다.",
      "check": "주문 서비스가 알림 처리 세부 내용을 직접 알아야 하는지 설명합니다."
    }
  ],
  "sequences": [
    {
      "sequence": "12",
      "id": "12",
      "title": "Event Driven",
      "topic": "Message queue and event-driven thinking",
      "href": "./sequences/12/index.html",
      "summary": "주문 생성 후 알림, 로그, 포인트 같은 후속 작업을 주문 흐름이 모두 알아야 할까?"
    }
  ]
};
