import React from "react";
import useChat from "./hooks/useChat";
import Login from "./pages/Login";
import Home from "./pages/Home";

export default function App() {
  const chatState = useChat();

  // If user session is not active, display login screen
  if (!chatState.user) {
    return (
      <Login 
        login={chatState.login} 
        register={chatState.register}
        error={chatState.error} 
        setError={chatState.setError}
      />
    );
  }

  // Display SaaS dashboard when authenticated
  return <Home chatState={chatState} />;
}
