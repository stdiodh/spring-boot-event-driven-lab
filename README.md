# Spring Boot Event-Driven Lab

이 레포는 A&I 백엔드 커리큘럼의 `12. 메시지 큐와 이벤트 기반 사고` 시퀀스를 담는 토픽 레포입니다.
`main`은 가이드 브랜치이고, 학생 실습은 `12-implementation`에서 시작합니다.

## 이 레포에서 배우는 것

- `OrderCreatedEvent`로 어떤 일이 일어났는지 전달하기
- `EventPublisherService`로 브로커에 이벤트 보내기
- `NotificationConsumer`로 후속 작업 분리하기
- 동기 호출과 비동기 전달 차이 이해하기
- 서비스를 분리해서 본다면 이벤트가 큐로 이동한다는 그림 이해하기

## 시작 방법

```bash
git clone https://github.com/stdiodh/spring-boot-event-driven-lab.git
cd spring-boot-event-driven-lab
git checkout 12-implementation
```

clone 뒤에는 GitHub default branch 표시와 관계없이 `12-implementation`을 명시적으로 checkout합니다.

## 실습 브랜치

| 용도 | 브랜치 |
| --- | --- |
| 가이드 | `main` |
| 학생 시작 | `12-implementation` |
| 참고 정답 | `12-answer` |

## 실행 방법

```bash
docker compose up -d
./gradlew bootRun
```

실행 후 확인 흐름:

1. `POST /event-orders`
2. `GET /event-orders/notifications`

## 테스트 방법

```bash
./gradlew test
```

테스트가 확인하는 것:

- 주문 생성 흐름에서 이벤트가 발행되는지 확인합니다.
- 이벤트 핸들러 또는 consumer가 호출되는지 확인합니다.
- 현재 단위 테스트가 발행 호출과 소비 결과를 확인하는 범위를 읽습니다.

실패하면 먼저 볼 것:

- 메시지 브로커가 필요한 테스트인지 test double로 충분한 테스트인지 구분합니다.
- 이벤트 payload가 후속 처리에 필요한 최소 필드를 담는지 확인합니다.
- 현재 예제에는 영속 주문 저장이 없으므로 저장 성공과 발행 실패를 검증했다고 해석하지 않습니다.

완료 기준:

- 이벤트 발행 호출과 소비 결과 테스트가 통과합니다.
- 영속 저장과 발행의 트랜잭션 경계는 outbox 같은 후속 주제로 구분합니다.

## 정답과 비교하는 방법

실습 중 막혔거나 완료 후 확인이 필요할 때만 참고 정답 브랜치와 비교합니다.

```bash
git fetch origin
git diff 12-implementation..12-answer
```

## Visual Lab

`main` 가이드 브랜치에는 이벤트 발행/소비 흐름을 훑어보는 Visual Lab 진입점이 있습니다.
이 페이지는 정답 비교 페이지가 아니라 시퀀스의 문제와 흐름을 먼저 이해하기 위한 정적 학습 화면입니다.

```text
docs/visual-lab/index.html
```

## 문서 안내

- [레포 가이드](./docs/repo-guide.md)
- [브랜치 가이드](./docs/branch-guide.md)
- [시퀀스 맵](./docs/sequence-map.md)
- [Visual Lab](./docs/visual-lab/index.html)

## 운영 메모

정식 수업 운영에서는 `main`, `12-implementation`, `12-answer`만 사용합니다.
GitHub default branch는 `main`입니다.
