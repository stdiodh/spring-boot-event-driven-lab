# 이벤트 기반 사고 확장 구현 가이드

## 이 도메인이 필요한 이유

이번 단계는 새 기능을 많이 만드는 것이 아니라, 직접 호출 말고 결과를 이벤트로 넘길 수도 있다는 사고를 익히는 것이 중요합니다.

## 실습에서 완성할 최종 흐름

1. `OrderCreatedEvent`를 만듭니다.
2. 주문 생성 흐름에서 이벤트를 발행합니다.
3. 소비자가 이벤트를 받아 알림을 기록합니다.
4. 주문 API와 알림 조회 API로 흐름을 실행해봅니다.
5. 동기 호출이었다면 어떤 점이 더 불편했을지 비교합니다.

주문과 알림이 서로 다른 서비스라고 가정했을 때도 같은 그림으로 설명할 수 있어야 합니다.

## 실습자가 직접 구현할 순서

1. 이벤트 DTO를 만듭니다.
2. 이벤트 발행 코드를 만듭니다.
3. 이벤트 소비 코드를 만듭니다.
4. 흐름을 실행해봅니다.
5. 동기/비동기 차이를 비교합니다.

## TODO를 넣을 파일

- `src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt`
- `src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`

## 각 파일의 역할

- `OrderCreatedEvent.kt`: 주문 생성 결과를 담아 다른 흐름으로 넘기는 이벤트 객체
- `EventPublisherService.kt`: 이벤트를 브로커로 보내는 역할
- `NotificationConsumer.kt`: 이벤트를 받아 후속 작업을 수행하는 역할
- `OrderService.kt`: 주문 생성 후 이벤트 발행까지 연결하는 역할
- `NotificationService.kt`: 소비된 이벤트를 기록하고 조회하는 역할
- `EventConfig.kt`: 브로커 연결에 필요한 최소 exchange, queue, binding 제공

## 미리 제공할 것

- RabbitMQ 실행 환경
- Producer / Consumer 기본 틀
- 주문 생성 API와 알림 조회 API 뼈대
- 기존 프로젝트 구조와 설정

## 단계별 구현 안내

### 1. 이벤트 DTO를 만듭니다

- `orderId`, `userId`, `productName`, `message` 정도의 최소 정보만 담습니다.
- 이벤트는 어떤 일이 일어났다는 사실을 알려주는 메시지로 생각하면 됩니다.

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
```

### 2. 이벤트 발행 코드를 만듭니다

- `OrderService`가 주문 생성 결과를 이벤트로 만듭니다.
- `EventPublisherService`는 그 이벤트를 RabbitMQ로 보내는 역할만 맡습니다.
- 발행 서비스가 알림 처리까지 직접 하려고 하지 않는 것이 핵심입니다.

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

### 3. 이벤트 소비 코드를 만듭니다

- `NotificationConsumer`는 큐를 구독하고 이벤트를 받습니다.
- 받은 이벤트는 `NotificationService`로 넘겨 후속 작업을 분리합니다.
- 이번 실습에서는 실제 후속 작업을 알림 기록 정도로 최소화합니다.

### 4. 흐름을 실행해봅니다

- `POST /event-orders`로 주문을 생성합니다.
- `GET /event-orders/notifications`로 소비 결과를 확인합니다.
- 외부 요청은 하나처럼 보여도, 내부 후속 작업은 이벤트를 통해 분리됩니다.

### 5. 동기/비동기 차이를 비교합니다

- 동기 호출이었다면 주문 서비스가 알림 서비스까지 직접 알아야 했을 것입니다.
- 이번 구조에서는 주문 생성 쪽은 이벤트만 발행하고, 알림 쪽이 따로 소비합니다.
- 서비스를 분리해서 보면 이 흐름을 `주문 서비스 -> 이벤트 큐 -> 알림 서비스` 정도로 설명하면 충분합니다.

## 실행 확인 방법

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

그 다음:

1. `POST /event-orders`
2. `GET /event-orders/notifications`
