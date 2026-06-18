import React, { useState } from "react";
import { FileText, Volume2, Square } from "lucide-react";

export default function Message({ message }) {
  const isUser = message.role === "user";
  const [isPlaying, setIsPlaying] = useState(false);
  
  // A simple markdown processor for rendering lists, headers, and code snippets in the chat bubble
  const renderContent = (content) => {
    return content.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      
      // Bullets
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <ul key={idx} style={{ paddingLeft: "1.2rem", margin: "0.2rem 0" }}>
            <li>{renderInlineStyles(trimmed.substring(2))}</li>
          </ul>
        );
      }
      
      // Numbers
      if (/^\d+\.\s/.test(trimmed)) {
        const indexDot = trimmed.indexOf(".");
        return (
          <ol key={idx} style={{ paddingLeft: "1.2rem", margin: "0.2rem 0" }}>
            <li>{renderInlineStyles(trimmed.substring(indexDot + 1).trim())}</li>
          </ol>
        );
      }
      
      // Bold or Code blocks
      return (
        <p key={idx} style={{ marginBottom: "0.4rem", lineHeight: "1.5" }}>
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  const renderInlineStyles = (text) => {
    // Process bold (**text**) and code (`code`)
    const parts = [];
    let currentIdx = 0;
    
    // Regex for inline structures
    const inlineRegex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    
    while ((match = inlineRegex.exec(text)) !== null) {
      const matchStr = match[0];
      const matchIndex = match.index;
      
      // Add text before match
      if (matchIndex > currentIdx) {
        parts.push(text.substring(currentIdx, matchIndex));
      }
      
      if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
        parts.push(<strong key={matchIndex}>{matchStr.slice(2, -2)}</strong>);
      } else if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
        parts.push(<code key={matchIndex} style={{ background: "rgba(0,0,0,0.25)", padding: "2px 4px", borderRadius: "4px", fontSize: "0.85em" }}>{matchStr.slice(1, -1)}</code>);
      }
      
      currentIdx = inlineRegex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className={`message-row ${isUser ? "user" : "ai"}`}>
      <div className={`message-bubble-avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "U" : "AI"}
      </div>
      <div className="message-bubble">
        <div className="message-text">
          {renderContent(message.content)}
        </div>
        
        {/* Sources block */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="citations-container" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {message.sources.map((src, i) => (
              <span key={i} className="citation-pill" title={src.source} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                <FileText size={11} className="citation-icon" />
                <span>{src.source} (Pg {src.page})</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {!isUser && (
        <button 
          onClick={toggleSpeech} 
          className="tts-btn" 
          title={isPlaying ? "Stop reading" : "Read aloud"}
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", alignSelf: "flex-end", marginBottom: "8px", marginLeft: "8px" }}
        >
          {isPlaying ? <Square size={16} /> : <Volume2 size={16} />}
        </button>
      )}
    </div>
  );
}
