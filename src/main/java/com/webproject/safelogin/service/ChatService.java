package com.webproject.safelogin.service;

import com.webproject.safelogin.model.ChatMessage;
import com.webproject.safelogin.model.User;
import com.webproject.safelogin.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage save(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChatHistory(User sender, User receiver) {
        List<ChatMessage> messages1 = chatMessageRepository.findBySenderAndReceiver(sender, receiver);
        List<ChatMessage> messages2 = chatMessageRepository.findBySenderAndReceiver(receiver, sender);
        messages1.addAll(messages2);
        messages1.sort(Comparator.comparing(ChatMessage::getTimestamp));
        return messages1;
    }
}
