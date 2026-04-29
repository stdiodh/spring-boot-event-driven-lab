package com.andi.rest_crud.dto

import jakarta.validation.constraints.NotBlank

data class OrderCreateRequest(
    @field:NotBlank(message = "userId는 비어 있을 수 없습니다.")
    val userId: String,
    @field:NotBlank(message = "productName은 비어 있을 수 없습니다.")
    val productName: String
)
