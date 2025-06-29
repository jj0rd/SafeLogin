package com.webproject.safelogin.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


    @Entity
    public class ChatMessage {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private String content;
        private LocalDateTime timestamp;

        @ManyToOne
        @JoinColumn(name = "sender_id")
        private User sender;

        @ManyToOne
        @JoinColumn(name = "receiver_id")
        private User receiver;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public User getReceiver() {
            return receiver;
        }

        public void setReceiver(User receiver) {
            this.receiver = receiver;
        }

        public User getSender() {
            return sender;
        }

        public void setSender(User sender) {
            this.sender = sender;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }







}
