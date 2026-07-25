"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from '@ai-sdk/react';
import { usePricing } from '@/context/PricingContext';
import styles from "./Chatbot.module.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { formatPrice } = usePricing();

  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    body: {
      bootcampPrice: formatPrice('bootcamp'),
      professionalPrice: formatPrice('professional'),
    },
    initialMessages: [
      {
        id: 'msg-1',
        role: 'assistant',
        content: "Hello! 👋 I'm Elitech's AI assistant. How can I help you jumpstart your cybersecurity career today?",
      }
    ]
  });

  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className={styles.fab}
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.i
              key="close"
              className="fas fa-times"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            />
          ) : (
            <motion.i
              key="chat"
              className="fas fa-comment-dots"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.chatWindow}
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>
                  <i className="fas fa-robot" />
                  <div className={styles.onlineDot} />
                </div>
                <div>
                  <h3 className={styles.botName}>Elitech AI</h3>
                  <span className={styles.status}>Typically replies instantly</span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={handleToggle}>
                <i className="fas fa-minus" />
              </button>
            </div>

            <div className={styles.messagesContainer}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${msg.role === "user" ? styles.msgUser : styles.msgBot}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.role !== "user" && (
                    <div className={styles.msgAvatar}>
                      <i className="fas fa-robot" />
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    <div className={styles.messageBubble}>{msg.content}</div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  className={`${styles.messageWrapper} ${styles.msgBot}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.msgAvatar}>
                    <i className="fas fa-robot" />
                  </div>
                  <div className={styles.messageContent}>
                    <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage({ role: 'user', content: input });
              setInput('');
            }} className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className={styles.input}
                  value={input}
                  onChange={handleInputChange}
                  autoFocus
                />
                <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isLoading}>
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
              <div className={styles.footerBranding}>
                ⚡ Powered by Elitech AI (Groq)
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
