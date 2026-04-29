# 이벤트 기반 사고 확장 제공 자산

## 미리 제공하는 것

- RabbitMQ 실행 환경
- Producer / Consumer 기본 틀
- 주문 생성 API
- 알림 조회 API
- 기본 이벤트 설정
- 기존 프로젝트 구조와 설정

## 왜 미리 제공하는가

- 이번 시퀀스의 핵심은 브로커 운영 전체가 아니라 발행/소비 흐름 이해입니다.
- 학생이 보일러플레이트보다 이벤트 사고에 집중하게 만들기 위함입니다.

## 학생이 직접 작성하지 않는 범위

- Kafka, RabbitMQ 고급 운영
- 파티션, offset, consumer group 심화
- Saga, Outbox, CDC
- MSA 전체 설계
