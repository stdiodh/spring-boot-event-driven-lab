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
        // TODO 1. 브로커에서 받은 주문 생성 이벤트를 후속 작업으로 연결하세요.
        // TODO 2. 이번 예시에서는 NotificationService로 넘겨 알림 기록만 남기면 충분합니다.
        // TODO 3. 소비자 안에서 주문 생성 로직까지 다시 처리하지 마세요.
        notificationService.record(event)
    }

    fun queueName(): String = queueName
}
