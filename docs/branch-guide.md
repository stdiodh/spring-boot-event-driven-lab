# 브랜치 가이드

## `main`

- 이 레포의 안내 브랜치입니다.
- 레포 소개, 문서 안내, 브랜치 이동 방법을 제공합니다.
- GitHub default branch가 `12-answer`로 보이면 운영자가 `main`으로 수동 변경해야 합니다.

## `12-implementation`

- 학생이 이벤트 DTO, 발행, 소비 흐름을 직접 완성하는 학생 시작 브랜치입니다.
- 핵심 TODO는 `OrderCreatedEvent`, `EventPublisherService`, `NotificationConsumer`에 집중됩니다.

## `12-answer`

- 강사와 학생이 비교할 정답 브랜치입니다.
- 같은 시퀀스 문서 구조를 유지한 채 완성 코드를 담습니다.

## 추천 사용 순서

1. `main`에서 레포 목적 확인
2. `12-implementation`으로 이동
3. 실습 완료 후 `12-answer` 비교

## 운영 메모

정식 수업 운영에서는 `main`, `12-implementation`, `12-answer`만 사용합니다.
Codex는 원격 default branch를 직접 변경하지 못합니다.
운영자가 GitHub Settings 또는 gh CLI로 default branch를 `main`으로 변경해야 합니다.
