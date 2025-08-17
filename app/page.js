"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState} from "react";

export default function Home() {

  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat = async () => {
    setLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/nap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({message})
      })

      const data = await res.json()
      setResponse(data.response)

    } catch (error) {
      setResponse(`Error ${error.message}`)
    }
    setLoading(false)
  }

  const handleStreamChat = async () => {
    setStreaming(true);
    setStreamResponse("");

    try {
      const res = await fetch("/api/chat/chat-stream", {
        method: "POST",
        header: {
          "Content-Type": "application"
        },
        body: JSON.stringify({message}),
      });

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const {done, value} = await reader.read()
        if (done) break;

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            setStreamResponse((prev) => prev + data.content)
          }
        }
      }
    } catch (error) {
      setStreamResponse(`Error ${error.message}`);
    }
    setLoading(false)
  }

    return (
      <div className={styles.page}>
        <h1>Snorlax AI — Let’s Talk”</h1>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What’s on your mind today?"
            rows={4}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "12px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              resize: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>
        <div>
          <button
            onClick={handleChat}
            style={{
              padding: "10px 20px",
              marginBottom: "12px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#0070f3", // Next.js blue
              color: "#fff",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              display: "block",
              margin: "0 auto", // centers button under textarea
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0059c9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#0070f3")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            {loading ? "Thinking..." : "Chat"}
          </button>
          <button
            onClick={handleStreamChat}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#45da00ff", // Next.js blue
              color: "#fff",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              display: "block",
              margin: "0 auto", // centers button under textarea
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#40c900ff")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#45da00ff")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
          >
            {loading ? "Thinking..." : "Stream Chat"}
          </button>
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            whiteSpace: "pre-wrap",
          }}
        >
          {response}
        </div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            whiteSpace: "pre-wrap",
          }}
        >
          {streamResponse}
        </div>
      </div>
    );
}
