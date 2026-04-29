package com.andi.rest_crud.service

import com.andi.rest_crud.event.OrderCreatedEvent
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.amqp.rabbit.core.RabbitTemplate

class EventPublisherServiceTest {

    private val rabbitTemplate: RabbitTemplate = mock(RabbitTemplate::class.java)
    private val eventPublisherService = EventPublisherService(
        rabbitTemplate = rabbitTemplate,
        exchangeName = "order.events",
        routingKey = "order.created"
    )

    @Test
    fun `publishOrderCreated는 RabbitTemplate으로 이벤트를 보낸다`() {
        val event = OrderCreatedEvent(
            orderId = 1L,
            userId = "user-1",
            productName = "keyboard",
            message = "주문 1이 생성되었습니다."
        )

        eventPublisherService.publishOrderCreated(event)

        verify(rabbitTemplate).convertAndSend("order.events", "order.created", event)
    }
}
