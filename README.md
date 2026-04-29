# Spring Boot Event-Driven Lab

> A&I 백엔드 커리큘럼의 `12. 이벤트 기반 사고 확장` 시퀀스를 담는 안내 브랜치입니다.

> 이 레포 한 줄 요약  
> RabbitMQ를 이용해 `주문 생성 -> 이벤트 발행 -> 알림 소비` 흐름을 단계적으로 배우는 토픽 레포입니다.

## 이 레포의 역할

- `main`은 이 레포의 안내 브랜치입니다.
- 학생은 `12-implementation`에서 실습을 시작합니다.
- 강사는 `12-answer`에서 정답과 비교합니다.
- 이번 레포는 이벤트 발행과 소비의 최소 흐름만 다루고, 고급 메시징 운영은 다루지 않습니다.

## 브랜치 사용법

1. `main`에서 레포 목적과 브랜치 구조를 확인합니다.
2. `12-implementation`으로 이동해 TODO starter를 따라갑니다.
3. 실습을 마친 뒤 `12-answer`와 비교합니다.

## 문서 안내

- [레포 가이드](./docs/repo-guide.md)
- [브랜치 가이드](./docs/branch-guide.md)
- [시퀀스 맵](./docs/sequence-map.md)
- [이론 문서](./docs/theory.md)
- [구현 문서](./docs/implementation.md)
- [정답 가이드](./docs/answer-guide.md)
- [체크리스트](./docs/checklist.md)
- [제공 자산 정리](./docs/assets.md)

## 이번 시퀀스 핵심

- `OrderCreatedEvent`로 사실 전달하기
- `EventPublisherService`로 브로커에 이벤트 보내기
- `NotificationConsumer`로 후속 작업 분리하기
- 동기 호출과 비동기 전달 차이 설명하기

## 빠른 시작

```bash
docker compose up -d
./gradlew test
./gradlew bootRun
```

실행 후 확인 흐름:

1. `POST /event-orders`
2. `GET /event-orders/notifications`
