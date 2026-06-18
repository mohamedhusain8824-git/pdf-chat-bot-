import React, { useState } from "react";
import { Sparkles, Mail, Lock } from "lucide-react";

export default function Login({ login, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="landing-container">
      <div className="landing-glow"></div>
      
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles size={24} />
          </div>
          <span className="logo-title">NeuralLens AI</span>
        </div>
        
        <p className="subtitle">
          The intelligent document vault. Index, analyze, and converse with your PDFs using LangChain and Pinecone.
        </p>

        {error && (
          <div style={{ 
            background: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgba(239, 68, 68, 0.25)", 
            color: "#ef4444", 
            padding: "0.75rem", 
            borderRadius: "10px", 
            fontSize: "0.85rem", 
            marginBottom: "1.5rem" 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Sign In to Dashboard
          </button>
        </form>

        <div style={{ marginTop: "2rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          💡 Tip: Enter any email & password to test-drive the SaaS workspace!
        </div>
      </div>
    </div>
  );
}
