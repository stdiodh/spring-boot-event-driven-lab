# 이벤트 기반 사고 확장 구현 가이드

## 1. 오늘 연결할 흐름

이번 실습은 주문 생성 뒤 알림 기록을 이벤트로 분리합니다.

1. `POST /event-orders`로 주문 생성 요청을 보냅니다.
2. `OrderService`가 `OrderCreatedEvent`를 만듭니다.
3. `EventPublisherService`가 이벤트를 RabbitMQ로 발행합니다.
4. `NotificationConsumer`가 이벤트를 소비해 알림을 기록합니다.
5. `GET /event-orders/notifications`로 알림 기록을 확인합니다.

## 2. 실제 코드 파일

아래 파일만 기준으로 흐름을 읽습니다.

- `src/main/kotlin/com/andi/rest_crud/controller/OrderEventController.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/OrderCreateRequest.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/OrderResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/dto/NotificationMessageResponse.kt`
- `src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt`
- `src/main/kotlin/com/andi/rest_crud/service/OrderService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt`
- `src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`
- `src/main/kotlin/com/andi/rest_crud/service/NotificationService.kt`
- `src/main/kotlin/com/andi/rest_crud/config/EventConfig.kt`

## 3. API 입구 확인

`OrderEventController.kt`가 이벤트 실습 API의 입구입니다.

```kotlin
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
fun createOrder(@Valid @RequestBody request: OrderCreateRequest): OrderResponse {
    return orderService.createOrder(request)
}
```

`POST /event-orders`는 주문을 만들고 이벤트 발행 흐름을 시작합니다.
요청 body는 `OrderCreateRequest`의 `userId`, `productName`을 사용합니다.

알림 기록은 같은 Controller에서 조회합니다.

```kotlin
@GetMapping("/notifications")
fun getNotifications(): List<NotificationMessageResponse> {
    return notificationService.getAll()
}
```

이 API는 `GET /event-orders/notifications`로 호출합니다.

## 4. 이벤트 생성

`OrderService.kt`는 주문 번호를 만들고 `OrderCreatedEvent`를 생성합니다.

```kotlin
val event = OrderCreatedEvent(
    orderId = orderId,
    userId = request.userId.trim(),
    productName = request.productName.trim()
)
```

`OrderCreatedEvent`는 주문이 생성되었다는 사실과 후속 작업에 필요한 값만 담습니다.
이벤트를 만든 뒤 `eventPublisherService.publishOrderCreated(event)`를 호출합니다.

## 5. 이벤트 발행

`EventPublisherService.kt`는 RabbitMQ로 이벤트를 보냅니다.

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

이 서비스는 알림을 직접 저장하지 않습니다.
역할은 exchange와 routing key를 사용해 이벤트를 발행하는 데서 끝납니다.

`EventConfig.kt`는 exchange, queue, binding, JSON converter를 설정합니다.
이 설정 덕분에 `OrderCreatedEvent`가 메시지로 전달되고 소비자에서 다시 객체로 받을 수 있습니다.

## 6. 이벤트 소비와 알림 기록

`NotificationConsumer.kt`는 queue를 구독하고 이벤트를 받습니다.

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

소비자는 이벤트를 받은 뒤 `NotificationService.record(event)`를 호출합니다.
`NotificationService.kt`는 `orderId`를 key로 알림 메시지를 기록하고 `getAll()`로 조회 결과를 반환합니다.

```kotlin
notifications.putIfAbsent(
    event.orderId,
    NotificationMessageResponse(
        orderId = event.orderId,
        userId = event.userId,
        message = "주문 ${event.orderId}번(${event.productName})이 생성되었습니다."
    )
)
```

같은 `orderId` 이벤트가 다시 전달되어도 현재 프로세스에서는 한 번만 기록합니다. 이 map은 재시작하면 사라지므로 영속 멱등성과 재처리는 별도 범위입니다.

## 7. 실행 확인

RabbitMQ를 먼저 실행합니다.

```bash
docker compose up -d
```

테스트를 실행합니다.

```bash
./gradlew test
```

서버를 실행합니다.

```bash
./gradlew bootRun
```

주문 생성 API를 호출합니다.

```text
POST /event-orders
```

알림 조회 API를 호출합니다.

```text
GET /event-orders/notifications
```

구현을 마친 뒤 아래 diff로 비교합니다.

```bash
git diff 12-implementation..12-answer
```
