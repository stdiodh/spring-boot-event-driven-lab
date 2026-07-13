# 이벤트 기반 사고 확장

## 1. 주문 생성 뒤에 일이 늘어나면 무엇이 문제일까?

처음에는 주문을 만들고 응답을 주는 흐름만 있어도 됩니다.
하지만 주문 생성 뒤에 알림, 로그, 분석 같은 후속 작업이 계속 늘어나면 주문 서비스가 너무 많은 일을 알게 됩니다.

예를 들어 주문 서비스가 알림 전송, 로그 저장, 분석 적재를 모두 직접 호출하면 주문 생성 코드가 후속 작업의 세부 구현에 묶입니다.
후속 작업 하나가 바뀔 때마다 주문 생성 흐름까지 함께 확인해야 합니다.

이번 시퀀스는 이 문제를 이벤트로 분리하는 방법을 다룹니다.
이벤트는 "주문이 생성되었다"는 사실을 후속 작업 쪽에 전달하는 선택지입니다.

## 2. 이벤트는 모든 상황의 정답일까?

이벤트 기반 구조가 항상 좋은 선택은 아닙니다.
흐름이 단순한 기능에서는 직접 호출이 더 읽기 쉽고, 실패 지점도 찾기 쉽습니다.

이벤트를 쓰면 발행자와 소비자를 분리할 수 있지만, 메시지 브로커 운영, 재시도, 중복 처리, 순서 보장 같은 문제가 함께 생깁니다.
따라서 이번 실습의 목표는 이벤트를 정답처럼 외우는 것이 아니라, 후속 작업을 분리해야 할 때 어떤 선택지가 있는지 이해하는 것입니다.

## 3. 이번 코드의 흐름

이번 실습은 아래 흐름을 확인합니다.

```text
POST /event-orders
-> OrderService
-> OrderCreatedEvent
-> EventPublisherService
-> RabbitMQ
-> NotificationConsumer
-> NotificationService
-> GET /event-orders/notifications
```

주문 생성 요청은 `POST /event-orders`로 들어옵니다.
`OrderService`는 주문 번호를 만들고 `OrderCreatedEvent`를 생성합니다.
`EventPublisherService`는 이벤트를 RabbitMQ로 보내고, `NotificationConsumer`는 이벤트를 받아 알림 기록을 남깁니다.
알림 결과는 `GET /event-orders/notifications`로 확인합니다.

## 4. 핵심 코드로 연결하기

실제 파일 경로는 아래와 같습니다.

- `src/main/kotlin/com/andi/rest_crud/controller/OrderEventController.kt`: `POST /event-orders`, `GET /event-orders/notifications` API 입구입니다.
- `src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt`: 주문 생성 사실을 담는 이벤트 DTO입니다.
- `src/main/kotlin/com/andi/rest_crud/service/OrderService.kt`: 주문 생성 뒤 이벤트를 만듭니다.
- `src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt`: 이벤트를 RabbitMQ로 발행합니다.
- `src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`: queue에서 이벤트를 소비합니다.
- `src/main/kotlin/com/andi/rest_crud/service/NotificationService.kt`: 소비된 이벤트를 알림 기록으로 저장합니다.
- `src/main/kotlin/com/andi/rest_crud/config/EventConfig.kt`: exchange, queue, binding을 설정합니다.

왜 이 코드를 보는지 먼저 정리합니다.
주문 생성 코드가 알림 저장 방식을 직접 알지 않게 하려면 발행자와 소비자를 분리해야 합니다.

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

이 코드는 주문 생성 결과를 후속 작업으로 전달하는 문제를 해결합니다.
발행자는 이벤트를 보내고, 알림 기록은 소비자가 맡습니다.

## 5. 핵심 개념

### 동기 호출

동기 호출은 한 코드가 다른 코드를 직접 호출하고 결과를 기다리는 방식입니다.
흐름이 짧고 명확하지만, 후속 작업이 늘어나면 호출 관계가 촘촘해집니다.

### 이벤트

이벤트는 이미 일어난 사실을 담은 메시지입니다.
이번 코드에서는 `OrderCreatedEvent`가 주문 생성 사실을 담습니다.

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String
)
```

이 이벤트는 후속 작업이 필요한 최소 정보만 담습니다.
알림 소비자는 이 메시지를 보고 알림 기록을 만들 수 있습니다.

### 발행자와 소비자

발행자는 이벤트를 보냅니다.
소비자는 이벤트를 받아 자기 책임을 처리합니다.

이번 코드에서는 `EventPublisherService`가 발행자 역할을 하고, `NotificationConsumer`가 소비자 역할을 합니다.
주문 생성 코드는 알림 저장 방식까지 직접 알지 않아도 됩니다.

### 메시지 큐

메시지 큐는 발행자와 소비자 사이에서 이벤트를 전달합니다.
이번 실습에서는 RabbitMQ 설정을 사용하지만, 목표는 운영 심화가 아니라 발행과 소비 흐름을 읽는 것입니다.

## 6. 실행/테스트 결과로 확인할 것

`docker compose up -d`로 RabbitMQ를 실행하고 `./gradlew test`로 발행/소비 테스트를 확인합니다.
서버 실행 후 `POST /event-orders`를 호출하고 `GET /event-orders/notifications`로 소비 결과를 확인합니다.

## 7. 한계와 다음 개선 방향

이번 구조는 후속 작업 분리를 보여주는 최소 예시입니다.
운영 환경에서는 메시지 중복, 재시도, 순서, 실패 보상, 모니터링 기준을 추가로 설계해야 합니다.

## 8. 확인 질문

- 주문 생성 뒤 알림, 로그, 분석이 늘어나면 주문 서비스가 어떤 일을 너무 많이 알게 되나요?
- `OrderCreatedEvent`에는 왜 주문 생성 사실과 후속 처리에 필요한 값만 담나요?
- `EventPublisherService`와 `NotificationConsumer`를 나누면 어떤 의존이 줄어드나요?
- 이벤트 기반 구조를 쓰면 어떤 운영 복잡도가 추가되나요?
- 이번 상황에서 직접 호출과 이벤트 전달 중 어떤 방식이 더 적절한지 설명할 수 있나요?
