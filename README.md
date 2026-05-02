# 이벤트 기반 사고 확장 정답 브랜치

이 브랜치는 `주문 생성 -> 이벤트 발행 -> 알림 소비` 흐름을 직접 확인해보는 정답 브랜치입니다.

## 이 레포에서 다루는 것

- `OrderCreatedEvent` 만들기
- 주문 생성 시 이벤트 발행하기
- 다른 쪽에서 이벤트를 소비해 알림 흐름으로 연결하기
- 메시지 큐를 흐름 전달 장치로 이해하기
- 동기 호출과 비동기 전달 차이 비교하기

## 문서

- [이론 문서](./docs/theory.md)
- [구현 문서](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자산 정리](./docs/assets.md)

## 핵심 파일

- [`src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt`](./src/main/kotlin/com/andi/rest_crud/event/OrderCreatedEvent.kt)
- [`src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt`](./src/main/kotlin/com/andi/rest_crud/service/EventPublisherService.kt)
- [`src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt`](./src/main/kotlin/com/andi/rest_crud/service/NotificationConsumer.kt)
