import React, { useRef, useEffect, useState } from "react";
import { Send, Sparkles, Trash2, ArrowRight, BookOpen, Search, Download } from "lucide-react";
import Message from "./Message";

export default function ChatBox({ 
  messages, 
  loading, 
  sendMessage, 
  clearChat, 
  selectedFile, 
  setSelectedFile 
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages list grows or loading state shifts
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const handleExport = () => {
    let md = "# Chat Export\n\n";
    messages.forEach(msg => {
      md += `**${msg.role === "user" ? "You" : "AI"}**:\n${msg.content}\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-export.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chat-area">
      {/* Header bar */}
      <header className="chat-header">
        <div>
          {selectedFile ? (
            <div className="active-filter-badge">
              <BookOpen size={14} />
              <span>Targeting: {selectedFile.filename}</span>
              <button 
                className="clear-filter-btn" 
                onClick={() => setSelectedFile(null)}
                style={{ marginLeft: "6px", color: "var(--accent)" }}
              >
                ×
              </button>
            </div>
          ) : (
            <div className="active-filter-badge-global">
              <Search size={14} />
              <span>Searching Across All Documents</span>
            </div>
          )}
        </div>
        
        {messages.length > 0 && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="doc-delete-btn" onClick={handleExport} title="Download Chat" style={{ padding: "0.5rem" }}>
              <Download size={16} />
            </button>
            <button className="doc-delete-btn" onClick={clearChat} title="Clear Conversation" style={{ padding: "0.5rem" }}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Messages Scroll Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-overlay">
            {/* Floating particles background */}
            <div className="welcome-particles">
              <div className="particle p1"></div>
              <div className="particle p2"></div>
              <div className="particle p3"></div>
              <div className="particle p4"></div>
              <div className="particle p5"></div>
            </div>

            {/* Animated Logo */}
            <div className="welcome-hero-logo">
              <div className="hero-ring ring-outer"></div>
              <div className="hero-ring ring-inner"></div>
              <Sparkles size={32} />
            </div>

            {/* Gradient animated title */}
            <h1 className="welcome-title-animated">NeuralLens AI</h1>
            <p className="welcome-tagline">Your intelligent document companion — powered by RAG</p>

            {/* Feature Highlights */}
            <div className="feature-highlights">
              <div className="feature-chip">
                <span className="feature-chip-icon">🔍</span>
                <span>Semantic Search</span>
              </div>
              <div className="feature-chip">
                <span className="feature-chip-icon">📄</span>
                <span>PDF Analysis</span>
              </div>
              <div className="feature-chip">
                <span className="feature-chip-icon">🧠</span>
                <span>AI-Powered</span>
              </div>
              <div className="feature-chip">
                <span className="feature-chip-icon">📌</span>
                <span>Page Citations</span>
              </div>
            </div>

            {/* How it works - Step Cards */}
            <div className="welcome-steps">
              <div className="welcome-step-card" style={{"--delay": "0s"}}>
                <div className="step-icon-wrap"><span className="step-emoji">📤</span></div>
                <div className="step-card-num">Step 1</div>
                <div className="step-card-title">Upload PDFs</div>
                <div className="step-card-desc">Drag files into the sidebar. PyMuPDF parses every page automatically.</div>
              </div>
              <div className="welcome-step-card" style={{"--delay": "0.1s"}}>
                <div className="step-icon-wrap"><span className="step-emoji">⚡</span></div>
                <div className="step-card-num">Step 2</div>
                <div className="step-card-title">Vector Indexing</div>
                <div className="step-card-desc">LangChain chunks your text and indexes it in Pinecone vector storage.</div>
              </div>
              <div className="welcome-step-card" style={{"--delay": "0.2s"}}>
                <div className="step-icon-wrap"><span className="step-emoji">🎯</span></div>
                <div className="step-card-num">Step 3</div>
                <div className="step-card-title">Select Scope</div>
                <div className="step-card-desc">Focus on a single PDF or search across your entire document vault.</div>
              </div>
              <div className="welcome-step-card" style={{"--delay": "0.3s"}}>
                <div className="step-icon-wrap"><span className="step-emoji">💬</span></div>
                <div className="step-card-num">Step 4</div>
                <div className="step-card-title">Chat & Retrieve</div>
                <div className="step-card-desc">Ask questions and get instant answers with source & page citations.</div>
              </div>
            </div>

            {/* Quick Start Prompts */}
            <div className="quick-prompts-section">
              <p className="quick-prompts-label">⚡ Try a quick prompt</p>
              <div className="quick-prompts">
                <button className="quick-prompt-chip" onClick={() => { sendMessage("Summarize the key points of this document"); }}>
                  <ArrowRight size={12} />
                  Summarize key points
                </button>
                <button className="quick-prompt-chip" onClick={() => { sendMessage("What are the main skills and qualifications mentioned?"); }}>
                  <ArrowRight size={12} />
                  Skills & qualifications
                </button>
                <button className="quick-prompt-chip" onClick={() => { sendMessage("List all important dates and events mentioned in this document"); }}>
                  <ArrowRight size={12} />
                  Find dates & events
                </button>
              </div>
            </div>

            {/* Tech Stack Badge */}
            <div className="tech-stack-bar">
              <span className="tech-badge">LangChain</span>
              <span className="tech-dot">•</span>
              <span className="tech-badge">Pinecone</span>
              <span className="tech-dot">•</span>
              <span className="tech-badge">Groq LLM</span>
              <span className="tech-dot">•</span>
              <span className="tech-badge">FastAPI</span>
              <span className="tech-dot">•</span>
              <span className="tech-badge">React</span>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            
            {/* Thinking indicator */}
            {loading && (
              <div className="message-row ai">
                <div className="message-bubble-avatar ai">AI</div>
                <div className="message-bubble" style={{ minWidth: "120px" }}>
                  <div className="typing-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input section */}
      <div className="chat-input-wrapper">
        <form onSubmit={handleSubmit} className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedFile 
                ? `Ask about "${selectedFile.filename}"...` 
                : "Ask anything about all uploaded documents..."
            }
            disabled={loading}
          />
          <button 
            type="submit" 
            className="chat-send-btn" 
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}