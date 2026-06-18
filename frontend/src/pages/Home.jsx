import React from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

export default function Home({ chatState }) {
  return (
    <div className="app-container">
      <Sidebar 
        user={chatState.user}
        logout={chatState.logout}
        files={chatState.files}
        selectedFile={chatState.selectedFile}
        setSelectedFile={chatState.setSelectedFile}
        uploadFile={chatState.uploadFile}
        deleteFile={chatState.deleteFile}
        uploading={chatState.uploading}
        sessions={chatState.sessions}
        currentSessionId={chatState.currentSessionId}
        loadSession={chatState.loadSession}
        clearChat={chatState.clearChat}
        sendMessage={chatState.sendMessage}
      />
      <ChatBox 
        messages={chatState.messages}
        loading={chatState.loading}
        sendMessage={chatState.sendMessage}
        clearChat={chatState.clearChat}
        selectedFile={chatState.selectedFile}
        setSelectedFile={chatState.setSelectedFile}
      />
    </div>
  );
}
