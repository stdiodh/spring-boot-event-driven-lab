package com.andi.rest_crud.event

data class OrderCreatedEvent(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val message: String
)
