# 이벤트 기반 사고 확장

이번 실습은 `주문 생성 -> 이벤트 발행 -> 알림 소비` 예시 하나로, 직접 호출과 이벤트 전달의 차이를 가볍게 체험하는 과정입니다.

## 먼저 이것만 기억해도 됩니다

- 동기 호출은 바로 결과를 기다리고, 비동기 전달은 결과를 다른 흐름으로 넘길 수 있습니다.
- 이벤트는 어떤 일이 일어났다는 사실을 다른 쪽에 알려주는 방식입니다.
- 메시지 큐는 발행자와 소비자를 느슨하게 연결해줍니다.
- 서비스를 분리해서 보면 이벤트가 큐를 통해 이동하는 그림을 자주 보게 됩니다.

## 이 주제를 왜 배우는가

처음에는 서비스끼리 직접 호출해도 충분합니다.
하지만 기능이 커지고 후속 작업이 늘어나면 `이 작업이 끝나면 저 작업도 해야 해`라는 연결이 점점 많아집니다.

예를 들어 주문이 생성되면 알림도 보내고, 로그도 남기고, 분석 이벤트도 쌓고 싶어질 수 있습니다.
이때 모든 후속 동작을 주문 서비스가 직접 호출하기 시작하면 한 서비스가 너무 많은 책임을 가지게 됩니다.

그래서 이번 실습에서는 결과를 이벤트로 발행하고, 다른 쪽이 그 이벤트를 소비하는 최소 구조를 봅니다.

## 기초 개념

### 동기 호출

요청한 쪽이 상대의 작업이 끝날 때까지 바로 기다리는 방식입니다.

### 이벤트

어떤 일이 일어났다는 사실을 담은 메시지입니다.

### 메시지 큐

발행된 메시지를 전달하고 소비할 수 있게 도와주는 중간 장치입니다.

### MSA 관점

서비스가 나뉘면 한 서비스의 결과를 다른 서비스가 알아야 하는 장면이 많아지고, 이때 이벤트와 메시지 큐가 연결 방식의 한 선택지가 됩니다.

## 현재 코드 흐름

### `OrderCreatedEvent`

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
```

이벤트는 주문 생성 사실을 다른 흐름으로 넘기는 최소 정보만 담습니다.

### `EventPublisherService`

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

발행자는 브로커로 넘기는 역할만 맡습니다.

### `NotificationConsumer`

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

소비자는 이벤트를 받아 후속 작업을 처리합니다.

## 실무 확장 개념

이번 시퀀스의 실무 확장 개념은 MSA 관점의 서비스 분리와 이벤트 이동입니다.

### 문제 코드

```kotlin
fun createOrder(request: OrderCreateRequest): OrderResponse {
    val saved = orderRepository.save(...)
    notificationService.sendOrderCreated(saved.id, request.userId)
    return OrderResponse(...)
}
```

이 구조는 동작은 하지만 주문 서비스가 알림 서비스의 존재를 직접 알아야 합니다.

### 왜 바꾸기 어려워지는가

- 후속 작업이 늘어날수록 주문 서비스가 커집니다.
- 알림 정책 변경이 주문 서비스까지 흔들 수 있습니다.
- 서비스를 나눠 운영한다고 가정했을 때 직접 호출 관계가 더 복잡해집니다.

### 정리된 코드 예시

```kotlin
fun createOrder(request: OrderCreateRequest): OrderResponse {
    val saved = orderRepository.save(...)
    eventPublisherService.publishOrderCreated(
        OrderCreatedEvent(...)
    )
    return OrderResponse(...)
}
```

이렇게 바꾸면 주문 서비스는 결과를 발행하고, 알림 쪽은 따로 소비할 수 있습니다.
서비스를 분리해서 보면 `주문 서비스 -> 이벤트 큐 -> 알림 서비스` 같은 그림으로 설명할 수 있습니다.
