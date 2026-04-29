# 이벤트 기반 사고 확장 정답 가이드

## 정답 흐름 요약

정답 기준에서는 아래 파일이 핵심입니다.

- `OrderCreatedEvent.kt`
- `EventPublisherService.kt`
- `NotificationConsumer.kt`
- `OrderService.kt`
- `NotificationService.kt`
- `EventConfig.kt`

## 1. 이벤트 DTO 정답

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
```

핵심은 이벤트에 최소 정보만 담는 것입니다.

## 2. 발행 코드 정답

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

발행자는 이벤트를 브로커로 전달하는 역할만 맡습니다.  
알림 처리나 후속 동작을 여기서 직접 하지 않는 것이 중요합니다.

## 3. 소비 코드 정답

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

소비자는 이벤트를 받아 후속 작업으로 연결합니다.  
이번 예시에서는 후속 작업을 “알림 로그 기록”으로 최소화했습니다.

## 4. 주문 → 알림 예시 흐름

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

이 흐름의 핵심은 주문 서비스가 “결과를 발행”만 하고, 알림은 다른 쪽에서 소비한다는 점입니다.

## 5. 강사가 빠르게 비교할 포인트

- `OrderCreatedEvent`가 최소 필드만 가지는가
- `EventPublisherService`가 `RabbitTemplate`으로 이벤트를 보내는가
- `NotificationConsumer`가 `@RabbitListener`로 이벤트를 받는가
- `OrderService`가 알림을 직접 처리하지 않고 이벤트를 발행하는가
- 알림 조회로 소비 결과를 확인할 수 있는가

## 6. 자주 나는 실수

- 이벤트에 너무 많은 데이터를 담는 경우
- 소비자에서 주문 생성 로직까지 다시 처리하려는 경우
- 발행 서비스가 후속 작업까지 직접 맡아버리는 경우
- 메시지 큐를 “무조건 더 좋은 구조”로 오해하는 경우
