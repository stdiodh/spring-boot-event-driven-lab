window.visualLabData = {
  "kind": "sequence",
  "sequence": "12",
  "title": "Event Driven",
  "subtitle": "Message queue and event-driven thinking",
  "goal": "동기 직접 호출과 이벤트 전달을 비교하고, 이벤트 발행자와 소비자의 책임을 작은 예제로 이해합니다.",
  "problem": "주문 생성 메서드가 알림 처리까지 직접 호출하면 후속 작업이 늘어날수록 주문 흐름이 여러 구현 세부사항을 알게 됩니다.",
  "workbench": {
    "kind": "event",
    "title": "응답과 이벤트가 갈라지는 과정",
    "instruction": "직접 호출과 broker 전달을 비교하고, 현재 예제가 실제로 확인하는 발행·소비·중복 방지 범위를 구분하세요.",
    "visual": {
      "src": "../../assets/diagrams/12-response-event-fork.svg",
      "alt": "POST event-orders 요청의 publish 시도 뒤 producer 정상 반환과 accepted·routed된 broker 전달이 두 경로로 갈라지며 두 완료 시점의 상대 순서는 정해지지 않은 흐름",
      "caption": "publish 시도 뒤 producer는 정상 반환 시 OrderResponse를 만들고, accepted·routed된 event는 broker 경로로 전달됩니다. HTTP 응답과 consumer 완료의 상대 순서는 보장되지 않습니다."
    },
    "terms": [
      { "term": "event", "meaning": "이미 발생한 사실을 다른 책임에 알리는 메시지" },
      { "term": "publisher", "meaning": "현재 책임에서 만든 event를 broker에 보내는 주체" },
      { "term": "broker", "meaning": "publisher와 consumer 사이에서 event를 라우팅하고 전달하는 중간 시스템" },
      { "term": "consumer", "meaning": "queue에서 event를 받아 후속 작업을 수행하는 주체" },
      { "term": "멱등성", "meaning": "같은 event를 여러 번 처리해도 결과가 한 번 처리한 것과 같게 만드는 성질" }
    ],
    "comparison": {
      "label": "요청 응답과 후속 이벤트 전달",
      "left": {
        "title": "HTTP response",
        "body": "OrderService는 publisher 호출이 반환된 다음 OrderResponse를 만듭니다. broker 이후 consumer 처리 완료를 기다리지는 않습니다."
      },
      "right": {
        "title": "event delivery",
        "body": "accepted·routed된 OrderCreatedEvent가 broker, queue, consumer로 전달되는 후속 작업 경로입니다. producer 정상 반환만으로 이 경로를 확정할 수 없습니다."
      }
    },
    "nodes": {
      "client": {
        "label": "Client",
        "icon": "client",
        "kind": "request actor",
        "role": "주문 생성과 알림 조회 요청",
        "systemLayer": "outside",
        "boundary": "HTTP client"
      },
      "order-controller": {
        "label": "OrderEventController",
        "icon": "api",
        "kind": "API boundary",
        "role": "POST 주문 요청과 GET 알림 조회 입구",
        "systemLayer": "interface",
        "boundary": "Request/response"
      },
      "order-service": {
        "label": "OrderService",
        "icon": "service",
        "kind": "producer service",
        "role": "AtomicLong id와 주문 결과, event 생성",
        "systemLayer": "application",
        "boundary": "Producer",
        "codePointIds": [
          "event-dto"
        ]
      },
      "event-publisher": {
        "label": "EventPublisherService",
        "icon": "event",
        "kind": "publisher",
        "role": "exchange와 routing key를 정해 전송 API 호출",
        "systemLayer": "integration",
        "boundary": "Producer",
        "codePointIds": [
          "event-publish"
        ]
      },
      "rabbit-template": {
        "label": "RabbitTemplate call",
        "icon": "event",
        "kind": "publisher client",
        "role": "convertAndSend 호출과 반환을 관찰하는 client-side 경계",
        "systemLayer": "integration",
        "boundary": "Publisher client",
        "codePointIds": [
          "event-publish"
        ]
      },
      "rabbit-exchange": {
        "label": "RabbitMQ exchange",
        "icon": "broker",
        "kind": "message router",
        "role": "routing key와 binding으로 queue 선택",
        "systemLayer": "integration",
        "boundary": "Broker"
      },
      "notification-queue": {
        "label": "Order event queue",
        "icon": "queue",
        "kind": "message queue",
        "role": "consumer가 받을 event 보관",
        "systemLayer": "integration",
        "boundary": "Broker"
      },
      "notification-consumer": {
        "label": "NotificationConsumer",
        "icon": "consumer",
        "kind": "event consumer",
        "role": "queue event를 받아 알림 책임 호출",
        "systemLayer": "interface",
        "boundary": "Consumer",
        "codePointIds": [
          "event-consume"
        ]
      },
      "notification-service": {
        "label": "NotificationService",
        "icon": "service",
        "kind": "consumer service",
        "role": "orderId 기준 알림 생성과 조회",
        "systemLayer": "application",
        "boundary": "Consumer",
        "codePointIds": [
          "notification-deduplicate"
        ]
      },
      "notification-memory": {
        "label": "ConcurrentHashMap",
        "icon": "memory",
        "kind": "process-local state",
        "role": "현재 process에서만 putIfAbsent 중복 방지",
        "systemLayer": "resource",
        "boundary": "In-memory state"
      },
      "notification-query": {
        "label": "GET notifications API",
        "icon": "api",
        "kind": "observation boundary",
        "role": "현재 process의 알림 결과 조회",
        "systemLayer": "interface",
        "boundary": "Observed result"
      },
      "duplicate-evidence": {
        "label": "Duplicate skipped in process",
        "icon": "evidence",
        "kind": "limited idempotency evidence",
        "role": "같은 orderId를 현재 process에서 한 건으로 유지",
        "systemLayer": "resource",
        "boundary": "In-memory evidence"
      },
      "consumer-unit-test": {
        "label": "NotificationConsumerTest",
        "icon": "test",
        "kind": "direct unit caller",
        "role": "broker와 HTTP 없이 consumer를 직접 호출하고 getAll을 확인",
        "systemLayer": "outside",
        "boundary": "Unit test"
      },
      "publish-failure": {
        "label": "Publish failure",
        "icon": "evidence",
        "kind": "failure evidence",
        "role": "generic 발행 예외로 응답은 중단되지만 broker 전달 상태는 미확정",
        "systemLayer": "integration",
        "boundary": "Producer"
      },
      "consumer-failure": {
        "label": "Consumer record failure",
        "icon": "evidence",
        "kind": "consumer-side failure evidence",
        "role": "record(event) 예외 · HTTP 응답과 별도 실패 경계",
        "systemLayer": "interface",
        "boundary": "Consumer"
      }
    },
    "scenarios": [
      {
        "id": "event-direct-call",
        "label": "후속 작업 1개·즉시 결과 필요",
        "flowId": "direct-vs-event",
        "visual": {
          "src": "../../assets/diagrams/12-direct-call.svg",
          "alt": "OrderService가 NotificationService를 직접 호출하고 즉시 결과를 받는 동기 경로",
          "caption": "후속 작업이 하나이고 즉시 결과가 필요할 때 직접 호출이 만드는 짧은 결합 경로입니다."
        },
        "tone": "signal",
        "prompt": "후속 작업이 하나이고 즉시 결과가 필요하다고 가정해 직접 호출 경로를 비교합니다.",
        "observationTitle": "호출자가 후속 작업의 즉시 결과를 기다리는 동기 경로",
        "theoryRef": "../../../theory.md#seq-12",
        "reflection": {
          "prompt": "직접 호출이 더 단순한 선택이 되는 조건을 적어보세요.",
          "hint": "후속 작업이 하나이고 즉시 결과가 필요한지 먼저 보세요."
        },
        "prediction": {
          "prompt": "후속 작업이 하나이고 즉시 결과가 필요하다면 어떤 연결이 먼저 적합할까요?",
          "options": [
            { "id": "direct", "label": "짧은 직접 호출부터 비교" },
            { "id": "event", "label": "항상 broker 이벤트 사용" },
            { "id": "both", "label": "두 경로를 동시에 실행" }
          ],
          "answer": "direct",
          "explanation": "이벤트는 결합을 줄이지만 운영 복잡도를 더합니다. 단순하고 즉시 결과가 필요한 흐름에서는 직접 호출도 유효합니다."
        },
        "route": [
          "OrderService",
          "Direct call",
          "NotificationService",
          "Notification result"
        ],
        "diagram": {
          "caption": "이 lane은 현재 RabbitMQ 구현 경로가 아니라, 즉시 결과가 필요한 단순한 후속 작업을 직접 호출할 때의 결합 관계를 비교합니다.",
          "lanes": [
            {
              "id": "direct-call-comparison",
              "label": "비교안 · 동기 직접 호출",
              "description": "OrderService가 알림 구현을 직접 알고 같은 호출 흐름에서 결과를 받습니다.",
              "steps": [
                {
                  "from": "order-service",
                  "to": "notification-service",
                  "verb": "후속 책임 직접 호출",
                  "payload": "NotificationService dependency + order created data",
                  "kind": "compare",
                  "concept": "동기 결합",
                  "effect": {
                    "kind": "transfer",
                    "subject": "동기 알림 호출",
                    "before": "OrderService가 주문 데이터와 NotificationService dependency를 직접 알고 있음",
                    "after": "같은 request thread에서 `NotificationService` 후속 작업이 실행됨"
                  },
                  "evidenceScope": "concept"
                },
                {
                  "from": "notification-service",
                  "to": "order-service",
                  "verb": "즉시 결과 반환",
                  "payload": "notification result",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "notification result",
                    "before": "NotificationService가 같은 call stack에서 알림 결과를 만듦",
                    "after": "OrderService가 후속 작업 완료 뒤에만 주문 흐름을 계속함"
                  },
                  "evidenceScope": "concept"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "RabbitMQ event path",
              "reason": "직접 호출의 장단점을 비교하기 위한 개념 lane이므로 broker 구현은 사용하지 않습니다."
            }
          ]
        },
        "snapshot": [
          {
            "label": "결합 관계",
            "value": "주문 흐름이 알림 구현을 직접 앎",
            "tone": "signal"
          },
          {
            "label": "후속 작업 경로",
            "value": "NotificationService 직접 호출",
            "tone": "warning"
          }
        ],
        "evidence": "직접 호출은 흐름이 짧고 실패 지점을 추적하기 쉽지만 OrderService가 후속 작업 구현에 결합됩니다.",
        "outcome": "단순한 흐름에서는 직접 호출도 유효한 선택이며 이벤트가 항상 정답은 아닙니다."
      },
      {
        "id": "event-broker-delivered",
        "label": "RabbitMQ 실행·주문 요청",
        "flowId": "order-event-flow",
        "visual": {
          "src": "../../assets/diagrams/12-response-event-fork.svg",
          "alt": "주문 HTTP 응답 경로와 RabbitMQ 이벤트 소비 경로가 분기되는 비동기 흐름",
          "caption": "publisher 호출 이후 HTTP 응답과 broker·consumer 처리가 서로 다른 시간선으로 갈라집니다."
        },
        "tone": "recovered",
        "prompt": "RabbitMQ를 실행한 상태에서 `POST /event-orders` 요청을 보냈습니다. publish 시도 뒤 두 경로가 어떻게 갈라질지 예측합니다.",
        "observationTitle": "producer continuation과 broker delivery의 상대 순서를 고정하지 않는 경로",
        "theoryRef": "../../../theory.md#seq-12",
        "reflection": {
          "prompt": "주문 응답이 기다리는 경계와 기다리지 않는 경계를 적어보세요.",
          "hint": "publisher 호출 반환은 consumer 완료를 뜻하지 않습니다."
        },
        "prediction": {
          "prompt": "HTTP 주문 응답은 consumer 처리 완료를 기다려야 할까요?",
          "options": [
            { "id": "wait", "label": "consumer 완료 뒤 응답" },
            { "id": "fork", "label": "응답 경로와 이벤트 경로가 분리" },
            { "id": "persist", "label": "DB 주문 저장 뒤에만 응답" }
          ],
          "answer": "fork",
          "explanation": "OrderService는 publisher 호출 정상 반환 뒤 OrderResponse를 만듭니다. 정상 반환은 broker acceptance를 확정하지 않고 HTTP 응답과 consumer 완료의 상대 순서도 보장하지 않습니다."
        },
        "route": [
          "POST /event-orders",
          "OrderEventController",
          "OrderService",
          "OrderCreatedEvent",
          "EventPublisherService",
          "RabbitTemplate publish 시도",
          "Producer: 정상 반환 → 201",
          "Broker: accepted·routed → consumer"
        ],
        "diagram": {
          "caption": "publish 시도 뒤 producer 정상 반환 경로와 accepted·routed된 broker 경로를 나눠 읽습니다. 두 경로는 공통 순번이 없으며 HTTP 응답과 consumer 완료의 상대 순서는 보장되지 않습니다.",
          "lanes": [
            {
              "id": "order-response-lane",
              "label": "Producer continuation · 정상 반환 시",
              "description": "RabbitTemplate 호출이 정상 반환하면 OrderResponse를 만들어 HTTP 201로 이어지는 producer 흐름입니다.",
              "steps": [
                {
                  "from": "client",
                  "to": "order-controller",
                  "verb": "주문 생성 요청",
                  "payload": "POST /event-orders · {userId, productName}",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "`OrderCreateRequest`",
                    "before": "Client가 userId와 productName JSON을 구성함",
                    "after": "OrderEventController에 `POST /event-orders`가 도착함"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "order-controller",
                  "to": "order-service",
                  "verb": "생성 위임",
                  "payload": "createOrder(request)",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "주문 생성 command",
                    "before": "Controller가 검증된 `OrderCreateRequest`를 보유함",
                    "after": "OrderService의 `createOrder(request)`가 실행됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "order-service",
                  "to": "event-publisher",
                  "verb": "발행 호출",
                  "payload": "publishOrderCreated(OrderCreatedEvent)",
                  "kind": "event",
                  "codePointIds": [
                    "event-dto"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "`OrderCreatedEvent`",
                    "before": "OrderService가 generated orderId와 정리된 request 값으로 event를 만듦",
                    "after": "EventPublisherService에 `publishOrderCreated(event)`가 전달됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "event-publisher",
                  "to": "order-service",
                  "verb": "호출 반환",
                  "payload": "publisher call returned · consumer completion not included",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "publisher call",
                    "before": "`RabbitTemplate.convertAndSend`가 예외 없이 끝남",
                    "after": "OrderService가 `OrderResponse`를 구성하지만 broker acceptance와 consumer 완료는 미확정으로 남음"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "order-service",
                  "to": "order-controller",
                  "verb": "결과 반환",
                  "payload": "OrderResponse { generated orderId, ORDER_CREATED }",
                  "kind": "response",
                  "check": "orderId는 AtomicLong으로 만들며 주문을 영속 저장하지 않습니다.",
                  "effect": {
                    "kind": "return",
                    "subject": "`OrderResponse`",
                    "before": "OrderService가 orderId와 `ORDER_CREATED` 상태를 구성함",
                    "after": "OrderEventController에 주문 생성 결과가 전달됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "order-controller",
                  "to": "client",
                  "verb": "HTTP 응답",
                  "payload": "201 + OrderResponse JSON",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "주문 생성 HTTP response",
                    "before": "OrderEventController에 `OrderResponse`가 준비됨",
                    "after": "Client에 `201 + OrderResponse JSON`이 반환됨"
                  },
                  "evidenceScope": "runtime"
                }
              ]
            },
            {
              "id": "event-delivery-lane",
              "label": "Broker delivery · accepted·routed된 경우",
              "description": "live runtime에서 accepted·routed된 event가 exchange, queue, consumer로 전달되는 별도 흐름입니다.",
              "steps": [
                {
                  "from": "event-publisher",
                  "to": "rabbit-template",
                  "verb": "전송 API 호출",
                  "payload": "convertAndSend(exchangeName, routingKey, event)",
                  "kind": "event",
                  "check": "publisher 단위 테스트는 RabbitTemplate mock의 convertAndSend 호출까지만 확인합니다.",
                  "codePointIds": [
                    "event-publish"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "RabbitTemplate client call",
                    "before": "EventPublisherService가 exchange 이름, routing key, `OrderCreatedEvent`를 보유함",
                    "after": "mock 단위 테스트가 `convertAndSend(..., event)` 호출을 확인하지만 JSON 변환과 exchange 도달은 확인하지 않음"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "rabbit-template",
                  "to": "rabbit-exchange",
                  "verb": "AMQP publish 시도",
                  "payload": "converted message · exchange · routing key",
                  "kind": "event",
                  "check": "JSON 변환, broker acceptance와 route는 live RabbitMQ 경로에서 별도로 관찰합니다.",
                  "effect": {
                    "kind": "transfer",
                    "subject": "live broker publish",
                    "before": "client-side 전송 API가 호출됐지만 외부 broker 상태는 미확인임",
                    "after": "live 실행에서 accepted·routed된 경우에만 exchange가 message를 다음 queue로 보냄"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "rabbit-exchange",
                  "to": "notification-queue",
                  "verb": "binding으로 route",
                  "payload": "routing key → order event queue",
                  "kind": "event",
                  "effect": {
                    "kind": "transfer",
                    "subject": "queue message",
                    "before": "exchange가 routing key를 binding과 대조함",
                    "after": "일치한 order event queue에 JSON message가 들어감"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-queue",
                  "to": "notification-consumer",
                  "verb": "event 전달",
                  "payload": "OrderCreatedEvent",
                  "kind": "event",
                  "effect": {
                    "kind": "transfer",
                    "subject": "`OrderCreatedEvent` delivery",
                    "before": "order event queue에 소비 대기 중인 message가 있음",
                    "after": "NotificationConsumer에 역직렬화된 event가 전달됨"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-consumer",
                  "to": "notification-service",
                  "verb": "알림 기록 위임",
                  "payload": "record(event)",
                  "kind": "call",
                  "codePointIds": [
                    "event-consume"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "알림 기록 command",
                    "before": "NotificationConsumer가 queue에서 받은 event를 보유함",
                    "after": "NotificationService의 `record(event)`가 실행됨"
                  },
                  "evidenceScope": "code"
                }
              ]
            },
            {
              "id": "notification-observation-lane",
              "label": "소비자 상태 → 조회 결과",
              "description": "현재 process의 map에 기록된 결과를 별도 GET 요청으로 확인합니다.",
              "steps": [
                {
                  "from": "notification-service",
                  "to": "notification-memory",
                  "verb": "중복 없이 기록",
                  "payload": "putIfAbsent(orderId, notification)",
                  "kind": "call",
                  "codePointIds": [
                    "notification-deduplicate"
                  ],
                  "check": "이 상태는 애플리케이션 process가 재시작되면 사라집니다.",
                  "effect": {
                    "kind": "persist",
                    "subject": "`orderId` 알림",
                    "before": "ConcurrentHashMap에 해당 orderId key가 없음",
                    "after": "`putIfAbsent`가 현재 process에 알림 한 건을 저장함"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "client",
                  "to": "notification-query",
                  "verb": "알림 조회",
                  "payload": "GET /event-orders/notifications",
                  "kind": "request",
                  "effect": {
                    "kind": "transfer",
                    "subject": "알림 조회 request",
                    "before": "Client 화면에는 consumer가 만든 알림 상태가 보이지 않음",
                    "after": "`GET /event-orders/notifications` 요청이 조회 API에 도착함"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-query",
                  "to": "notification-service",
                  "verb": "조회 위임",
                  "payload": "NotificationService.getAll()",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "알림 목록 query",
                    "before": "조회 API가 HTTP request를 해석함",
                    "after": "NotificationService의 `getAll()`이 실행됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "notification-service",
                  "to": "notification-memory",
                  "verb": "현재 상태 읽기",
                  "payload": "ConcurrentHashMap values",
                  "kind": "call",
                  "effect": {
                    "kind": "verify",
                    "subject": "process-local notification map",
                    "before": "NotificationService는 현재 map entry 수와 값을 아직 읽지 않음",
                    "after": "`ConcurrentHashMap.values`가 현재 process의 알림 목록을 제공함"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-memory",
                  "to": "notification-service",
                  "verb": "조회 결과 반환",
                  "payload": "in-memory notification list",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "in-memory notification list",
                    "before": "ConcurrentHashMap에 현재 process의 notification entry가 있음",
                    "after": "NotificationService에 정렬할 알림 목록이 전달됨"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-service",
                  "to": "notification-query",
                  "verb": "목록 반환",
                  "payload": "List<NotificationMessageResponse>",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "`List<NotificationMessageResponse>`",
                    "before": "NotificationService가 orderId 순서로 알림을 정렬함",
                    "after": "GET notifications API에 response list가 전달됨"
                  },
                  "evidenceScope": "runtime"
                },
                {
                  "from": "notification-query",
                  "to": "client",
                  "verb": "HTTP 응답",
                  "payload": "200 + notification list JSON",
                  "kind": "response",
                  "effect": {
                    "kind": "return",
                    "subject": "알림 목록 HTTP response",
                    "before": "GET notifications API에 현재 알림 목록이 있음",
                    "after": "Client에 `200 + notification list JSON`이 반환됨"
                  },
                  "evidenceScope": "runtime"
                }
              ]
            }
          ]
        },
        "snapshot": [
          {
            "label": "확인 범위",
            "value": "발행 호출 · 소비 결과 · 알림 조회",
            "tone": "recovered"
          },
          {
            "label": "영속 주문",
            "value": "저장하지 않음",
            "tone": "warning"
          },
          {
            "label": "HTTP · consumer 완료",
            "value": "상대 순서 미보장",
            "tone": "warning"
          }
        ],
        "evidence": "Publisher 단위 테스트는 RabbitTemplate mock의 `convertAndSend` 호출만, consumer 단위 테스트는 listener 메서드 직접 호출과 `getAll()`만 확인합니다. live POST 뒤 GET 알림 결과는 broker·consumer 동작의 수동 간접 증거입니다.",
        "outcome": "발행자와 소비자 책임은 분리되지만 broker acceptance, 완료 순서, 영속 주문 저장까지 단위 테스트로 검증한 것은 아닙니다."
      },
      {
        "id": "event-duplicate-delivery",
        "label": "같은 orderId 이벤트 2회",
        "flowId": "order-event-flow",
        "visual": {
          "src": "../../assets/diagrams/12-duplicate-idempotency.svg",
          "alt": "같은 orderId 이벤트 두 건이 process-local map에서 한 건으로 합쳐지는 중복 처리 흐름",
          "caption": "putIfAbsent는 현재 프로세스 안에서만 같은 orderId의 중복 알림을 막습니다."
        },
        "tone": "warning",
        "prompt": "같은 orderId 이벤트가 두 번 소비될 때 현재 중복 방지의 범위를 확인합니다.",
        "observationTitle": "같은 orderId를 process-local map에서 한 건으로 유지하는 경로",
        "theoryRef": "../../../theory.md#seq-12",
        "reflection": {
          "prompt": "현재 중복 방지가 유지되는 수명과 범위를 적어보세요.",
          "hint": "재시작과 다중 instance 뒤에는 같은 ConcurrentHashMap이 유지되지 않습니다."
        },
        "prediction": {
          "prompt": "putIfAbsent 중복 방지는 어디까지 유지될까요?",
          "options": [
            { "id": "process", "label": "현재 애플리케이션 프로세스" },
            { "id": "restart", "label": "재시작 뒤에도 영구 유지" },
            { "id": "broker", "label": "broker 전체에서 exactly-once 보장" }
          ],
          "answer": "process",
          "explanation": "ConcurrentHashMap은 현재 프로세스 메모리입니다. 재시작과 다중 instance를 넘는 영속 멱등성을 보장하지 않습니다."
        },
        "route": [
          "NotificationConsumerTest",
          "consumeOrderCreated(event) × 2",
          "NotificationService.putIfAbsent(orderId)",
          "NotificationService.getAll() · size 1"
        ],
        "diagram": {
          "caption": "중복 방지 목표 단위 테스트는 broker와 HTTP를 거치지 않고 consumer를 같은 event로 두 번 직접 호출한 뒤 NotificationService.getAll()의 size 1을 확인합니다.",
          "lanes": [
            {
              "id": "duplicate-consumption-lane",
              "label": "중복 전달 → process-local 방어",
              "description": "consumer가 같은 event를 다시 받아도 map key를 기준으로 현재 process 안에서만 중복을 막습니다.",
              "steps": [
                {
                  "from": "consumer-unit-test",
                  "to": "notification-consumer",
                  "verb": "consumer 직접 2회 호출",
                  "payload": "consumeOrderCreated(same event) × 2",
                  "kind": "call",
                  "effect": {
                    "kind": "transfer",
                    "subject": "중복 `OrderCreatedEvent`",
                    "before": "단위 테스트에 같은 orderId의 `OrderCreatedEvent` fixture가 있음",
                    "after": "NotificationConsumer의 public method가 같은 fixture로 두 번 직접 실행됨"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "notification-consumer",
                  "to": "notification-service",
                  "verb": "다시 처리",
                  "payload": "record(event)",
                  "kind": "call",
                  "codePointIds": [
                    "event-consume"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "두 번째 `record(event)`",
                    "before": "단위 테스트가 같은 event로 consumer 메서드를 두 번째 직접 호출함",
                    "after": "NotificationService가 같은 orderId로 `record`를 다시 실행함"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "notification-service",
                  "to": "notification-memory",
                  "verb": "조건부 기록",
                  "payload": "putIfAbsent(orderId)",
                  "kind": "call",
                  "codePointIds": [
                    "notification-deduplicate"
                  ],
                  "effect": {
                    "kind": "persist",
                    "subject": "`orderId` deduplication",
                    "before": "ConcurrentHashMap에 같은 orderId의 알림이 이미 있음",
                    "after": "`putIfAbsent`가 기존 entry를 유지해 두 번째 알림을 만들지 않음"
                  },
                  "evidenceScope": "test"
                },
                {
                  "from": "notification-service",
                  "to": "duplicate-evidence",
                  "verb": "getAll 결과 비교",
                  "payload": "NotificationService.getAll().size == 1",
                  "kind": "compare",
                  "check": "재시작, 다중 instance, 영속 저장소 멱등성은 확인하지 않습니다.",
                  "effect": {
                    "kind": "verify",
                    "subject": "process-local idempotency",
                    "before": "같은 orderId event를 두 번 직접 처리한 뒤 목록 size를 아직 읽지 않음",
                    "after": "`NotificationService.getAll()`이 알림 한 건만 반환함"
                  },
                  "evidenceScope": "test"
                }
              ]
            }
          ],
          "notReached": [
            {
              "label": "영속 멱등성",
              "reason": "ConcurrentHashMap은 process 재시작 뒤 상태를 유지하지 않습니다."
            }
          ]
        },
        "snapshot": [
          {
            "label": "중복 처리",
            "value": "현재 프로세스에서 알림 1건",
            "tone": "warning"
          },
          {
            "label": "재시작 이후",
            "value": "중복 방지 보장 없음",
            "tone": "warning"
          }
        ],
        "evidence": "중복 목표 단위 테스트는 consumer를 같은 event로 두 번 직접 호출한 뒤 `NotificationService.getAll().size == 1`을 확인합니다. HTTP와 live broker 증거는 포함하지 않습니다.",
        "outcome": "애플리케이션 재시작 뒤에도 유지되는 영속 멱등성을 보장하지 않습니다."
      },
      {
        "id": "event-publish-failed",
        "label": "publisher·consumer 실패 경계",
        "flowId": "order-event-flow",
        "visual": {
          "src": "../../assets/diagrams/12-failure-boundaries.svg",
          "alt": "publisher 예외와 consumer 기록 예외가 서로 다른 실행 경계에서 발생하는 흐름",
          "caption": "발행 실패의 전달 상태 unknown과 소비 실패의 독립 경계를 나누어 확인합니다."
        },
        "tone": "blocked",
        "prompt": "`convertAndSend` generic 예외와 별도의 consumer `record(event)` 예외를 비교합니다. 각 실패에서 확정할 수 있는 상태를 예측합니다.",
        "observationTitle": "publisher 예외의 전달 unknown과 consumer 예외의 독립 실패 경계를 비교하는 경로",
        "theoryRef": "../../../theory.md#seq-12",
        "reflection": {
          "prompt": "publisher와 consumer 실패에서 각각 확정할 수 없는 것을 적어보세요.",
          "hint": "publisher confirm, 영속 주문, outbox, retry, DLQ, 재전달은 구현·검증 범위가 아닙니다."
        },
        "prediction": {
          "prompt": "generic convertAndSend 예외만으로 확정할 수 있는 것은 무엇일까요?",
          "options": [
            { "id": "outbox", "label": "broker·queue 미도달 확정" },
            { "id": "atomic", "label": "consumer 재시도 확정" },
            { "id": "unresolved", "label": "OrderResponse 중단 · 전달 상태 unknown" }
          ],
          "answer": "unresolved",
          "explanation": "발행 예외면 OrderService 응답은 중단되지만 실패 시점이 불명확해 broker·queue 미도달은 확정할 수 없습니다. conversion-before-send가 확인된 경우에만 미전송으로 좁힙니다."
        },
        "route": [
          "실행 A · publisher 예외",
          "OrderResponse 중단 · delivery unknown",
          "실행 B · consumer record 예외",
          "알림 기록 실패 · 복구 정책 미확정"
        ],
        "diagram": {
          "caption": "서로 다른 두 실행을 비교합니다. 실행 A의 generic 발행 예외는 OrderResponse를 막지만 broker 전달은 unknown입니다. 실행 B의 consumer record 예외는 HTTP call stack과 분리되며 retry·DLQ·재전달 정책은 현재 근거로 확정하지 않습니다.",
          "lanes": [
            {
              "id": "publish-failure-lane",
              "label": "publisher 예외 → 응답 중단 · 전달 unknown",
              "description": "현재 예제에는 publisher confirm과 주문 영속 저장·발행을 묶는 원자적 경계가 없습니다.",
              "steps": [
                {
                  "from": "order-service",
                  "to": "event-publisher",
                  "verb": "발행 위임",
                  "payload": "publishOrderCreated(OrderCreatedEvent { orderId, request fields })",
                  "kind": "event",
                  "codePointIds": [
                    "event-dto",
                    "event-publish"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "`OrderCreatedEvent` publish",
                    "before": "OrderService가 generated orderId를 포함한 event를 만듦",
                    "after": "EventPublisherService가 exchange publish 책임을 맡음"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "event-publisher",
                  "to": "publish-failure",
                  "verb": "발행 호출 실패",
                  "payload": "generic convertAndSend exception",
                  "kind": "failure",
                  "check": "conversion-before-send가 확인된 경우만 미전송으로 좁히고 generic 예외에는 전달 unknown을 유지합니다.",
                  "effect": {
                    "kind": "gate",
                    "subject": "event delivery failure",
                    "before": "`convertAndSend`가 어느 시점에서 실패했는지와 broker acceptance가 확인되지 않음",
                    "after": "OrderService는 `OrderResponse`를 반환하지 못하지만 broker·queue 전달 상태는 unknown으로 남음"
                  },
                  "evidenceScope": "code"
                }
              ]
            },
            {
              "id": "consumer-failure-lane",
              "label": "별도 비교 · consumer record 예외",
              "description": "event가 consumer에 전달된 다른 실행에서 후속 기록 실패와 HTTP 응답 경계를 분리합니다.",
              "steps": [
                {
                  "from": "notification-consumer",
                  "to": "notification-service",
                  "verb": "알림 기록 위임",
                  "payload": "record(event)",
                  "kind": "call",
                  "codePointIds": [
                    "event-consume"
                  ],
                  "effect": {
                    "kind": "transfer",
                    "subject": "consumer 후속 작업",
                    "before": "NotificationConsumer가 전달된 event를 보유함",
                    "after": "NotificationService의 `record(event)`가 별도 consumer call stack에서 실행됨"
                  },
                  "evidenceScope": "code"
                },
                {
                  "from": "notification-service",
                  "to": "consumer-failure",
                  "verb": "record 예외",
                  "payload": "consumer-side failure",
                  "kind": "failure",
                  "check": "현재 설정과 테스트만으로 retry, DLQ, 재전달을 단정하지 않습니다.",
                  "effect": {
                    "kind": "gate",
                    "subject": "consumer 후속 처리",
                    "before": "consumer listener가 HTTP call stack과 별개로 `record(event)`를 호출함",
                    "after": "알림 기록은 실패하지만 HTTP 응답의 선후·성공 상태는 이 예외만으로 확정되지 않음"
                  },
                  "evidenceScope": "concept"
                }
              ]
            }
          ]
        },
        "snapshot": [
          {
            "label": "저장·발행 원자성",
            "value": "영속 저장·outbox 없음",
            "tone": "blocked"
          },
          {
            "label": "실행별 결과",
            "value": "publisher delivery unknown · consumer 기록 실패",
            "tone": "blocked"
          }
        ],
        "evidence": "단위 테스트는 publisher 호출과 consumer 직접 호출을 각각 확인할 뿐 generic 예외의 broker acceptance나 consumer 실패의 retry·DLQ를 검증하지 않습니다. 두 lane은 같은 실행의 연속 단계가 아닙니다.",
        "outcome": "Publisher 예외는 응답 중단만 확정하고 delivery는 unknown으로 남깁니다. 별도 실행의 consumer 예외는 HTTP와 분리해 보되 복구 정책을 추정하지 않습니다."
      }
    ]
  },
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
      "summary": "publish 시도 뒤 producer 정상 반환 경로와 accepted·routed된 broker 경로가 갈라집니다. broker acceptance와 HTTP 응답·consumer 완료의 상대 순서는 미확정입니다.",
      "mermaid": "sequenceDiagram\n  actor Client\n  participant Controller as OrderEventController\n  participant Order as OrderService\n  participant Publisher as EventPublisherService\n  participant Template as RabbitTemplate\n  participant Broker as Message Broker\n  participant Consumer as NotificationConsumer\n  participant Log as Notification Log\n  Client->>Controller: POST /event-orders\n  Controller->>Order: create order\n  Order->>Publisher: publish OrderCreatedEvent\n  Publisher->>Template: convertAndSend call\n  Template->>Broker: AMQP publish attempt\n  par producer continuation after normal return\n    Template-->>Publisher: normal return, acceptance unknown\n    Publisher-->>Order: publish call returned\n    Order-->>Client: 201 OrderResponse\n  and broker delivery if accepted and routed\n    Broker-->>Consumer: deliver event\n    Consumer->>Log: record notification\n  end\n  Note over Client,Consumer: response and consumer completion order is not guaranteed",
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
            "event-dto"
          ]
        },
        {
          "order": 2,
          "actor": "OrderEventController",
          "input": "Order request",
          "owner": "OrderService",
          "action": "주문 id와 OrderCreatedEvent를 만듭니다.",
          "output": "OrderCreatedEvent",
          "note": "현재 예제는 AtomicLong으로 id를 만들며 주문을 영속 저장하지 않습니다.",
          "id": "order-event-flow-step-2",
          "from": "OrderEventController",
          "to": "OrderService",
          "message": "주문 id와 OrderCreatedEvent를 만듭니다.",
          "messageKind": "call",
          "problem": "Order request",
          "concept": "OrderService",
          "check": "OrderCreatedEvent",
          "codePointIds": [
            "event-dto",
            "event-publish"
          ]
        },
        {
          "order": 3,
          "actor": "OrderService",
          "input": "OrderCreatedEvent",
          "owner": "EventPublisherService · RabbitTemplate",
          "action": "publisher가 RabbitTemplate의 convertAndSend를 호출합니다.",
          "output": "AMQP publish attempt",
          "note": "단위 테스트는 client-side 호출만 확인하며 broker acceptance를 확인하지 않습니다.",
          "id": "order-event-flow-step-3",
          "from": "OrderService",
          "to": "EventPublisherService · RabbitTemplate",
          "message": "이벤트 전송 API를 호출합니다.",
          "messageKind": "event",
          "problem": "OrderCreatedEvent",
          "concept": "Client-side publish call",
          "check": "RabbitTemplate call",
          "codePointIds": [
            "event-dto",
            "event-publish"
          ]
        },
        {
          "order": 4,
          "actor": "AMQP publish attempt",
          "input": "RabbitTemplate call",
          "owner": "Producer continuation · Broker delivery",
          "action": "정상 반환 뒤 HTTP 경로와 accepted·routed된 broker 경로를 따로 관찰합니다.",
          "output": "201 response · notification result",
          "note": "HTTP 응답과 consumer 완료에는 공통 순번이 없고 상대 순서도 보장되지 않습니다.",
          "id": "order-event-flow-step-4",
          "from": "AMQP publish attempt",
          "to": "Producer continuation · Broker delivery",
          "message": "두 독립 경로로 갈라집니다.",
          "messageKind": "event",
          "problem": "Publish attempt",
          "concept": "Independent completion order",
          "check": "HTTP · consumer 상대 순서 미보장",
          "codePointIds": [
            "event-publish",
            "event-consume",
            "notification-deduplicate"
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
            "notification-deduplicate"
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
            "event-publish",
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
            "event-consume",
            "notification-deduplicate"
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
          "concept": "결과 검증",
          "action": "문서의 확인 명령이나 화면에서 결과를 검증합니다.",
          "check": "성공 흐름과 실패 흐름을 말로 설명합니다.",
          "note": "Visual Lab은 코드를 대신 완성하지 않고 확인 지점을 고정합니다.",
          "codePointIds": [
            "notification-deduplicate"
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
        "event-dto"
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
        "event-dto",
        "event-publish"
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
        "event-publish"
      ]
    },
    {
      "id": "order-event-flow-step-4",
      "label": "Producer / broker fork",
      "problem": "OrderCreatedEvent",
      "concept": "Independent completion order",
      "action": "RabbitTemplate 호출 뒤 producer 정상 반환과 accepted·routed된 broker 전달을 별도 경로로 봅니다.",
      "check": "HTTP · consumer 상대 순서 미보장",
      "codePointIds": [
        "event-publish",
        "event-dto",
        "event-consume",
        "notification-deduplicate"
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
      "id": "event-publish",
      "title": "Publisher는 exchange와 routing key로 event 전송을 호출합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt",
      "language": "kotlin",
      "snippet": "fun publishOrderCreated(event: OrderCreatedEvent) {\n    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)\n}",
      "explanation": "실습 시작 코드에도 실제 호출이 이미 존재합니다. 정상 반환은 publisher confirm이 없어 broker acceptance나 route 성공을 확정하지 않습니다.",
      "check": "단위 테스트는 `convertAndSend` 호출만 확인하고 live broker 전달과 구분합니다."
    },
    {
      "id": "event-consume",
      "title": "Consumer는 queue event를 NotificationService에 위임합니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt",
      "language": "kotlin",
      "snippet": "@RabbitListener(queues = [\"\\${event.order.queue}\"])\nfun consumeOrderCreated(event: OrderCreatedEvent) {\n    notificationService.record(event)\n}",
      "explanation": "listener는 받은 event를 기록 책임으로 넘깁니다. 단위 테스트는 broker가 아니라 이 메서드를 직접 호출합니다.",
      "check": "Consumer 실패의 retry, DLQ, 재전달 여부를 현재 코드와 테스트만으로 단정하지 않습니다."
    },
    {
      "id": "notification-deduplicate",
      "title": "NotificationService는 현재 process에서 orderId 중복을 막습니다",
      "file": "src/main/kotlin/com/andi/rest_crud/service/NotificationService.kt",
      "language": "kotlin",
      "snippet": "notifications.putIfAbsent(\n    event.orderId,\n    NotificationMessageResponse(\n        orderId = event.orderId,\n        userId = event.userId,\n        message = \"주문 ${event.orderId}번(${event.productName})이 생성되었습니다.\"\n    )\n)",
      "explanation": "실제 코드는 별도 `notification` 변수를 만들지 않고 `putIfAbsent`에 응답 객체를 바로 전달합니다.",
      "check": "인메모리 중복 방지는 재시작과 다중 instance를 넘는 영속 멱등성이 아닙니다."
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
  "topic": "Message queue and event-driven thinking",
  "question": "주문 생성 후 알림, 로그, 포인트 같은 후속 작업을 주문 흐름이 모두 알아야 할까?",
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
  "sourceDocs": []
};
