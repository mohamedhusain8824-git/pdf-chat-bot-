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
            <div className="welcome-icon-glow">
              <Sparkles size={38} />
            </div>
            <h1 className="welcome-title">NeuralLens AI</h1>
            <p className="welcome-desc">
              Upload multiple PDF documents and converse with them. Extract exact page references, ask complex conceptual questions, or summarize files in seconds.
            </p>
            
            <div className="welcome-steps">
              <div className="welcome-step-card">
                <div className="step-card-num">Step 1</div>
                <div className="step-card-title">Upload PDFs</div>
                <div className="step-card-desc">Drag your files into the sidebar. They will be parsed by PyMuPDF automatically.</div>
              </div>
              <div className="welcome-step-card">
                <div className="step-card-num">Step 2</div>
                <div className="step-card-title">Vector Indexing</div>
                <div className="step-card-desc">LangChain splits and indexes your texts into Pinecone vector storage.</div>
              </div>
              <div className="welcome-step-card">
                <div className="step-card-num">Step 3</div>
                <div className="step-card-title">Select Scope</div>
                <div className="step-card-desc">Select a specific file to focus your questions, or search across your entire vault.</div>
              </div>
              <div className="welcome-step-card">
                <div className="step-card-num">Step 4</div>
                <div className="step-card-title">Chat & Retrieve</div>
                <div className="step-card-desc">Ask queries and see instant, citation-mapped summaries with page citations.</div>
              </div>
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