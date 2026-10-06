import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ListTodo,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const QUICK_QUESTIONS = [
  {
    id: "today",
    text: "How am I doing today?",
    icon: ListTodo,
  },
  {
    id: "habits",
    text: "Which habits am I missing most?",
    icon: BarChart3,
  },
  {
    id: "focus",
    text: "What should I focus on now?",
    icon: CheckCircle2,
  },
  {
    id: "week",
    text: "How was my week?",
    icon: TrendingUp,
  },
];

function formatText(content) {
  if (!content) return null;

  // Split into lines
  const lines = content.split("\n");
  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === "ol") {
        elements.push(
          <ol key={`ol-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>,
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`}>
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>,
        );
      }
      currentList = [];
      listType = null;
    }
  };

  const renderInline = (text) => {
    // Replace **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Unordered list items: •, -, *
    const bulletMatch = trimmed.match(/^[•\-*]\s+(.+)$/);
    if (bulletMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      currentList.push(bulletMatch[1]);
      return;
    }

    // Ordered list items: 1., 2., etc.
    const numberMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      currentList.push(numberMatch[1]);
      return;
    }

    flushList();
    elements.push(<p key={index}>{renderInline(trimmed)}</p>);
  });

  flushList();
  return elements;
}

export default function Coach({ user, api }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userName = user?.name || "Dude";
  const hasConversation = messages.length > 0;

  const scrollToBottom = () => {
    const messagesArea = messagesEndRef.current?.parentElement;
    messagesArea?.scrollTo({
      top: messagesArea.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setError("");
    setInput("");

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await api("/coach/chat", {
        method: "POST",
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6),
        }),
      });

      if (response && response.reply) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: response.reply },
        ]);
      } else {
        throw new Error(
          response?.message || "Failed to get response from Coach.",
        );
      }
    } catch (err) {
      setError(
        err.message || "Coach is temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`page coach-page ${hasConversation ? "has-conversation" : ""}`}
    >
      {/* 1. Page Header */}
      <div className="coach-header-row">
        <div className="coach-header-left">
          <h1>Coach</h1>
          <p>Your personal FocusDay assistant</p>
        </div>
        <div className="coach-info-chip">
          Ask about your tasks, habits, progress or get personalized
          suggestions.
        </div>
      </div>

      {/* 2. Welcome Card */}
      <div className="coach-welcome-card">
        <div className="coach-bot-avatar">
          <Bot size={24} strokeWidth={1.8} />
        </div>
        <div className="coach-welcome-content">
          <h2>Hi {userName},</h2>
          <p>
            I can help you with your tasks, habits and progress.
            <br />
            Ask me anything or choose a suggestion below.
          </p>
        </div>
      </div>

      {/* 3. Quick Questions */}
      <div className="coach-quick-section">
        <div className="coach-quick-heading">Quick questions</div>
        <div className="coach-quick-grid">
          {QUICK_QUESTIONS.map(({ id, text, icon: IconComponent }) => (
            <button
              key={id}
              type="button"
              className="coach-quick-card"
              onClick={() => handleSend(text)}
              disabled={loading}
            >
              <div className="coach-quick-left">
                <span className="coach-quick-icon">
                  <IconComponent size={19} strokeWidth={1.75} />
                </span>
                <span>{text}</span>
              </div>
              <span className="coach-quick-arrow">
                <ChevronRight size={16} strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Messages / Conversation Area */}
      {messages.length > 0 && (
        <div className="coach-messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`coach-message ${msg.role}`}>
              {msg.role === "assistant" && (
                <div className="coach-bot-avatar small">
                  <Bot size={18} strokeWidth={1.8} />
                </div>
              )}
              <div className="coach-bubble">
                <div className="coach-bubble-content">
                  {formatText(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="coach-message assistant">
              <div className="coach-bot-avatar small">
                <Bot size={18} strokeWidth={1.8} />
              </div>
              <div className="coach-bubble">
                <div className="coach-typing-indicator">
                  <div className="coach-typing-dot" />
                  <div className="coach-typing-dot" />
                  <div className="coach-typing-dot" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="coach-error-card">
              <span>{error}</span>
            </div>
          )}

          <div
            ref={messagesEndRef}
            style={{ height: "1px", scrollMarginBottom: "90px" }}
          />
        </div>
      )}

      {/* 5. Chat Input Bar */}
      <div className="coach-input-wrapper">
        <div className="coach-input-bar">
          <span className="coach-input-icon">
            <Sparkles size={18} strokeWidth={1.75} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="coach-input-field"
            placeholder="Ask FocusDay anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="button"
            className="coach-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <Send size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
