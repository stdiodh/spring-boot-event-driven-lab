package com.andi.rest_crud.service

import com.andi.rest_crud.event.OrderCreatedEvent
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class EventPublisherService(
    private val rabbitTemplate: RabbitTemplate,
    @Value("\${event.order.exchange}")
    private val exchangeName: String,
    @Value("\${event.order.routing-key}")
    private val routingKey: String
) {

    fun publishOrderCreated(event: OrderCreatedEvent) {
        rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
    }
}
