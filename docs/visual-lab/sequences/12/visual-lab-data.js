window.visualLabData = {
  "kind": "sequence",
  "sequence": "12",
  "title": "Event Driven",
  "subtitle": "Message queue and event-driven thinking",
  "goal": "동기 직접 호출과 이벤트 전달을 비교하고, 이벤트 발행자와 소비자의 책임을 작은 예제로 이해합니다.",
  "problem": "주문 생성 메서드가 알림 처리까지 직접 호출하면 후속 작업이 늘어날수록 주문 흐름이 여러 구현 세부사항을 알게 됩니다.",
  "repo": {
    "name": "spring-boot-event-driven-lab",
    "path": "spring-boot-event-driven-lab"
  },
  "defaultSequence": "12",
  "actors": [
    {
      "id": "client",
      "label": "Client",
      "kind": "client"
    },
    {
      "id": "order",
      "label": "OrderService",
      "kind": "server"
    },
    {
      "id": "publisher",
      "label": "EventPublisherService",
      "kind": "queue"
    },
    {
      "id": "broker",
      "label": "RabbitMQ",
      "kind": "queue"
    },
    {
      "id": "consumer",
      "label": "NotificationConsumer",
      "kind": "logic"
    },
    {
      "id": "notification",
      "label": "NotificationService",
      "kind": "logic"
    }
  ],
  "flows": [
    {
      "id": "order-event-flow",
      "title": "주문 생성과 이벤트 전달 흐름",
      "summary": "API 요청은 주문 생성 결과를 만들고, 그 결과가 이벤트로 발행되어 소비자의 후속 작업으로 이어집니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as OrderEventController\n  participant Order as OrderService\n  participant Publisher as EventPublisherService\n  participant Broker as Message Broker\n  participant Consumer as NotificationConsumer\n  participant Log as Notification Log\n  Client->>Controller: POST /event-orders\n  Controller->>Order: create order\n  Order-->>Controller: order result\n  Order->>Publisher: publish OrderCreatedEvent\n  Publisher->>Broker: send event\n  Broker-->>Consumer: deliver event\n  Consumer->>Log: save notification record\n  Controller-->>Client: order response",
      "steps": [
        {
          "order": 1,
          "actor": "Client",
          "input": "POST /event-orders",
          "owner": "OrderEventController",
          "action": "주문 생성 요청을 Service로 전달합니다.",
          "output": "Order request",
          "note": "API 응답 흐름은 주문 생성 자체에 집중합니다.",
          "id": "order-event-flow-step-1",
          "from": "Client",
          "to": "OrderEventController",
          "message": "주문 생성 요청을 Service로 전달합니다.",
          "messageKind": "request",
          "problem": "POST /event-orders",
          "concept": "OrderEventController",
          "check": "Order request",
          "codePointIds": [
            "event-dto",
            "publish-consume"
          ]
        },
        {
          "order": 2,
          "actor": "OrderEventController",
          "input": "Order request",
          "owner": "OrderService",
          "action": "주문 id와 주문 생성 결과를 만듭니다.",
          "output": "Order result",
          "note": "주문 서비스는 후속 알림 세부 구현을 직접 알 필요를 줄입니다.",
          "id": "order-event-flow-step-2",
          "from": "OrderEventController",
          "to": "OrderService",
          "message": "주문 id와 주문 생성 결과를 만듭니다.",
          "messageKind": "event",
          "problem": "Order request",
          "concept": "OrderService",
          "check": "Order result",
          "codePointIds": [
            "publish-consume",
            "event-dto"
          ]
        },
        {
          "order": 3,
          "actor": "OrderService",
          "input": "Order result",
          "owner": "OrderCreatedEvent",
          "action": "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.",
          "output": "Event DTO",
          "note": "이벤트 필드가 많아질수록 소비자가 발행자 내부 모델에 의존하기 쉽습니다.",
          "id": "order-event-flow-step-3",
          "from": "OrderService",
          "to": "OrderCreatedEvent",
          "message": "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.",
          "messageKind": "event",
          "problem": "Order result",
          "concept": "OrderCreatedEvent",
          "check": "Event DTO",
          "codePointIds": [
            "event-dto",
            "publish-consume"
          ]
        },
        {
          "order": 4,
          "actor": "OrderService",
          "input": "OrderCreatedEvent",
          "owner": "EventPublisherService",
          "action": "이벤트 발행 책임만 맡깁니다.",
          "output": "Published event",
          "note": "발행자는 후속 작업의 구현 세부사항을 직접 호출하지 않습니다.",
          "id": "order-event-flow-step-4",
          "from": "OrderService",
          "to": "EventPublisherService",
          "message": "이벤트 발행 책임만 맡깁니다.",
          "messageKind": "event",
          "problem": "OrderCreatedEvent",
          "concept": "EventPublisherService",
          "check": "Published event",
          "codePointIds": [
            "publish-consume",
            "event-dto"
          ]
        },
        {
          "order": 5,
          "actor": "Message Broker",
          "input": "Published event",
          "owner": "NotificationConsumer",
          "action": "소비자가 이벤트를 받아 알림 기록으로 연결합니다.",
          "output": "Notification log",
          "note": "소비자는 후속 작업 책임을 독립적으로 수행합니다.",
          "id": "order-event-flow-step-5",
          "from": "Message Broker",
          "to": "NotificationConsumer",
          "message": "소비자가 이벤트를 받아 알림 기록으로 연결합니다.",
          "messageKind": "event",
          "problem": "Published event",
          "concept": "NotificationConsumer",
          "check": "Notification log",
          "codePointIds": [
            "event-dto",
            "publish-consume"
          ]
        }
      ],
      "bandKind": "scenario"
    },
    {
      "id": "direct-vs-event",
      "title": "직접 호출과 이벤트 전달 비교",
      "summary": "직접 호출은 단순하고 추적이 쉽지만, 후속 작업이 늘어날 때 발행자 책임이 커질 수 있습니다.",
      "steps": [
        {
          "order": 1,
          "actor": "OrderService",
          "input": "Order created",
          "owner": "Direct call",
          "action": "NotificationService를 직접 호출합니다.",
          "output": "Immediate follow-up",
          "note": "단순하지만 주문 서비스가 알림 구현을 알게 됩니다.",
          "id": "direct-vs-event-step-1",
          "from": "OrderService",
          "to": "Direct call",
          "message": "NotificationService를 직접 호출합니다.",
          "messageKind": "request",
          "problem": "Order created",
          "concept": "Direct call",
          "check": "Immediate follow-up",
          "codePointIds": [
            "event-dto",
            "publish-consume"
          ]
        },
        {
          "order": 2,
          "actor": "OrderService",
          "input": "Order created",
          "owner": "Event publish",
          "action": "OrderCreatedEvent를 발행합니다.",
          "output": "Event message",
          "note": "후속 작업은 이벤트 소비자가 맡도록 흐름을 분리합니다.",
          "id": "direct-vs-event-step-2",
          "from": "OrderService",
          "to": "Event publish",
          "message": "OrderCreatedEvent를 발행합니다.",
          "messageKind": "event",
          "problem": "Order created",
          "concept": "Event publish",
          "check": "Event message",
          "codePointIds": [
            "publish-consume",
            "event-dto"
          ]
        },
        {
          "order": 3,
          "actor": "NotificationConsumer",
          "input": "Event message",
          "owner": "Follow-up action",
          "action": "알림 기록을 남깁니다.",
          "output": "Notification result",
          "note": "후속 작업이 늘어날수록 이벤트 전달의 분리 이점이 커집니다.",
          "id": "direct-vs-event-step-3",
          "from": "NotificationConsumer",
          "to": "Follow-up action",
          "message": "알림 기록을 남깁니다.",
          "messageKind": "event",
          "problem": "Event message",
          "concept": "Follow-up action",
          "check": "Notification result",
          "codePointIds": [
            "event-dto",
            "publish-consume"
          ]
        },
        {
          "id": "direct-vs-event-check-4",
          "order": 4,
          "actor": "Follow-up action",
          "owner": "확인 지점",
          "from": "Follow-up action",
          "to": "확인 지점",
          "message": "결과와 실패 지점을 확인합니다.",
          "messageKind": "response",
          "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
          "concept": "Verification",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "publish-consume"
          ]
        }
      ],
      "bandKind": "scenario"
    }
  ],
  "flow": [
    {
      "id": "order-event-flow-step-1",
      "label": "OrderEventController",
      "problem": "POST /event-orders",
      "concept": "OrderEventController",
      "action": "주문 생성 요청을 Service로 전달합니다.",
      "check": "Order request",
      "codePointIds": [
        "event-dto",
        "publish-consume"
      ]
    },
    {
      "id": "order-event-flow-step-2",
      "label": "OrderService",
      "problem": "Order request",
      "concept": "OrderService",
      "action": "주문 id와 주문 생성 결과를 만듭니다.",
      "check": "Order result",
      "codePointIds": [
        "publish-consume",
        "event-dto"
      ]
    },
    {
      "id": "order-event-flow-step-3",
      "label": "OrderCreatedEvent",
      "problem": "Order result",
      "concept": "OrderCreatedEvent",
      "action": "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.",
      "check": "Event DTO",
      "codePointIds": [
        "event-dto",
        "publish-consume"
      ]
    },
    {
      "id": "order-event-flow-step-4",
      "label": "EventPublisherService",
      "problem": "OrderCreatedEvent",
      "concept": "EventPublisherService",
      "action": "이벤트 발행 책임만 맡깁니다.",
      "check": "Published event",
      "codePointIds": [
        "publish-consume",
        "event-dto"
      ]
    },
    {
      "id": "order-event-flow-step-5",
      "label": "NotificationConsumer",
      "problem": "Published event",
      "concept": "NotificationConsumer",
      "action": "소비자가 이벤트를 받아 알림 기록으로 연결합니다.",
      "check": "Notification log",
      "codePointIds": [
        "event-dto",
        "publish-consume"
      ]
    }
  ],
  "codePoints": [
    {
      "id": "event-dto",
      "title": "Event DTO는 후속 처리에 필요한 최소 정보만 담습니다",
      "file": "src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt",
      "language": "kotlin",
      "snippet": "data class OrderCreatedEvent(\n    val orderId: Long,\n    val userId: String,\n    val productName: String\n)",
      "explanation": "이벤트는 전체 주문 객체가 아니라 소비자가 필요한 최소 정보만 전달합니다.",
      "check": "불필요한 내부 상태를 이벤트 payload에 넣지 않았는지 봅니다."
    },
    {
      "id": "publish-consume",
      "title": "발행자와 소비자는 queue를 사이에 두고 분리됩니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt",
      "language": "kotlin",
      "snippet": "fun publishOrderCreated(event: OrderCreatedEvent) {\n    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)\n}",
      "explanation": "주문 생성 흐름은 이벤트를 발행하고, 알림 처리는 `src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`의 별도 소비자가 맡습니다.",
      "check": "현재 예제에는 영속 주문 저장이 없으며 저장·발행 원자성은 후속 outbox 주제임을 구분합니다."
    }
  ],
  "concepts": [
    {
      "title": "이벤트는 사실을 전달합니다",
      "body": "주문이 생성되었다는 결과를 후속 작업이 이해할 수 있는 메시지로 표현합니다."
    },
    {
      "title": "발행자와 소비자를 분리합니다",
      "body": "주문 흐름은 이벤트를 발행하고, 알림 흐름은 이벤트를 소비합니다."
    },
    {
      "title": "직접 호출은 나쁜 것이 아닙니다",
      "body": "즉시 결과와 같은 트랜잭션 처리가 필요하면 직접 호출이 더 단순할 수 있습니다."
    },
    {
      "title": "후속 작업이 늘면 이벤트를 검토합니다",
      "body": "알림, 로그, 분석, 포인트처럼 나중에 처리해도 되는 작업을 분리할 수 있습니다."
    }
  ],
  "practice": [
    "주문 서비스가 알림 처리 세부 내용을 직접 알아야 할까요?",
    "OrderCreatedEvent에 어떤 최소 정보가 들어가야 하는지 설명할 수 있나요?",
    "직접 호출이 더 단순한 상황과 이벤트가 더 적합한 상황을 구분할 수 있나요?",
    "소비자가 이벤트를 받아 어떤 후속 작업으로 연결하는지 설명할 수 있나요?"
  ],
  "mentorHints": [],
  "relatedDocs": [],
  "relatedCode": [],
  "sequences": [
    {
      "id": "12",
      "title": "Event Driven",
      "topic": "Message queue and event-driven thinking",
      "question": "주문 생성 후 알림, 로그, 포인트 같은 후속 작업을 주문 흐름이 모두 알아야 할까?",
      "goal": "동기 직접 호출과 이벤트 전달을 비교하고, 이벤트 발행자와 소비자의 책임을 작은 예제로 이해합니다.",
      "source": {
        "theory": "../../../theory.md",
        "implementation": "../../../implementation.md",
        "checklist": "../../../checklist.md"
      },
      "why": {
        "problem": "주문 생성 메서드가 알림 처리까지 직접 호출하면 후속 작업이 늘어날수록 주문 흐름이 여러 구현 세부사항을 알게 됩니다.",
        "limits": [
          "주문 생성 실패와 후속 알림 실패를 같은 흐름에서 처리하면 책임 경계가 모호해집니다.",
          "후속 작업이 늘어날수록 주문 서비스 수정 범위가 커집니다.",
          "서비스가 나뉘는 환경에서는 한 서비스 장애가 다른 서비스 요청 흐름까지 끌고 들어올 수 있습니다."
        ],
        "choice": "주문 생성 결과를 이벤트로 표현하고, 소비자가 알림 기록 같은 후속 작업을 맡는 구조로 책임을 분리합니다."
      },
      "overview": [
        "POST /event-orders",
        "OrderService",
        "OrderCreatedEvent",
        "EventPublisherService",
        "Message Broker",
        "NotificationConsumer",
        "Notification Log"
      ],
      "flows": [
        {
          "id": "order-event-flow",
          "title": "주문 생성과 이벤트 전달 흐름",
          "summary": "API 요청은 주문 생성 결과를 만들고, 그 결과가 이벤트로 발행되어 소비자의 후속 작업으로 이어집니다.",
          "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as OrderEventController\n  participant Order as OrderService\n  participant Publisher as EventPublisherService\n  participant Broker as Message Broker\n  participant Consumer as NotificationConsumer\n  participant Log as Notification Log\n  Client->>Controller: POST /event-orders\n  Controller->>Order: create order\n  Order-->>Controller: order result\n  Order->>Publisher: publish OrderCreatedEvent\n  Publisher->>Broker: send event\n  Broker-->>Consumer: deliver event\n  Consumer->>Log: save notification record\n  Controller-->>Client: order response",
          "steps": [
            {
              "order": 1,
              "actor": "Client",
              "input": "POST /event-orders",
              "owner": "OrderEventController",
              "action": "주문 생성 요청을 Service로 전달합니다.",
              "output": "Order request",
              "note": "API 응답 흐름은 주문 생성 자체에 집중합니다.",
              "id": "order-event-flow-step-1",
              "from": "Client",
              "to": "OrderEventController",
              "message": "주문 생성 요청을 Service로 전달합니다.",
              "messageKind": "request",
              "problem": "POST /event-orders",
              "concept": "OrderEventController",
              "check": "Order request",
              "codePointIds": [
                "event-dto",
                "publish-consume"
              ]
            },
            {
              "order": 2,
              "actor": "OrderEventController",
              "input": "Order request",
              "owner": "OrderService",
              "action": "주문 id와 주문 생성 결과를 만듭니다.",
              "output": "Order result",
              "note": "주문 서비스는 후속 알림 세부 구현을 직접 알 필요를 줄입니다.",
              "id": "order-event-flow-step-2",
              "from": "OrderEventController",
              "to": "OrderService",
              "message": "주문 id와 주문 생성 결과를 만듭니다.",
              "messageKind": "event",
              "problem": "Order request",
              "concept": "OrderService",
              "check": "Order result",
              "codePointIds": [
                "publish-consume",
                "event-dto"
              ]
            },
            {
              "order": 3,
              "actor": "OrderService",
              "input": "Order result",
              "owner": "OrderCreatedEvent",
              "action": "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.",
              "output": "Event DTO",
              "note": "이벤트 필드가 많아질수록 소비자가 발행자 내부 모델에 의존하기 쉽습니다.",
              "id": "order-event-flow-step-3",
              "from": "OrderService",
              "to": "OrderCreatedEvent",
              "message": "후속 작업이 알아야 할 최소 사실을 이벤트로 표현합니다.",
              "messageKind": "event",
              "problem": "Order result",
              "concept": "OrderCreatedEvent",
              "check": "Event DTO",
              "codePointIds": [
                "event-dto",
                "publish-consume"
              ]
            },
            {
              "order": 4,
              "actor": "OrderService",
              "input": "OrderCreatedEvent",
              "owner": "EventPublisherService",
              "action": "이벤트 발행 책임만 맡깁니다.",
              "output": "Published event",
              "note": "발행자는 후속 작업의 구현 세부사항을 직접 호출하지 않습니다.",
              "id": "order-event-flow-step-4",
              "from": "OrderService",
              "to": "EventPublisherService",
              "message": "이벤트 발행 책임만 맡깁니다.",
              "messageKind": "event",
              "problem": "OrderCreatedEvent",
              "concept": "EventPublisherService",
              "check": "Published event",
              "codePointIds": [
                "publish-consume",
                "event-dto"
              ]
            },
            {
              "order": 5,
              "actor": "Message Broker",
              "input": "Published event",
              "owner": "NotificationConsumer",
              "action": "소비자가 이벤트를 받아 알림 기록으로 연결합니다.",
              "output": "Notification log",
              "note": "소비자는 후속 작업 책임을 독립적으로 수행합니다.",
              "id": "order-event-flow-step-5",
              "from": "Message Broker",
              "to": "NotificationConsumer",
              "message": "소비자가 이벤트를 받아 알림 기록으로 연결합니다.",
              "messageKind": "event",
              "problem": "Published event",
              "concept": "NotificationConsumer",
              "check": "Notification log",
              "codePointIds": [
                "event-dto",
                "publish-consume"
              ]
            }
          ],
          "bandKind": "scenario"
        },
        {
          "id": "direct-vs-event",
          "title": "직접 호출과 이벤트 전달 비교",
          "summary": "직접 호출은 단순하고 추적이 쉽지만, 후속 작업이 늘어날 때 발행자 책임이 커질 수 있습니다.",
          "steps": [
            {
              "order": 1,
              "actor": "OrderService",
              "input": "Order created",
              "owner": "Direct call",
              "action": "NotificationService를 직접 호출합니다.",
              "output": "Immediate follow-up",
              "note": "단순하지만 주문 서비스가 알림 구현을 알게 됩니다.",
              "id": "direct-vs-event-step-1",
              "from": "OrderService",
              "to": "Direct call",
              "message": "NotificationService를 직접 호출합니다.",
              "messageKind": "request",
              "problem": "Order created",
              "concept": "Direct call",
              "check": "Immediate follow-up",
              "codePointIds": [
                "event-dto",
                "publish-consume"
              ]
            },
            {
              "order": 2,
              "actor": "OrderService",
              "input": "Order created",
              "owner": "Event publish",
              "action": "OrderCreatedEvent를 발행합니다.",
              "output": "Event message",
              "note": "후속 작업은 이벤트 소비자가 맡도록 흐름을 분리합니다.",
              "id": "direct-vs-event-step-2",
              "from": "OrderService",
              "to": "Event publish",
              "message": "OrderCreatedEvent를 발행합니다.",
              "messageKind": "event",
              "problem": "Order created",
              "concept": "Event publish",
              "check": "Event message",
              "codePointIds": [
                "publish-consume",
                "event-dto"
              ]
            },
            {
              "order": 3,
              "actor": "NotificationConsumer",
              "input": "Event message",
              "owner": "Follow-up action",
              "action": "알림 기록을 남깁니다.",
              "output": "Notification result",
              "note": "후속 작업이 늘어날수록 이벤트 전달의 분리 이점이 커집니다.",
              "id": "direct-vs-event-step-3",
              "from": "NotificationConsumer",
              "to": "Follow-up action",
              "message": "알림 기록을 남깁니다.",
              "messageKind": "event",
              "problem": "Event message",
              "concept": "Follow-up action",
              "check": "Notification result",
              "codePointIds": [
                "event-dto",
                "publish-consume"
              ]
            },
            {
              "id": "direct-vs-event-check-4",
              "order": 4,
              "actor": "Follow-up action",
              "owner": "확인 지점",
              "from": "Follow-up action",
              "to": "확인 지점",
              "message": "결과와 실패 지점을 확인합니다.",
              "messageKind": "response",
              "problem": "구현 후 실제로 어느 지점이 통과했는지 확인해야 합니다.",
              "concept": "Verification",
              "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
              "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
              "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
              "codePointIds": [
                "publish-consume"
              ]
            }
          ],
          "bandKind": "scenario"
        }
      ],
      "responsibilities": [
        {
          "name": "OrderEventController",
          "role": "주문 생성 API 요청과 응답 경계를 담당합니다.",
          "caution": "알림 기록 세부 구현을 직접 알지 않습니다."
        },
        {
          "name": "OrderService",
          "role": "주문 생성 결과를 만들고 이벤트로 표현합니다.",
          "caution": "후속 작업 구현을 직접 호출하는 책임을 줄입니다."
        },
        {
          "name": "OrderCreatedEvent",
          "role": "후속 작업이 이해해야 할 최소 사실을 담는 메시지입니다.",
          "caution": "발행자의 내부 모델 전체를 담지 않습니다."
        },
        {
          "name": "EventPublisherService",
          "role": "이벤트 발행 책임을 담당합니다.",
          "caution": "소비자의 후속 작업 구현을 직접 수행하지 않습니다."
        },
        {
          "name": "NotificationConsumer",
          "role": "이벤트를 받아 알림 기록 같은 후속 작업을 수행합니다.",
          "caution": "주문 생성 API 응답 흐름과 분리해서 봅니다."
        }
      ],
      "concepts": [
        {
          "title": "이벤트는 사실을 전달합니다",
          "body": "주문이 생성되었다는 결과를 후속 작업이 이해할 수 있는 메시지로 표현합니다."
        },
        {
          "title": "발행자와 소비자를 분리합니다",
          "body": "주문 흐름은 이벤트를 발행하고, 알림 흐름은 이벤트를 소비합니다."
        },
        {
          "title": "직접 호출은 나쁜 것이 아닙니다",
          "body": "즉시 결과와 같은 트랜잭션 처리가 필요하면 직접 호출이 더 단순할 수 있습니다."
        },
        {
          "title": "후속 작업이 늘면 이벤트를 검토합니다",
          "body": "알림, 로그, 분석, 포인트처럼 나중에 처리해도 되는 작업을 분리할 수 있습니다."
        }
      ],
      "glossary": [
        {
          "term": "Event",
          "meaning": "도메인에서 이미 일어난 사실을 표현하는 메시지입니다.",
          "caution": "명령처럼 소비자에게 무엇을 하라고 세부 지시하지 않습니다."
        },
        {
          "term": "Producer",
          "meaning": "이벤트를 만드는 쪽입니다.",
          "caution": "후속 작업 구현을 직접 알기 시작하면 결합이 커집니다."
        },
        {
          "term": "Consumer",
          "meaning": "이벤트를 받아 후속 작업을 수행하는 쪽입니다.",
          "caution": "발행자 내부 모델에 과하게 의존하지 않아야 합니다."
        },
        {
          "term": "Message Broker",
          "meaning": "발행자와 소비자 사이에서 메시지를 전달하는 중간 계층입니다.",
          "caution": "이번 범위는 브로커 운영 전체가 아니라 전달 사고를 이해하는 것입니다."
        },
        {
          "term": "Follow-up action",
          "meaning": "주문 생성 이후 알림, 로그, 분석처럼 이어지는 작업입니다.",
          "caution": "요청자가 즉시 알아야 하는 결과와 구분합니다."
        }
      ],
      "practical": [
        {
          "title": "이벤트가 항상 더 좋은 선택은 아닙니다",
          "body": "즉시 결과가 필요하거나 같은 실패 흐름에서 처리해야 한다면 직접 호출이 더 단순합니다."
        },
        {
          "title": "이벤트 필드는 최소로 둡니다",
          "body": "필드가 많아질수록 소비자가 발행자의 내부 모델에 강하게 의존합니다."
        },
        {
          "title": "운영 메시징은 별도 학습 범위입니다",
          "body": "재시도, 중복 처리, 순서 보장, 장애 복구는 이벤트 사고 이후에 다룰 주제입니다."
        }
      ],
      "checks": [
        "주문 서비스가 알림 처리 세부 내용을 직접 알아야 할까요?",
        "OrderCreatedEvent에 어떤 최소 정보가 들어가야 하는지 설명할 수 있나요?",
        "직접 호출이 더 단순한 상황과 이벤트가 더 적합한 상황을 구분할 수 있나요?",
        "소비자가 이벤트를 받아 어떤 후속 작업으로 연결하는지 설명할 수 있나요?"
      ],
      "next": {
        "id": "Complete",
        "title": "Course Review",
        "reason": "이벤트 기반 사고까지 다루면 요청/응답, 저장, 검증, 인증, 캐시, 실시간, 배포, 리팩토링, 후속 작업 분리까지 백엔드 흐름 전체를 다시 연결해 볼 수 있습니다."
      },
      "sourceDocs": [],
      "actors": [
        {
          "id": "client",
          "label": "Client",
          "kind": "client"
        },
        {
          "id": "order",
          "label": "OrderService",
          "kind": "server"
        },
        {
          "id": "publisher",
          "label": "EventPublisherService",
          "kind": "queue"
        },
        {
          "id": "broker",
          "label": "RabbitMQ",
          "kind": "queue"
        },
        {
          "id": "consumer",
          "label": "NotificationConsumer",
          "kind": "logic"
        },
        {
          "id": "notification",
          "label": "NotificationService",
          "kind": "logic"
        }
      ],
      "codePoints": [
        {
          "id": "event-dto",
          "title": "Event DTO는 후속 처리에 필요한 최소 정보만 담습니다",
          "file": "src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt",
          "language": "kotlin",
          "snippet": "data class OrderCreatedEvent(\n    val orderId: Long,\n    val userId: String,\n    val productName: String\n)",
          "explanation": "이벤트는 전체 주문 객체가 아니라 소비자가 필요한 최소 정보만 전달합니다.",
          "check": "불필요한 내부 상태를 이벤트 payload에 넣지 않았는지 봅니다."
        },
        {
          "id": "publish-consume",
          "title": "발행자와 소비자는 queue를 사이에 두고 분리됩니다",
          "file": "src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt",
          "language": "kotlin",
          "snippet": "fun publishOrderCreated(event: OrderCreatedEvent) {\n    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)\n}",
          "explanation": "주문 생성 흐름은 이벤트를 발행하고, 알림 처리는 `src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`의 별도 소비자가 맡습니다.",
          "check": "현재 예제에는 영속 주문 저장이 없으며 저장·발행 원자성은 후속 outbox 주제임을 구분합니다."
        }
      ],
      "problem": "주문 생성 메서드가 알림 처리까지 직접 호출하면 후속 작업이 늘어날수록 주문 흐름이 여러 구현 세부사항을 알게 됩니다."
    }
  ]
};
