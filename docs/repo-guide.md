# 레포 가이드

## 이 레포의 역할

이 레포는 A&I 백엔드 커리큘럼의 `12. 이벤트 기반 사고 확장` 시퀀스를 담당합니다.

핵심 메시지는 아래입니다.

- 주문 생성 결과를 이벤트로 분리해 다른 흐름으로 넘겨봅니다.
- 메시지 큐를 운영 심화보다 흐름 전달 장치로 먼저 이해합니다.
- 동기 호출과 비동기 전달의 차이를 예시 하나로 선명하게 봅니다.
- 발행자와 소비자의 역할이 어떻게 나뉘는지 직접 확인합니다.

## 이 레포에서 직접 다루는 범위

- `OrderCreatedEvent` 설계
- `EventPublisherService` 구현
- `NotificationConsumer` 구현
- RabbitMQ 기반 최소 발행/소비 흐름
- 주문 생성 API와 알림 조회 API로 결과 확인

## 이 레포에서 깊게 다루지 않는 범위

- Kafka, RabbitMQ 고급 운영
- offset, partition, consumer group 심화
- Saga, Outbox, CDC
- MSA 전체 설계
