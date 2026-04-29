package com.andi.rest_crud.service

import com.andi.rest_crud.dto.OrderCreateRequest
import com.andi.rest_crud.dto.OrderResponse
import com.andi.rest_crud.event.OrderCreatedEvent
import org.springframework.stereotype.Service
import java.util.concurrent.atomic.AtomicLong

@Service
class OrderService(
    private val eventPublisherService: EventPublisherService
) {

    private val orderSequence = AtomicLong(1L)

    fun createOrder(request: OrderCreateRequest): OrderResponse {
        val orderId = orderSequence.getAndIncrement()
        val event = OrderCreatedEvent(
            orderId = orderId,
            userId = request.userId.trim(),
            productName = request.productName.trim(),
            message = "주문 ${orderId}가 생성되어 알림을 보냅니다."
        )
        eventPublisherService.publishOrderCreated(event)

        return OrderResponse(
            orderId = orderId,
            userId = event.userId,
            productName = event.productName,
            status = "ORDER_CREATED"
        )
    }
}
