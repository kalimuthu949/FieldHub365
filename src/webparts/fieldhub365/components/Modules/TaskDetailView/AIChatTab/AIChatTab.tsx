/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import { Job } from "../../../../config/interface";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useReveal } from "../../HomeView/HomeView";

interface AIChatTabProps {
  job: Job;
}

const AIChatTab: React.FC<AIChatTabProps> = ({ job }) => {
  const { ref, visible } = useReveal();
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: `Hi Alex! I've analyzed Work Order ${job.id}. How can I assist you with this maintenance task today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      //   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      //   const response = await ai.models.generateContent({
      //     model: "gemini-3-flash-preview",
      //     contents: `Context: You are a technical AI assistant for a field service management app.
      //       The technician is working on: ${job.title} for ${job.customer} at ${job.address}.
      //       Current Status: ${job.status}.
      //       Technician question: ${userText}`,
      //     config: { temperature: 0.7 },
      //   });
      const response = {
        text: "Based on the work order details, I recommend starting with the installation guide for the new filter unit. Make sure to check the calibration settings and compare them with the specifications in the manual. If you encounter any issues during installation, I can provide troubleshooting steps or connect you with a live support agent.",
      };
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            response.text ||
            "I'm having trouble connecting to my service manual. Please try again.",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Service error. Please check your connection." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Installation guide",
    "Troubleshooting steps",
    "Safety protocols",
  ];

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealVisible" : ""} ai-chat-container`}
    >
      <div className="chat-header">
        <Sparkles size={16} className="chat-header-icon" />
        <span className="chat-header-title">Co-Pilot Technical Support</span>
      </div>

      <div ref={scrollRef} className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message-wrapper ${m.role}`}>
            <div className={`message-bubble ${m.role}`}>{m.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot delay-100"></span>
              <span className="typing-dot delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <div className="suggestions-container">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="suggestion-button"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI technical details..."
            className="chat-input-field"
          />
          <button onClick={handleSend} className="send-button">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIChatTab);
