# Visual Lab asset sources

## Topic diagram

- `diagrams/12-response-event-fork.svg`: Sequence 12의 `docs/theory.md`, `docs/implementation.md`, `docs/checklist.md`를 바탕으로 2026-07-15에 프로젝트 내부에서 제작했습니다.
- `diagrams/12-direct-call.svg`: 같은 문서의 동기 직접 호출 비교를 바탕으로 2026-07-16에 프로젝트 내부에서 제작했습니다.
- `diagrams/12-duplicate-idempotency.svg`: 같은 문서의 현재 process 한정 `putIfAbsent` 중복 방지 범위를 바탕으로 2026-07-16에 프로젝트 내부에서 제작했습니다.
- `diagrams/12-failure-boundaries.svg`: 같은 문서의 publisher와 consumer 실패 경계 구분을 바탕으로 2026-07-16에 프로젝트 내부에서 제작했습니다.

## System icons

- `icons/*.svg`: 기존 저장소 자산 `system-icons.svg`의 같은 이름 symbol을 독립 렌더링 가능한 SVG로 분리했습니다.
- `system-icons.svg`: 기존 출처 확인과 하위 호환을 위해 보존하며 런타임의 기본 아이콘 소스로 사용하지 않습니다.

외부 이미지나 외부 폰트를 추가하지 않았습니다.
