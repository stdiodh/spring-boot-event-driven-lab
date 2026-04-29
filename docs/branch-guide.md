# 브랜치 가이드

## `main`

- 이 레포의 안내 브랜치입니다.
- 레포 소개, 문서 안내, 브랜치 이동 방법을 제공합니다.

## `12-implementation`

- 학생이 이벤트 DTO, 발행, 소비 흐름을 직접 수행하는 starter 브랜치입니다.
- 핵심 TODO는 `OrderCreatedEvent`, `EventPublisherService`, `NotificationConsumer`에 집중됩니다.

## `12-answer`

- 강사와 학생이 비교할 정답 브랜치입니다.
- 같은 시퀀스 문서 구조를 유지한 채 완성 코드를 담습니다.

## 추천 사용 순서

1. `main`에서 레포 목적 확인
2. `12-implementation`으로 이동
3. 실습 완료 후 `12-answer` 비교
