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
                productName = "keyboard"
            )
        )

        val notifications = notificationService.getAll()

        assertEquals(1, notifications.size)
        assertEquals("user-1", notifications.first().userId)
        assertEquals("주문 1번(keyboard)이 생성되었습니다.", notifications.first().message)
    }

    @Test
    fun `같은 주문 이벤트를 다시 받아도 알림은 한 번만 기록한다`() {
        val event = OrderCreatedEvent(orderId = 1L, userId = "user-1", productName = "keyboard")

        consumer.consumeOrderCreated(event)
        consumer.consumeOrderCreated(event)

        assertEquals(1, notificationService.getAll().size)
    }
}
