package com.andi.rest_crud.service

import com.andi.rest_crud.dto.NotificationMessageResponse
import com.andi.rest_crud.event.OrderCreatedEvent
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class NotificationService {

    private val notifications = ConcurrentHashMap<Long, NotificationMessageResponse>()

    fun record(event: OrderCreatedEvent) {
        notifications.putIfAbsent(
            event.orderId,
            NotificationMessageResponse(
                orderId = event.orderId,
                userId = event.userId,
                message = "주문 ${event.orderId}번(${event.productName})이 생성되었습니다."
            )
        )
    }

    fun getAll(): List<NotificationMessageResponse> = notifications.values.sortedBy { it.orderId }
}
