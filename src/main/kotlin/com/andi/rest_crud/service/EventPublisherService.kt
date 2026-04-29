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
        // TODO 1. 주문 생성 결과를 exchange와 routing key를 이용해 브로커로 전달하세요.
        // TODO 2. 발행 서비스 안에서 알림 처리까지 직접 하지 마세요.
        // TODO 3. 이 단계의 목표는 "결과를 이벤트로 넘긴다"는 흐름 이해입니다.
        rabbitTemplate.convertAndSend(exchangeName, routingKey, event)
    }
}
