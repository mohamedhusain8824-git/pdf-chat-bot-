import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export default function useChat() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("saas_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Authenticate user (mock)
  const login = useCallback((email, password) => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    const mockUser = {
      email,
      name: email.split("@")[0],
      tier: "Pro Plan"
    };
    setUser(mockUser);
    localStorage.setItem("saas_user", JSON.stringify(mockUser));
    return true;
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("saas_user");
    setFiles([]);
    setSelectedFile(null);
    setMessages([]);
    setSessions([]);
    setCurrentSessionId(null);
  }, []);

  // Fetch list of files from backend
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("/documents");
      setFiles(response.data.documents || []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch documents from server");
    }
  }, [user]);

  // Fetch chat sessions from backend
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("/sessions");
      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, [user]);

  // Load files and sessions list on startup / user login
  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchSessions();
    }
  }, [user, fetchFiles, fetchSessions]);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await fetchFiles(); // Refresh files list
      
      // Auto-select the uploaded file for convenience
      const newFile = { filename: file.filename || file.name };
      setSelectedFile(newFile);
      
      return response.data;
    } catch (err) {
      console.error("Upload error:", err);
      const detail = err.response?.data?.detail || "Upload failed";
      setError(detail);
      throw new Error(detail);
    } finally {
      setUploading(false);
    }
  }, [fetchFiles]);

  // Delete file
  const deleteFile = useCallback(async (filename) => {
    setError(null);
    try {
      await api.delete(`/documents/${encodeURIComponent(filename)}`);
      await fetchFiles();
      
      if (selectedFile && selectedFile.filename === filename) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete document");
    }
  }, [fetchFiles, selectedFile]);

  // Load an existing session
  const loadSession = useCallback(async (sessionId) => {
    try {
      const response = await api.get(`/history/${sessionId}`);
      setMessages(response.data.history || []);
      setCurrentSessionId(sessionId);
    } catch (err) {
      console.error("Error loading session:", err);
      setError("Failed to load chat history.");
    }
  }, []);

  // Send Chat message
  const sendMessage = useCallback(async (questionText) => {
    if (!questionText.trim()) return;
    
    const userMessage = {
      role: "user",
      content: questionText
    };
    
    // Add user message to history instantly
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        question: questionText,
        filename: selectedFile ? selectedFile.filename : null
      };
      
      // Pass the active session_id if we have one
      if (currentSessionId) {
        payload.session_id = currentSessionId;
      }
      
      const response = await api.post("/chat", payload);
      
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        sources: response.data.sources || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If a new session was created on the backend, store its ID and refresh the list
      if (response.data.session_id && response.data.session_id !== currentSessionId) {
        setCurrentSessionId(response.data.session_id);
        fetchSessions();
      }
      
    } catch (err) {
      console.error("Chat error:", err);
      const detail = err.response?.data?.detail || "Server error. Is the backend running and config keys set?";
      setError(detail);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${detail}. Please check your connection and .env configurations.`
      }]);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, currentSessionId, fetchSessions]);

  // Clear current active chat / start new session
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  // Update selected file and reset chat
  const handleSetSelectedFile = useCallback((file) => {
    setSelectedFile(file);
    clearChat();
  }, [clearChat]);

  return {
    user,
    login,
    logout,
    files,
    selectedFile,
    setSelectedFile: handleSetSelectedFile,
    messages,
    sessions,
    currentSessionId,
    loadSession,
    loading,
    uploading,
    error,
    setError,
    uploadFile,
    deleteFile,
    sendMessage,
    clearChat
  };
}
