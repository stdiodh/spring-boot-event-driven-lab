package com.andi.rest_crud.service

import com.andi.rest_crud.event.OrderCreatedEvent
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import com.andi.rest_crud.dto.OrderCreateRequest
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.springframework.amqp.rabbit.core.RabbitTemplate

class OrderServiceTest {

    private val rabbitTemplate: RabbitTemplate = mock(RabbitTemplate::class.java)
    private val publisherService = EventPublisherService(
        rabbitTemplate = rabbitTemplate,
        exchangeName = "order.events",
        routingKey = "order.created"
    )
    private val orderService = OrderService(publisherService)

    @Test
    fun `createOrder는 주문 생성 이벤트를 발행한다`() {
        val request = OrderCreateRequest(
            userId = " user-1 ",
            productName = " keyboard "
        )

        val response = orderService.createOrder(request)

        val eventCaptor = ArgumentCaptor.forClass(OrderCreatedEvent::class.java)
        verify(rabbitTemplate).convertAndSend(
            org.mockito.Mockito.eq("order.events"),
            org.mockito.Mockito.eq("order.created"),
            eventCaptor.capture()
        )

        assertEquals(response.orderId, eventCaptor.value.orderId)
        assertEquals("user-1", eventCaptor.value.userId)
        assertEquals("keyboard", eventCaptor.value.productName)
        assertTrue(eventCaptor.value.message.contains("주문"))
    }
}
