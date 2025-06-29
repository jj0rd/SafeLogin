package com.webproject.safelogin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // czat będzie nadawał na /topic
        config.setApplicationDestinationPrefixes("/app"); // klient będzie wysyłał na /app
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat") // endpoint WebSocketa
                .setAllowedOriginPatterns("*") // zmień na frontendowy adres w prod.
                .withSockJS(); // fallback dla starszych przeglądarek
    }
}
