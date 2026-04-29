# 레포 가이드

## 이 레포의 역할

이 레포는 A&I 백엔드 커리큘럼의 `12. 이벤트 기반 사고 확장` 시퀀스를 담당합니다.

핵심 메시지는 아래입니다.

- 요청/응답 중심 구조 밖에 있는 이벤트 흐름을 처음 만납니다.
- 주문 생성 결과를 이벤트로 발행하고, 다른 쪽에서 알림을 소비하는 최소 구조를 봅니다.
- 메시지 브로커 운영 전체보다 발행자와 소비자의 역할 분리를 먼저 익힙니다.
- 동기 호출과 비동기 전달의 차이를 입문 수준에서 설명할 수 있게 만듭니다.

## 이 레포에서 직접 다루는 범위

- `OrderCreatedEvent` 설계
- `EventPublisherService`를 통한 이벤트 발행
- `NotificationConsumer`를 통한 이벤트 소비
- RabbitMQ를 이용한 최소 메시지 전달 흐름
- 주문 생성 API와 알림 조회 API로 흐름 확인

## 이 레포에서 깊게 다루지 않는 범위

- Kafka, RabbitMQ 고급 운영
- offset, partition, consumer group 같은 심화 개념
- Saga, Outbox, CDC
- MSA 전체 설계
