# 구현 가이드

이 문서는 `12-answer` 브랜치의 참고 구현을 기준으로 설명합니다.
starter 브랜치에서 먼저 구현한 뒤, 책임 분리와 이벤트 흐름을 비교할 때 사용합니다.

## 1. 구현 전에 확인할 문제

주문 생성 뒤 알림까지 직접 호출하면 주문 흐름이 알림 처리 방식을 알게 됩니다.
이번 구현은 주문 생성 결과를 이벤트로 발행하고, 소비자가 알림 흐름을 처리하도록 분리합니다.

## 2. 구현 순서

1. 이벤트 DTO를 만듭니다.
2. 주문 생성 흐름에서 이벤트를 발행합니다.
3. 소비자가 이벤트를 받아 알림 기록으로 연결합니다.
4. 주문 API와 알림 조회 API로 흐름을 확인합니다.
5. 직접 호출과 이벤트 전달의 차이를 비교합니다.

## 3. Step 1. 이벤트 DTO

### 해야 할 일

```kotlin
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
```

### 왜 이 작업을 하는가

이벤트는 주문 생성 사실을 다른 흐름으로 전달하는 메시지입니다.
알림 처리에 필요한 최소 정보만 담아 발행자와 소비자의 결합을 줄입니다.

### 확인 방법

이벤트 필드가 후속 알림 처리에 필요한 정보인지 확인합니다.

## 4. Step 2. 이벤트 발행

### 해야 할 일

```kotlin
fun publishOrderCreated(event: OrderCreatedEvent) {
    rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
}
```

### 왜 이 작업을 하는가

발행 서비스는 브로커로 이벤트를 보내는 역할에 집중합니다.
알림 처리 세부 내용은 발행자가 직접 맡지 않습니다.

### 확인 방법

주문 생성 후 이벤트 발행 서비스가 호출되는지 확인합니다.

## 5. Step 3. 이벤트 소비

### 해야 할 일

```kotlin
@RabbitListener(queues = ["\${event.order.queue}"])
fun consumeOrderCreated(event: OrderCreatedEvent) {
    notificationService.record(event)
}
```

### 왜 이 작업을 하는가

소비자는 큐에서 이벤트를 받아 후속 작업으로 연결합니다.
주문 생성과 알림 기록이 같은 메서드 안에 묶이지 않도록 분리합니다.

### 확인 방법

`POST /event-orders` 이후 `GET /event-orders/notifications`에서 소비 결과를 확인합니다.

## 6. Step 4. 직접 호출과 비교

### 해야 할 일

동기 호출이라면 주문 서비스가 알림 처리까지 직접 알아야 했을 지점을 비교합니다.

### 왜 이 작업을 하는가

이벤트 기반 구조의 목적은 도구 사용 자체가 아니라 후속 작업의 책임과 결합도를 조정하는 것입니다.

### 확인 방법

`주문 서비스 -> 이벤트 큐 -> 알림 서비스` 그림을 말로 설명합니다.

## 마지막 확인

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

<details>
<summary>멘토용 진행 포인트</summary>

- 코드 비교 전 이벤트가 담아야 할 정보부터 멘티가 말하게 합니다.
- 발행자, 브로커, 소비자 책임을 한 문장씩 나누어 설명하게 합니다.
- 직접 호출이 더 나은 단순한 상황도 함께 질문해 균형을 맞춥니다.

</details>
