# 이벤트 기반 사고 확장 구현 가이드

## 이 도메인이 필요한 이유

이번 단계는 직접 호출 말고 결과를 이벤트로 넘길 수도 있다는 사고를 익히는 것이 중요합니다.

## 실습에서 완성할 최종 흐름

1. `OrderCreatedEvent`를 만듭니다.
2. 주문 생성 흐름에서 이벤트를 발행합니다.
3. 소비자가 이벤트를 받아 알림을 기록합니다.
4. 주문 API와 알림 조회 API로 흐름을 실행해봅니다.
5. 동기 호출이었다면 어떤 점이 더 불편했을지 비교합니다.

## 각 파일의 역할

- `OrderCreatedEvent.kt`: 주문 생성 결과를 담아 다른 흐름으로 넘기는 이벤트 객체
- `EventPublisherService.kt`: 이벤트를 브로커로 보내는 역할
- `NotificationConsumer.kt`: 이벤트를 받아 후속 작업을 수행하는 역할
- `OrderService.kt`: 주문 생성 후 이벤트 발행까지 연결하는 역할
- `NotificationService.kt`: 소비된 이벤트를 기록하고 조회하는 역할
- `EventConfig.kt`: 브로커 연결에 필요한 최소 exchange, queue, binding 제공

## 단계별 구현 안내

### 1. 이벤트 DTO를 만듭니다

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
```

### 2. 이벤트 발행 코드를 만듭니다

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

### 3. 이벤트 소비 코드를 만듭니다

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

### 4. 동기/비동기 차이를 비교합니다

- 동기 호출이었다면 주문 서비스가 알림 서비스까지 직접 알아야 했을 것입니다.
- 이번 구조에서는 주문 생성 쪽은 이벤트만 발행하고, 알림 쪽이 따로 소비합니다.
- 서비스를 분리해서 보면 이 흐름을 `주문 서비스 -> 이벤트 큐 -> 알림 서비스` 정도로 설명하면 충분합니다.
