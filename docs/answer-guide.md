# 이벤트 기반 사고 확장 참고 구현 가이드

## 참고 구현 흐름 요약

참고 기준에서는 아래 파일이 핵심입니다.

- `OrderCreatedEvent.kt`
- `EventPublisherService.kt`
- `NotificationConsumer.kt`
- `OrderService.kt`
- `NotificationService.kt`
- `EventConfig.kt`

## 1. 이벤트 DTO 참고 구현

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String
)
```

핵심은 이벤트에 발생한 사실만 담고 알림 표시 문구는 소비자가 만들게 하는 것입니다.

## 2. 발행 코드 참고 구현

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

발행자는 이벤트를 브로커로 전달하는 역할만 맡습니다.

## 3. 소비 코드 참고 구현

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

소비자는 이벤트를 받아 후속 작업으로 연결합니다.

## 4. 주문 -> 알림 예시 흐름

```kotlin
fun createOrder(request: OrderCreateRequest): OrderResponse {
    val event = OrderCreatedEvent(
        orderId = orderId,
        userId = request.userId.trim(),
        productName = request.productName.trim(),
        message = "주문 ${orderId}가 생성되어 알림을 보냅니다."
    )
    eventPublisherService.publishOrderCreated(event)
```

핵심은 주문 서비스가 결과를 발행만 하고, 알림은 다른 쪽에서 소비한다는 점입니다.

## 5. 동기 호출 버전과 MSA 관점 비교

- 동기 호출 버전이라면 `OrderService`가 알림 로직이나 알림 서비스 호출까지 직접 알아야 했을 가능성이 큽니다.
- 이번 이벤트 버전에서는 주문 생성 결과를 이벤트로 넘기고, 소비자가 후속 작업을 처리합니다.
- MSA 관점에서는 이 그림을 `주문 서비스 -> 이벤트 큐 -> 알림 서비스`로 설명할 수 있습니다.
- 중요한 점은 이번 실습이 실제 다중 서비스 운영을 구현하는 것이 아니라, 그 구조에서 자주 쓰이는 이벤트 이동 방식을 먼저 보는 단계라는 점입니다.

## 6. 리뷰어가 빠르게 비교할 포인트

- `OrderCreatedEvent`가 최소 필드만 가지는가
- `EventPublisherService`가 `RabbitTemplate`으로 이벤트를 보내는가
- `NotificationConsumer`가 `@RabbitListener`로 이벤트를 받는가
- `OrderService`가 알림을 직접 처리하지 않고 이벤트를 발행하는가
- 알림 조회로 소비 결과를 확인할 수 있는가
