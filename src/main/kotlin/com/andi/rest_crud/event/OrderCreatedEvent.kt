package com.andi.rest_crud.event

// TODO 1. 주문 생성 결과를 다른 흐름으로 넘길 때 필요한 최소 필드를 확인하세요.
// TODO 2. orderId, userId, productName 같은 사실만 유지하고 표시용 문구는 소비자가 만들게 하세요.
// TODO 3. 지금은 "주문이 생성되었다"는 사실 전달이 핵심입니다.
data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String
)
