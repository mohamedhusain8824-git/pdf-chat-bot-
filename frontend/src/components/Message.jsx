import React from "react";
import { FileText } from "lucide-react";

export default function Message({ message }) {
  const isUser = message.role === "user";
  
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
          <div className="citations-container">
            {message.sources.map((src, i) => (
              <span key={i} className="citation-pill" title={src.filename}>
                <FileText size={11} className="citation-icon" />
                <span>{src.filename} (Pg {src.page})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
