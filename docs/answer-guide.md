# 이벤트 기반 사고 확장 비교 가이드

## 비교 흐름 요약

실습을 마친 뒤에는 `12-answer` 브랜치와 아래 파일을 비교하면 됩니다.

- `OrderCreatedEvent.kt`
- `EventPublisherService.kt`
- `NotificationConsumer.kt`
- `OrderService.kt`
- `NotificationService.kt`
- `EventConfig.kt`

## 1. 이벤트 DTO 비교 포인트

- 이벤트에 `orderId`, `userId`, `productName`, `message` 정도의 최소 정보만 담았는지 봅니다.
- 이벤트를 “주문 생성 사실 전달” 용도로만 쓰고 있는지 확인합니다.

## 2. 발행 코드 비교 포인트

- `EventPublisherService`가 `RabbitTemplate`으로 이벤트를 브로커에 전달하는지만 확인합니다.
- 발행 서비스가 알림 처리까지 직접 하지 않는지 확인합니다.

## 3. 소비 코드 비교 포인트

- 소비자가 `@RabbitListener`로 이벤트를 받고 있는지 봅니다.
- 받은 이벤트를 `NotificationService`로 넘겨 후속 작업을 분리했는지 확인합니다.

## 4. 동기 호출 버전과 MSA 관점 비교

- 동기 호출 버전이라면 `OrderService`가 알림 서비스까지 직접 알아야 했을 가능성이 큽니다.
- 이번 이벤트 버전에서는 주문 생성 결과를 이벤트로 넘기고, 소비자가 후속 작업을 처리합니다.
- MSA 관점에서는 이 그림을 `주문 서비스 -> 이벤트 큐 -> 알림 서비스`로 설명할 수 있습니다.
- 중요한 점은 이번 실습이 실제 다중 서비스 운영을 구현하는 것이 아니라, 그 구조를 입문 수준에서 가볍게 보는 단계라는 점입니다.

## 5. 강사가 빠르게 볼 포인트

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

## 7. 정답 확인 위치

- 학생 starter: `12-implementation`
- 완성 정답: `12-answer`
- 레포 안내: `main`
