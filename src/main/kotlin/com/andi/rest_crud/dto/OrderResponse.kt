package com.andi.rest_crud.dto

data class OrderResponse(
    val orderId: Long,
    val userId: String,
    val productName: String,
    val status: String
)
