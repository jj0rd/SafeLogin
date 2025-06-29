package com.webproject.safelogin.controller;

import com.webproject.safelogin.model.ChatMessage;
import com.webproject.safelogin.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;


@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(@Payload ChatMessage message) {
        return chatService.save(message);
    }

    @MessageMapping("/private")
    public void sendPrivateMessage(@Payload ChatMessage message) {
        chatService.save(message);
        messagingTemplate.convertAndSendToUser(
                message.getReceiver().getNick(),
                "/queue/private",
                message
        );
    }

}
