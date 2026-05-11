window.visualLabData = {
  sequence: "12",
  title: "Event Driven",
  goal: "요청 처리, 이벤트 발행, 큐 전달, 소비자 처리 사이의 트랜잭션 경계를 본다.",
  implementationBranch: "12-implementation",
  concepts: [
    {
      name: "Event",
      description: "이미 발생한 도메인 사실을 다른 흐름에 전달하는 메시지다.",
    },
    {
      name: "Publisher",
      description: "작업 결과를 이벤트로 만들어 메시지 흐름에 내보낸다.",
    },
    {
      name: "Queue",
      description: "생산자와 소비자를 느슨하게 연결하는 메시지 저장 공간이다.",
    },
    {
      name: "Consumer",
      description: "큐에서 메시지를 받아 후속 작업을 처리한다.",
    },
  ],
  flow: [
    {
      id: "command",
      title: "명령 요청을 처리한다",
      actor: "Client",
      target: "OrderService",
      description: "클라이언트 요청으로 주문 생성 같은 핵심 작업이 시작된다.",
      checkpoint: "동기 API 응답과 비동기 후속 작업을 구분한다.",
    },
    {
      id: "transaction",
      title: "상태를 저장한다",
      actor: "OrderService",
      target: "Database",
      description: "주문 상태를 트랜잭션 안에서 먼저 저장한다.",
      checkpoint: "이벤트 발행 시점이 DB 저장 성공과 어긋나지 않는지 확인한다.",
    },
    {
      id: "publish",
      title: "이벤트를 발행한다",
      actor: "Event Publisher",
      target: "Message Queue",
      description: "저장 결과를 바탕으로 후속 처리에 필요한 이벤트를 보낸다.",
      checkpoint: "이벤트 payload가 소비자에게 필요한 최소 정보만 담는지 확인한다.",
    },
    {
      id: "consume",
      title: "소비자가 메시지를 받는다",
      actor: "Consumer",
      target: "Message Queue",
      description: "소비자는 큐에서 이벤트를 읽고 알림, 로그, 상태 변경 같은 작업을 수행한다.",
      checkpoint: "중복 처리와 실패 재시도 기준을 확인한다.",
    },
    {
      id: "boundary",
      title: "경계를 확인한다",
      actor: "Developer",
      target: "Transaction Boundary",
      description: "동기 트랜잭션과 비동기 메시지 처리의 실패 범위를 나누어 본다.",
      checkpoint: "API 성공과 후속 이벤트 실패가 각각 어떤 상태를 남기는지 설명해 본다.",
    },
  ],
  checkpoints: [
    "이벤트 발행 시점과 DB 트랜잭션 경계를 구분한다.",
    "publisher, queue, consumer 책임을 분리한다.",
    "실패와 재시도 시나리오를 문서와 테스트에서 확인한다.",
    "실습은 12-implementation 브랜치에서 시작한다.",
  ],
};
