package com.andi.rest_crud.controller

import com.andi.rest_crud.dto.NotificationMessageResponse
import com.andi.rest_crud.dto.OrderCreateRequest
import com.andi.rest_crud.dto.OrderResponse
import com.andi.rest_crud.service.NotificationService
import com.andi.rest_crud.service.OrderService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/event-orders")
class OrderEventController(
    private val orderService: OrderService,
    private val notificationService: NotificationService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createOrder(@Valid @RequestBody request: OrderCreateRequest): OrderResponse {
        return orderService.createOrder(request)
    }

    @GetMapping("/notifications")
    fun getNotifications(): List<NotificationMessageResponse> {
        return notificationService.getAll()
    }
}
