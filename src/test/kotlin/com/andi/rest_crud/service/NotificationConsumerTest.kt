package com.andi.rest_crud.service

import com.andi.rest_crud.event.OrderCreatedEvent
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class NotificationConsumerTest {

    private val notificationService = NotificationService()
    private val consumer = NotificationConsumer(notificationService, "notification.order-created")

    @Test
    fun `consumeOrderCreated는 알림 로그를 남긴다`() {
        consumer.consumeOrderCreated(
            OrderCreatedEvent(
                orderId = 1L,
                userId = "user-1",
                productName = "keyboard",
                message = "주문 1이 생성되었습니다."
            )
        )

        val notifications = notificationService.getAll()

        assertEquals(1, notifications.size)
        assertEquals("user-1", notifications.first().userId)
        assertEquals("주문 1이 생성되었습니다.", notifications.first().message)
    }
}
