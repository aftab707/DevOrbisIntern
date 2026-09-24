import React, { useState, useEffect } from 'react';
import { uploadDocument, clearKnowledgeBase } from '../api/client';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error, clearing
  const [uploadDetails, setUploadDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'uploading') {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 2000); 
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleDragOver = (e) => { e.preventDefault(); };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const submitUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setUploadDetails(null);
    try {
      const res = await uploadDocument(file);
      setStatus('success');
      setUploadDetails(res);
      setFile(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure? This will permanently delete ALL vectors and data from both Supabase and FAISS. This action cannot be undone."
    );
    if (!confirmed) return;

    setStatus('clearing');
    try {
      await clearKnowledgeBase();
      setStatus('idle');
      alert("Success! The Knowledge Base has been completely wiped.");
      setFile(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Knowledge Base Management</h1>
        <p>Upload new documents or permanently wipe your existing databases.</p>
      </div>

      <div className="upload-workspace">
        {status === 'idle' || status === 'error' || status === 'clearing' ? (
          <>
            <div 
              className="drag-drop-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <h3>{file ? file.name : "Drag & drop a PDF document here"}</h3>
              <p>or</p>
              <label className="file-browse-btn">
                Browse Files
                <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
              </label>
            </div>

            <div className="upload-actions">
              <button 
                className="danger-btn" 
                onClick={handleClearDatabase} 
                disabled={status === 'clearing' || status === 'uploading'}
              >
                {status === 'clearing' ? 'Wiping Databases...' : 'Clear Knowledge Base'}
              </button>
              <button 
                className="primary-btn" 
                onClick={submitUpload} 
                disabled={!file || status === 'clearing'}
              >
                Embed Document
              </button>
            </div>
            
            {status === 'error' && (
              <div className="alert error">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
          </>
        ) : status === 'uploading' ? (
          <div className="processing-container">
            <div className="processing-spinner"></div>
            <h2>Processing Document...</h2>
            <ul className="processing-steps">
              <li className={progressStep >= 0 ? 'active' : ''}>
                {progressStep > 0 ? '✅' : '⏳'} Uploading file securely...
              </li>
              <li className={progressStep >= 1 ? 'active' : ''}>
                {progressStep > 1 ? '✅' : progressStep === 1 ? '⏳' : '⭕'} Extracting text & creating chunks...
              </li>
              <li className={progressStep >= 2 ? 'active' : ''}>
                {progressStep > 2 ? '✅' : progressStep === 2 ? '⏳' : '⭕'} Generating vector embeddings...
              </li>
            </ul>
          </div>
        ) : (
          <div className="success-container">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Completed Ingestion Process!</h2>
            <div className="success-details">
              <p><strong>File Name:</strong> <span>{uploadDetails?.filename}</span></p>
              <p><strong>Chunks Created:</strong> <span>{uploadDetails?.chunks_created} vectors</span></p>
              <p><strong>Status:</strong> <span className="status-ready">Ready for Chat</span></p>
            </div>
            <button className="primary-btn mt-20" onClick={() => setStatus('idle')}>
              Upload Another Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
