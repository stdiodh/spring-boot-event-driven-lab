package com.andi.rest_crud.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.DirectExchange
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.QueueBuilder
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory
import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.amqp.support.converter.MessageConverter
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class EventConfig(
    @Value("\${event.order.exchange}")
    private val exchangeName: String,
    @Value("\${event.order.queue}")
    private val queueName: String,
    @Value("\${event.order.routing-key}")
    private val routingKey: String
) {

    @Bean
    fun rabbitMessageConverter(): MessageConverter = Jackson2JsonMessageConverter()

    @Bean
    fun rabbitTemplate(
        connectionFactory: ConnectionFactory,
        rabbitMessageConverter: MessageConverter
    ): RabbitTemplate {
        return RabbitTemplate(connectionFactory).apply {
            messageConverter = rabbitMessageConverter
        }
    }

    @Bean
    fun rabbitListenerContainerFactory(
        connectionFactory: ConnectionFactory,
        rabbitMessageConverter: MessageConverter
    ): SimpleRabbitListenerContainerFactory {
        return SimpleRabbitListenerContainerFactory().apply {
            setConnectionFactory(connectionFactory)
            setMessageConverter(rabbitMessageConverter)
        }
    }

    @Bean
    fun orderEventExchange(): DirectExchange = DirectExchange(exchangeName)

    @Bean
    fun orderCreatedQueue(): Queue = QueueBuilder.durable(queueName).build()

    @Bean
    fun orderCreatedBinding(
        orderCreatedQueue: Queue,
        orderEventExchange: DirectExchange
    ): Binding {
        return BindingBuilder.bind(orderCreatedQueue)
            .to(orderEventExchange)
            .with(routingKey)
    }
}
