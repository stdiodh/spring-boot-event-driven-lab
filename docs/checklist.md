# 이벤트 기반 사고 확장 체크리스트

## 수업 전 확인

- [ ] GitHub default branch가 `main`인지 확인했습니다.
- [ ] 학생 시작 브랜치가 `12-implementation`인지 확인했습니다.
- [ ] 참고 정답 브랜치가 `12-answer`인지 확인했습니다.
- [ ] `docker compose up -d`로 RabbitMQ를 실행했습니다.
- [ ] `./gradlew test`를 실행했습니다.
- [ ] `./gradlew bootRun`으로 서버 실행을 확인했습니다.

## 실습 중 확인

- [ ] `OrderCreatedEvent`가 주문 생성 사실과 후속 처리에 필요한 값을 담습니다.
- [ ] `EventPublisherService`가 `OrderCreatedEvent`를 발행합니다.
- [ ] `NotificationConsumer`가 이벤트를 소비합니다.
- [ ] `NotificationService`가 소비된 이벤트를 알림 기록으로 남깁니다.
- [ ] 같은 `orderId` 이벤트를 두 번 소비해도 알림이 한 번만 기록됩니다.
- [ ] `POST /event-orders`를 호출했습니다.
- [ ] `GET /event-orders/notifications`를 호출했습니다.

## 마무리 확인

- [ ] 주문 생성과 알림 기록이 직접 호출이 아니라 이벤트 흐름으로 분리되는지 설명할 수 있습니다.
- [ ] 이벤트 기반 구조가 항상 정답은 아니며 운영 복잡도가 생긴다는 점을 설명할 수 있습니다.
- [ ] 인메모리 중복 방지와 재시작 후에도 유지되는 영속 멱등성을 구분할 수 있습니다.
- [ ] `12-implementation..12-answer` diff를 비교했습니다.
