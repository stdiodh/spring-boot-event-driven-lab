package com.andi.rest_crud.service

import com.andi.rest_crud.event.OrderCreatedEvent
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class NotificationConsumer(
    private val notificationService: NotificationService,
    @Value("\${event.order.queue}")
    private val queueName: String
) {

    @RabbitListener(queues = ["\${event.order.queue}"])
    fun consumeOrderCreated(event: OrderCreatedEvent) {
        notificationService.record(event)
    }

    fun queueName(): String = queueName
}
