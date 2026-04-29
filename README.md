# 이벤트 기반 사고 확장 구현 브랜치

> RabbitMQ를 이용해 `주문 생성 -> 이벤트 발행 -> 알림 소비` 흐름을 직접 완성해보는 starter 브랜치입니다.

> 이번 시퀀스 한 줄 요약  
> 이번 실습은 요청/응답 중심 구조 위에 이벤트 발행과 소비를 얹어서, 동기 호출과 비동기 전달의 차이를 감각적으로 이해하는 과정입니다.

## 이 레포에서 다루는 것

- `OrderCreatedEvent` 만들기
- 주문 생성 시 이벤트 발행하기
- 다른 쪽에서 이벤트를 소비해 알림 흐름으로 연결하기
- 메시지 큐를 “흐름 전달 장치”로 이해하기
- 동기 호출과 비동기 전달 차이 비교하기

## 문서

- [이론 문서](./docs/theory.md)
- [구현 문서](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자산 정리](./docs/assets.md)
- [브랜치 가이드](./docs/branch-guide.md)

## 학생이 직접 구현하는 핵심 파일

- [`src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt`](./src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt)
- [`src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt`](./src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt)
- [`src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`](./src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt)

## 구현 흐름 요약

1. 이벤트 DTO를 만듭니다.
2. 주문 생성 흐름에서 이벤트를 발행합니다.
3. 소비자가 이벤트를 받아 알림을 남깁니다.
4. 주문 API와 알림 조회 API로 흐름을 실행해봅니다.
5. 동기 호출과 비동기 전달 차이를 비교합니다.

## 실행 방법

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

실행 후 아래 흐름으로 확인할 수 있습니다.

1. `POST /event-orders`
2. `GET /event-orders/notifications`

## 이번 시퀀스에서 특히 봐야 할 것

- `OrderService`가 주문 생성 뒤 바로 알림 서비스를 직접 호출하지 않는다는 점
- `EventPublisherService`가 “결과를 이벤트로 넘기는 역할”만 맡는다는 점
- `NotificationConsumer`가 후속 동작을 분리해서 수행한다는 점

## 브랜치 메모

- 현재 브랜치: `12-implementation`
- 정답 비교 브랜치: `12-answer`
- 레포 안내 브랜치: `main`
