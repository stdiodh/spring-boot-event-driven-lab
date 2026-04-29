# 레포 가이드

## 이 레포의 역할

이 레포는 A&I 백엔드 커리큘럼의 `12. 이벤트 기반 사고 확장` 시퀀스를 담당합니다.

핵심 메시지는 아래입니다.

- 주문 생성 결과를 이벤트로 발행하고, 다른 쪽이 그것을 소비하는 최소 구조를 봅니다.
- 메시지 브로커를 운영 심화보다 흐름 전달 장치로 먼저 이해합니다.
- 동기 호출과 비동기 전달이 코드 구조에 어떤 차이를 만드는지 비교합니다.
- 하나의 예시를 끝까지 따라가며 이벤트 기반 사고의 출발점을 잡습니다.

## 이 레포에서 직접 다루는 범위

- `OrderCreatedEvent` 설계
- `EventPublisherService`를 통한 이벤트 발행
- `NotificationConsumer`를 통한 이벤트 소비
- RabbitMQ를 이용한 최소 발행/소비 흐름
- 주문 생성 API와 알림 조회 API로 결과 확인

## 이 레포에서 깊게 다루지 않는 범위

- Kafka, RabbitMQ 고급 운영
- offset, partition, consumer group 심화
- Saga, Outbox, CDC
- MSA 전체 설계
