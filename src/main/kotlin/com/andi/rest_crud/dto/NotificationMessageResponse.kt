package com.andi.rest_crud.dto

data class NotificationMessageResponse(
    val orderId: Long,
    val userId: String,
    val message: String
)
