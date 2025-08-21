"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const outputAreaRef = useRef(null);

  const handleChat = async () => {
    setLoading(true);
    setResponse("");

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
    } catch (error) {
      setResponse(`Error ${error.message}`);
    }
    setLoading(false);
  };

  const handleStreamChat = async () => {
    setStreaming(true);
    setStreamResponse("");

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

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.substring(6));
            setStreamResponse((prev) => prev + data.content)
          }
        }
      }
    } catch (error) {
      console.error("Error parsing stream data:", error);
    }
    setStreaming(false);
  };

  // Auto-scroll output as responses stream in
  useEffect(() => {
    if (outputAreaRef.current) {
      outputAreaRef.current.scrollTop = outputAreaRef.current.scrollHeight;
    }
  }, [response, streamResponse, streaming]);

  return (
    <div className={styles.page}>
      <div className={styles.chatLayout}>
        <h1 className={styles.title}>Snorlax AI — Let’s Talk</h1>

        <div ref={outputAreaRef} className={styles.outputArea}>
          {response && <div className={styles.panel}>{response}</div>}
          {streamResponse && (
            <div className={`${styles.panel} ${styles.streamPanel}`}>{streamResponse}</div>
          )}
        </div>

        <div className={styles.promptBar}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
            className={styles.textarea}
          />
          <div className={styles.controls}>
            <button
              onClick={handleChat}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {loading ? "Thinking..." : "Send"}
            </button>
            <button onClick={handleStreamChat} className={styles.button}>
              {streaming ? "Streaming..." : "Stream"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
