# 이벤트 기반 사고 확장 구현 가이드

## 이 도메인이 필요한 이유

이번 단계는 새 기능을 많이 만드는 것이 아니라, “직접 호출 말고 결과를 이벤트로 넘길 수도 있다”는 사고를 익히는 것이 중요합니다.

## 학생이 완성할 최종 흐름

1. `OrderCreatedEvent`를 만듭니다.
2. 주문 생성 흐름에서 이벤트를 발행합니다.
3. 소비자가 이벤트를 받아 알림을 기록합니다.
4. 주문 API와 알림 조회 API로 흐름을 실행해봅니다.
5. 동기 호출이었다면 어떤 점이 더 불편했을지 비교합니다.

여기서 한 걸음 더 나가면,
주문과 알림이 서로 다른 서비스라고 가정했을 때도 같은 그림으로 설명할 수 있어야 합니다.

## 학생이 직접 구현할 순서

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
- `EventConfig.kt`: 브로커 연결에 필요한 최소 exchange / queue / binding 제공

## 미리 제공할 것

- RabbitMQ 실행 환경
- Producer / Consumer 기본 틀
- 주문 생성 API와 알림 조회 API 뼈대
- 기존 프로젝트 구조와 설정

## 단계별 구현 안내

### 1. 이벤트 DTO를 만듭니다

- `orderId`, `userId`, `productName`, `message` 정도의 최소 정보만 담습니다.
- 이벤트는 “이 일이 일어났다”를 알려주는 사실 중심 메시지로 생각하면 됩니다.

### 2. 이벤트 발행 코드를 만듭니다

- `OrderService`가 주문 생성 결과를 이벤트로 만듭니다.
- `EventPublisherService`는 그 이벤트를 RabbitMQ로 보내는 역할만 맡습니다.
- 발행 서비스가 알림 처리까지 직접 하려고 하지 않는 것이 핵심입니다.

### 3. 이벤트 소비 코드를 만듭니다

- `NotificationConsumer`는 큐를 구독하고 이벤트를 받습니다.
- 받은 이벤트는 `NotificationService`로 넘겨 후속 작업을 분리합니다.
- 이번 실습에서는 실제 후속 작업을 “알림 기록” 정도로 최소화합니다.

### 4. 흐름을 실행해봅니다

- `POST /event-orders`로 주문을 생성합니다.
- `GET /event-orders/notifications`로 소비 결과를 확인합니다.
- 실행 순서는 동기 요청 하나처럼 보여도, 내부 후속 작업은 이벤트를 통해 분리됩니다.

### 5. 동기/비동기 차이를 비교합니다

- 동기 호출이었다면 주문 서비스가 알림 서비스까지 직접 알아야 했을 것입니다.
- 이번 구조에서는 주문 생성 쪽은 이벤트만 발행하고, 알림 쪽이 따로 소비합니다.
- MSA 관점에서는 이 흐름을 `주문 서비스 -> 이벤트 큐 -> 알림 서비스` 정도로 가볍게 설명하면 충분합니다.

## 실행 확인 방법

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

그 다음:

1. `POST /event-orders`
2. `GET /event-orders/notifications`

## 학생 체크 질문

- 왜 주문 서비스가 알림 서비스를 직접 호출하지 않았나요?
- 이벤트에는 왜 최소 정보만 담았나요?
- 발행자와 소비자의 역할은 어떻게 다르나요?
- 동기 호출이었다면 어떤 코드가 더 강하게 묶였을까요?

## 강사 / PPT 체크 질문

- 주문 생성 → 이벤트 발행 → 알림 소비 그림이 있는가
- 동기 호출과 비동기 전달 차이를 예시로 설명할 수 있는가
- 메시지 큐가 왜 필요한지 입문 수준에서 말할 수 있는가
- MSA가 무조건 답이 아니라는 점을 함께 설명할 수 있는가
