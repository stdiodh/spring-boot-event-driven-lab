window.visualLabData = {
  sequence: "12",
  title: "Event Driven Visual Lab",
  goal: "주문 생성 결과를 이벤트로 발행하고 소비자가 후속 알림 기록으로 연결하는 흐름을 통해 동기 호출과 이벤트 전달의 책임 차이를 이해합니다.",
  flow: [
    {
      id: "event-flow",
      label: "Event publish / consume",
      problem: "주문 생성 뒤 후속 작업이 늘어나면 주문 흐름이 여러 작업의 세부 구현을 알게 됩니다.",
      concept: "Event DTO, publisher, consumer, follow-up action",
      action: "주문 생성 결과를 이벤트로 표현하고 소비자가 알림 기록으로 연결합니다.",
      check: "주문 서비스가 알림 처리 세부 내용을 직접 알아야 하는지 설명합니다.",
    },
  ],
  defaultSequence: "12",
  repo: {
    name: "spring-boot-event-driven-lab",
    path: "spring-boot-event-driven-lab",
  },
  sequences: [
    {
      id: "12",
      title: "Event Driven",
      topic: "Message queue and event-driven thinking",
      question: "주문 생성 후 알림, 로그, 포인트 같은 후속 작업을 주문 흐름이 모두 알아야 할까?",
      goal: "동기 직접 호출과 이벤트 전달을 비교하고, 이벤트 발행자와 소비자의 책임을 작은 예제로 이해합니다.",
      source: {
        theory: "../theory.md",
        implementation: "../implementation.md",
        checklist: "../checklist.md",
      },
      why: {
        problem: "주문 생성 메서드가 알림 처리까지 직접 호출하면 후속 작업이 늘어날수록 주문 흐름이 여러 구현 세부사항을 알게 됩니다.",
        limits: [
          "주문 생성 실패와 후속 알림 실패를 같은 흐름에서 처리하면 책임 경계가 모호해집니다.",
          "후속 작업이 늘어날수록 주문 서비스 수정 범위가 커집니다.",
          "서비스가 나뉘는 환경에서는 한 서비스 장애가 다른 서비스 요청 흐름까지 끌고 들어올 수 있습니다.",
        ],
        choice: "주문 생성 결과를 이벤트로 표현하고, 소비자가 알림 기록 같은 후속 작업을 맡는 구조로 책임을 분리합니다.",
      },
      overview: [
        "POST /event-orders",
        "OrderService",
        "OrderCreatedEvent",
        "EventPublisherService",
        "Message Broker",
        "NotificationConsumer",
        "Notification Log",
      ],
      flows: [
        {
          id: "order-event-flow",
          title: "주문 생성과 이벤트 전달 흐름",
          summary: "API 요청은 주문 생성 결과를 만들고, 그 결과가 이벤트로 발행되어 소비자의 후속 작업으로 이어집니다.",
          mermaid: "sequenceDiagram\n  actor Client\n  participant Controller as EventOrderController\n  participant Order as OrderService\n  participant Publisher as EventPublisherService\n  participant Broker as Message Broker\n  participant Consumer as NotificationConsumer\n  participant Log as Notification Log\n  Client->>Controller: POST /event-orders\n  Controller->>Order: create order\n  Order-->>Controller: order result\n  Order->>Publisher: publish OrderCreatedEvent\n  Publisher->>Broker: send event\n  Broker-->>Consumer: deliver event\n  Consumer->>Log: save notification record\n  Controller-->>Client: order response",
          steps: [
            { order: 1, actor: "Client", input: "POST /event-orders", owner: "EventOrderController", action: "주문 생성 요청을 Service로 전달합니다.", output: "Order request", note: "API 응답 흐름은 주문 생성 자체에 집중합니다." },
            { order: 2, actor: "EventOrderController", input: "Order request", owner: "OrderService", action: "주문 id와 주문 생성 결과를 만듭니다.", output: "Order result", note: "주문 서비스는 후속 알림 세부 구현을 직접 알 필요를 줄입니다." },
            { order: 3, actor: "OrderService", input: "Order result", owner: "OrderCreatedEvent", action: "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.", output: "Event DTO", note: "이벤트 필드가 많아질수록 소비자가 발행자 내부 모델에 의존하기 쉽습니다." },
            { order: 4, actor: "OrderService", input: "OrderCreatedEvent", owner: "EventPublisherService", action: "이벤트 발행 책임만 맡깁니다.", output: "Published event", note: "발행자는 후속 작업의 구현 세부사항을 직접 호출하지 않습니다." },
            { order: 5, actor: "Message Broker", input: "Published event", owner: "NotificationConsumer", action: "소비자가 이벤트를 받아 알림 기록으로 연결합니다.", output: "Notification log", note: "소비자는 후속 작업 책임을 독립적으로 수행합니다." },
          ],
        },
        {
          id: "direct-vs-event",
          title: "직접 호출과 이벤트 전달 비교",
          summary: "직접 호출은 단순하고 추적이 쉽지만, 후속 작업이 늘어날 때 발행자 책임이 커질 수 있습니다.",
          steps: [
            { order: 1, actor: "OrderService", input: "Order created", owner: "Direct call", action: "NotificationService를 직접 호출합니다.", output: "Immediate follow-up", note: "단순하지만 주문 서비스가 알림 구현을 알게 됩니다." },
            { order: 2, actor: "OrderService", input: "Order created", owner: "Event publish", action: "OrderCreatedEvent를 발행합니다.", output: "Event message", note: "후속 작업은 이벤트 소비자가 맡도록 흐름을 분리합니다." },
            { order: 3, actor: "NotificationConsumer", input: "Event message", owner: "Follow-up action", action: "알림 기록을 남깁니다.", output: "Notification result", note: "후속 작업이 늘어날수록 이벤트 전달의 분리 이점이 커집니다." },
          ],
        },
      ],
      responsibilities: [
        { name: "EventOrderController", role: "주문 생성 API 요청과 응답 경계를 담당합니다.", caution: "알림 기록 세부 구현을 직접 알지 않습니다." },
        { name: "OrderService", role: "주문 생성 결과를 만들고 이벤트로 표현합니다.", caution: "후속 작업 구현을 직접 호출하는 책임을 줄입니다." },
        { name: "OrderCreatedEvent", role: "후속 작업이 이해해야 할 최소 사실을 담는 메시지입니다.", caution: "발행자의 내부 모델 전체를 담지 않습니다." },
        { name: "EventPublisherService", role: "이벤트 발행 책임을 담당합니다.", caution: "소비자의 후속 작업 구현을 직접 수행하지 않습니다." },
        { name: "NotificationConsumer", role: "이벤트를 받아 알림 기록 같은 후속 작업을 수행합니다.", caution: "주문 생성 API 응답 흐름과 분리해서 봅니다." },
      ],
      concepts: [
        { title: "이벤트는 사실을 전달합니다", body: "주문이 생성되었다는 결과를 후속 작업이 이해할 수 있는 메시지로 표현합니다." },
        { title: "발행자와 소비자를 분리합니다", body: "주문 흐름은 이벤트를 발행하고, 알림 흐름은 이벤트를 소비합니다." },
        { title: "직접 호출은 나쁜 것이 아닙니다", body: "즉시 결과와 같은 트랜잭션 처리가 필요하면 직접 호출이 더 단순할 수 있습니다." },
        { title: "후속 작업이 늘면 이벤트를 검토합니다", body: "알림, 로그, 분석, 포인트처럼 나중에 처리해도 되는 작업을 분리할 수 있습니다." },
      ],
      glossary: [
        { term: "Event", meaning: "도메인에서 이미 일어난 사실을 표현하는 메시지입니다.", caution: "명령처럼 소비자에게 무엇을 하라고 세부 지시하지 않습니다." },
        { term: "Producer", meaning: "이벤트를 만드는 쪽입니다.", caution: "후속 작업 구현을 직접 알기 시작하면 결합이 커집니다." },
        { term: "Consumer", meaning: "이벤트를 받아 후속 작업을 수행하는 쪽입니다.", caution: "발행자 내부 모델에 과하게 의존하지 않아야 합니다." },
        { term: "Message Broker", meaning: "발행자와 소비자 사이에서 메시지를 전달하는 중간 계층입니다.", caution: "이번 범위는 브로커 운영 전체가 아니라 전달 사고를 이해하는 것입니다." },
        { term: "Follow-up action", meaning: "주문 생성 이후 알림, 로그, 분석처럼 이어지는 작업입니다.", caution: "요청자가 즉시 알아야 하는 결과와 구분합니다." },
      ],
      practical: [
        { title: "이벤트가 항상 더 좋은 선택은 아닙니다", body: "즉시 결과가 필요하거나 같은 실패 흐름에서 처리해야 한다면 직접 호출이 더 단순합니다." },
        { title: "이벤트 필드는 최소로 둡니다", body: "필드가 많아질수록 소비자가 발행자의 내부 모델에 강하게 의존합니다." },
        { title: "운영 메시징은 별도 학습 범위입니다", body: "재시도, 중복 처리, 순서 보장, 장애 복구는 이벤트 사고 이후에 다룰 주제입니다." },
      ],
      checks: [
        "주문 서비스가 알림 처리 세부 내용을 직접 알아야 할까요?",
        "OrderCreatedEvent에 어떤 최소 정보가 들어가야 하는지 설명할 수 있나요?",
        "직접 호출이 더 단순한 상황과 이벤트가 더 적합한 상황을 구분할 수 있나요?",
        "소비자가 이벤트를 받아 어떤 후속 작업으로 연결하는지 설명할 수 있나요?",
      ],
      next: {
        id: "Complete",
        title: "Course Review",
        reason: "이벤트 기반 사고까지 다루면 요청/응답, 저장, 검증, 인증, 캐시, 실시간, 배포, 리팩토링, 후속 작업 분리까지 백엔드 흐름 전체를 다시 연결해 볼 수 있습니다.",
      },
    },
  ],
};
