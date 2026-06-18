import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, LogOut, FilePlus2, CheckCircle2, MessageSquare, Plus } from "lucide-react";

export default function Sidebar({ 
  user, 
  logout, 
  files, 
  selectedFile, 
  setSelectedFile, 
  uploadFile, 
  deleteFile,
  uploading,
  sessions = [],
  currentSessionId,
  loadSession,
  clearChat
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // File size formatter
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        await uploadFile(file);
      } else {
        alert("Please upload PDF documents only");
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <aside className="sidebar">
      {/* Sidebar Header / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FileText size={18} />
          </div>
          <span className="sidebar-logo-text">DocuQuest</span>
        </div>
      </div>

      {/* Upload PDF Section */}
      <div className="upload-container">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="file-input-hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div 
          className={`dropzone ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onUploadClick}
        >
          <UploadCloud size={28} className="dropzone-icon" />
          <span className="dropzone-text">
            {uploading ? "Uploading & Indexing..." : "Upload your PDF"}
          </span>
          <span className="dropzone-hint">Drag & drop or browse</span>
          
          {uploading && (
            <div className="upload-progress-bar">
              <div className="upload-progress-fill" style={{ width: "70%" }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="doc-list-section">
        <div className="section-title">Your Documents</div>
        {files.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "2rem 0" }}>
            No PDFs uploaded yet.
          </div>
        ) : (
          <div className="doc-items">
            {/* Global Search Option */}
            <div 
              className={`doc-item ${!selectedFile ? "selected" : ""}`}
              onClick={() => setSelectedFile(null)}
            >
              <div className="doc-info">
                <CheckCircle2 size={16} className="doc-file-icon" />
                <div className="doc-details">
                  <span className="doc-name">Query All Documents</span>
                  <span className="doc-meta">Global Search</span>
                </div>
              </div>
            </div>

            {/* List individual PDFs */}
            {files.map((file, idx) => {
              const isSelected = selectedFile && selectedFile.filename === file.filename;
              return (
                <div 
                  key={idx}
                  className={`doc-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="doc-info">
                    <FileText size={16} className="doc-file-icon" style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)" }} />
                    <div className="doc-details">
                      <span className="doc-name" title={file.filename}>{file.filename}</span>
                      <span className="doc-meta">
                        {file.pages} pages • {formatBytes(file.size_bytes)}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="doc-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove "${file.filename}"? This deletes the file and clears all vectors.`)) {
                        deleteFile(file.filename);
                      }
                    }}
                    title="Delete PDF and vectors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat History Section */}
      <div className="doc-list-section" style={{ marginTop: "1rem" }}>
        <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Chat History</span>
          <button 
            className="doc-delete-btn" 
            onClick={clearChat} 
            title="Start New Chat"
            style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Plus size={14} /> New
          </button>
        </div>
        {sessions.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>
            No chat history yet.
          </div>
        ) : (
          <div className="doc-items" style={{ maxHeight: "150px", overflowY: "auto" }}>
            {sessions.map((session, idx) => {
              const isSelected = currentSessionId === session.session_id;
              return (
                <div 
                  key={idx}
                  className={`doc-item ${isSelected ? "selected" : ""}`}
                  onClick={() => loadSession(session.session_id)}
                >
                  <div className="doc-info">
                    <MessageSquare size={16} className="doc-file-icon" style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)" }} />
                    <div className="doc-details">
                      <span className="doc-name" title={session.title}>{session.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Session Footer */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-tier">{user.tier}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
