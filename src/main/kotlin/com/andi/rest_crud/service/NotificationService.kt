package com.andi.rest_crud.service

import com.andi.rest_crud.dto.NotificationMessageResponse
import com.andi.rest_crud.event.OrderCreatedEvent
import org.springframework.stereotype.Service
import java.util.concurrent.CopyOnWriteArrayList

@Service
class NotificationService {

    private val notifications = CopyOnWriteArrayList<NotificationMessageResponse>()

    fun record(event: OrderCreatedEvent) {
        notifications += NotificationMessageResponse(
            orderId = event.orderId,
            userId = event.userId,
            message = event.message
        )
    }

    fun getAll(): List<NotificationMessageResponse> = notifications.toList()
}
