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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Snorlax AI — Let's Talk</h1>

        <div ref={responseAreaRef} className={styles.responseSection}>
          {!response && !streamResponse && (
            <div className={styles.welcomeMessage}>
              <p>👋 Hi there! How can I help you today?</p>
            </div>
          )}

          {response && (
            <div className={styles.responseBox}>
              <div className={styles.responseTitle}>AI Response</div>
              <div className={styles.responseContent}>{response}</div>
            </div>
          )}

          {streamResponse && (
            <div className={styles.responseBox}>
              <div className={styles.responseTitle}>AI Stream</div>
              <div className={styles.responseContent}>{streamResponse}</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputSection}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
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

          <div className={styles.buttonGroup}>
            <button
              onClick={handleStreamChat}
              disabled={loading || streaming || !message.trim()}
              className={`${styles.button} ${styles.streamButton}`}
            >
              {streaming ? "Streaming..." : "Stream"}
            </button>
            <button
              onClick={handleChat}
              disabled={loading || streaming || !message.trim()}
              className={`${styles.button} ${styles.sendButton}`}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
