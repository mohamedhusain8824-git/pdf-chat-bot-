import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Login({ login, register, error, setError }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleToggle = () => {
    setIsSignUp(!isSignUp);
    if (setError) {
      setError(null);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (setError) setError(null);
    
    try {
      const success = await login(signInEmail, signInPassword);
      // useChat updates state and logs in automatically on success
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (setError) setError(null);

    try {
      const success = await register(signUpName, signUpEmail, signUpPassword);
      // useChat updates state and logs in automatically on success
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Dynamic Background Glow Effect */}
      <div className="landing-glow"></div>

      <div className={`auth-container ${isSignUp ? "active" : ""}`}>
        
        {/* SIGN UP FORM (Left underlying on desktop, visible when active) */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUpSubmit}>
            <div className="logo-section">
              <div className="logo-icon">
                <Sparkles size={20} />
              </div>
              <span className="logo-title">NeuralLens AI</span>
            </div>
            
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us to start indexing and conversing with your documents.</p>

            {isSignUp && error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#ef4444",
                padding: "0.75rem",
                borderRadius: "12px",
                fontSize: "0.82rem",
                marginBottom: "1.25rem"
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="signUpName">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  id="signUpName"
                  type="text"
                  className="input-field"
                  placeholder="Alex Rivera"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signUpEmail">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="signUpEmail"
                  type="email"
                  className="input-field"
                  placeholder="alex@company.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signUpPassword">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="signUpPassword"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Mobile view toggle trigger */}
          <div className="mobile-auth-toggle">
            Already have an account? 
            <span className="mobile-auth-link" onClick={handleToggle}>Sign In</span>
          </div>
        </div>

        {/* SIGN IN FORM (Right underlying on desktop, hidden when active) */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignInSubmit}>
            <div className="logo-section">
              <div className="logo-icon">
                <Sparkles size={20} />
              </div>
              <span className="logo-title">NeuralLens AI</span>
            </div>

            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your document vault to resume conversations.</p>

            {!isSignUp && error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#ef4444",
                padding: "0.75rem",
                borderRadius: "12px",
                fontSize: "0.82rem",
                marginBottom: "1.25rem"
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="signInEmail">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  id="signInEmail"
                  type="email"
                  className="input-field"
                  placeholder="alex@company.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signInPassword">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  id="signInPassword"
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Mobile view toggle trigger */}
          <div className="mobile-auth-toggle">
            Don't have an account? 
            <span className="mobile-auth-link" onClick={handleToggle}>Sign Up</span>
          </div>
        </div>

        {/* SLIDING DECORATIVE OVERLAY PANELS (Desktop only, hidden on mobile) */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* LEFT OVERLAY PANEL (Displays when SignUp is active, lets user switch to SignIn) */}
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal credentials.</p>
              <button className="btn-ghost" onClick={handleToggle} disabled={isLoading}>
                Sign In Instead
              </button>
            </div>

            {/* RIGHT OVERLAY PANEL (Displays when SignIn is active, lets user switch to SignUp) */}
            <div className="overlay-panel overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your details and start your journey with NeuralLens AI chatbot.</p>
              <button className="btn-ghost" onClick={handleToggle} disabled={isLoading}>
                Sign Up Instead
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
