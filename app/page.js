"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamResponse, setStreamResponse] = useState("");
  const [conversations, setConversations] = useState([
    { id: 1, title: "Welcome Chat", date: "Today", active: true },
    { id: 2, title: "Poetry Discussion", date: "Yesterday", active: false },
    { id: 3, title: "Code Help", date: "2 days ago", active: false },
    { id: 4, title: "Creative Writing", date: "1 week ago", active: false },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const responseAreaRef = useRef(null);

  // Auto scroll to bottom when new content is added
  const scrollToBottom = () => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  };

  // Scroll when responses change
  useEffect(() => {
    scrollToBottom();
  }, [response, streamResponse]);

  const handleChat = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");
    setStreamResponse("");

    try {
      const res = await fetch("/api/nap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.response);
      setMessage(""); // Clear input after sending
    } catch (error) {
      setResponse(`Error ${error.message}`);
    }
    setLoading(false);
  };

  const handleStreamChat = async () => {
    if (!message.trim()) return;

    setStreaming(true);
    setStreamResponse("");
    setResponse("");

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.substring(6));
            setStreamResponse((prev) => {
              const newContent = prev + data.content;
              // Trigger scroll after state update
              setTimeout(scrollToBottom, 10);
              return newContent;
            });
          }
        }
      }
      setMessage(""); // Clear input after streaming completes
    } catch (error) {
      console.error("Error parsing stream data:", error);
    }
    setStreaming(false);
  };

  const newChat = () => {
    setResponse("");
    setStreamResponse("");
    setMessage("");
    // Add new conversation to the list
    const newConv = {
      id: Date.now(),
      title: "New Chat",
      date: "Now",
      active: true,
    };
    setConversations((prev) => [
      newConv,
      ...prev.map((conv) => ({ ...conv, active: false })),
    ]);
  };

  const selectConversation = (id) => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        active: conv.id === id,
      }))
    );
    // In a real app, you'd load the conversation messages here
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.sidebarHeader}>
          <button onClick={newChat} className={styles.newChatButton}>
            <span className={styles.plusIcon}>+</span>
            New chat
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.toggleButton}
          >
            <span className={styles.hamburger}>☰</span>
          </button>
        </div>

        <div className={styles.conversationsList}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`${styles.conversationItem} ${
                conv.active ? styles.active : ""
              }`}
            >
              <div className={styles.conversationTitle}>{conv.title}</div>
              <div className={styles.conversationDate}>{conv.date}</div>
            </div>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>👤</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>User</div>
              <div className={styles.userPlan}>Free Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.mainArea}>
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className={styles.mobileToggle}
              >
                ☰
              </button>
            )}
            <h1 className={styles.title}>Snorlax AI</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.modelSelector}>
              <span className={styles.modelLabel}>Snorlax-3.5</span>
            </div>
          </div>
        </div>

        <div ref={responseAreaRef} className={styles.responseSection}>
          {!response && !streamResponse && (
            <div className={styles.welcomeContainer}>
              <div className={styles.welcomeIcon}>🦥</div>
              <div className={styles.welcomeTitle}>
                How can I help you today?
              </div>
              <div className={styles.suggestionGrid}>
                <div
                  className={styles.suggestion}
                  onClick={() => setMessage("Write a poem about nature")}
                >
                  <div className={styles.suggestionIcon}>✍️</div>
                  <div className={styles.suggestionText}>
                    Write a poem about nature
                  </div>
                </div>
                <div
                  className={styles.suggestion}
                  onClick={() => setMessage("Explain quantum physics simply")}
                >
                  <div className={styles.suggestionIcon}>🧪</div>
                  <div className={styles.suggestionText}>
                    Explain quantum physics simply
                  </div>
                </div>
                <div
                  className={styles.suggestion}
                  onClick={() => setMessage("Help me debug this code")}
                >
                  <div className={styles.suggestionIcon}>💻</div>
                  <div className={styles.suggestionText}>
                    Help me debug this code
                  </div>
                </div>
                <div
                  className={styles.suggestion}
                  onClick={() => setMessage("Plan a weekend trip")}
                >
                  <div className={styles.suggestionIcon}>🗺️</div>
                  <div className={styles.suggestionText}>
                    Plan a weekend trip
                  </div>
                </div>
              </div>
            </div>
          )}

          {(response || streamResponse) && (
            <div className={styles.conversationFlow}>
              {message && (
                <div className={styles.userMessage}>
                  <div className={styles.messageAvatar}>👤</div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageSender}>You</div>
                    <div className={styles.messageText}>{message}</div>
                  </div>
                </div>
              )}

              {response && (
                <div className={styles.aiMessage}>
                  <div className={styles.messageAvatar}>🦥</div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageSender}>Snorlax AI</div>
                    <div className={styles.messageText}>{response}</div>
                  </div>
                </div>
              )}

              {streamResponse && (
                <div className={styles.aiMessage}>
                  <div className={styles.messageAvatar}>🦥</div>
                  <div className={styles.messageContent}>
                    <div className={styles.messageSender}>Snorlax AI</div>
                    <div className={styles.messageText}>{streamResponse}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputSection}>
          <div className={styles.inputContainer}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Snorlax AI..."
              rows={1}
              className={styles.textarea}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim() && !loading && !streaming) {
                    handleChat();
                  }
                }
              }}
            />

            <div className={styles.inputActions}>
              <button
                onClick={handleStreamChat}
                disabled={loading || streaming || !message.trim()}
                className={`${styles.actionButton} ${styles.streamButton}`}
                title="Stream response"
              >
                ⚡
              </button>
              <button
                onClick={handleChat}
                disabled={loading || streaming || !message.trim()}
                className={`${styles.actionButton} ${styles.sendButton}`}
                title="Send message"
              >
                {loading ? "⏳" : "➤"}
              </button>
            </div>
          </div>
          <div className={styles.inputFooter}>
            <span className={styles.footerText}>
              Snorlax AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
