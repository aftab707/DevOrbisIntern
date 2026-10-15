import React, { useState, useEffect } from 'react';
import { uploadDocument, clearKnowledgeBase } from '../api/client';

const UploadPage = ({ onNavigateChat }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error, clearing
  const [uploadDetails, setUploadDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let interval;
    if (status === 'uploading') {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1800);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.toLowerCase().endsWith('.pdf')) {
        setFile(dropped);
        setStatus('idle');
      } else {
        alert('Please drop a valid PDF document.');
      }
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
      '⚠️ WARNING: Are you sure you want to clear the knowledge base? This will wipe all FAISS vector embeddings permanently.'
    );
    if (!confirmed) return;

    setStatus('clearing');
    try {
      await clearKnowledgeBase();
      setStatus('idle');
      alert('Success: The Knowledge Base has been completely wiped.');
      setFile(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1>Document Knowledge Base</h1>
        <p>Embed internal PDF documents into local vector space for accurate RAG answering.</p>
      </div>

      {/* RAG Engine Specs Summary Row */}
      <div className="specs-row">
        <div className="spec-card">
          <div className="spec-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="spec-meta">
            <label>Supported Format</label>
            <span>PDF Documents</span>
          </div>
        </div>

        <div className="spec-card">
          <div className="spec-icon-box" style={{ background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div className="spec-meta">
            <label>Chunking Window</label>
            <span>500 Characters</span>
          </div>
        </div>

        <div className="spec-card">
          <div className="spec-icon-box" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <div className="spec-meta">
            <label>Vector Index</label>
            <span>FAISS Dense Store</span>
          </div>
        </div>
      </div>

      {/* Main Upload Workspace */}
      <div className="upload-card">
        {status === 'idle' || status === 'error' || status === 'clearing' ? (
          <>
            <div 
              className={`drag-drop-zone ${isDragging ? 'active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="zone-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>

              <h3>{file ? file.name : 'Drag & drop your PDF document here'}</h3>
              <p>
                {file 
                  ? `File ready: ${(file.size / (1024 * 1024)).toFixed(2)} MB · Click "Embed Document" below`
                  : 'Supported file type: Adobe PDF (.pdf) up to 50MB'}
              </p>

              {!file ? (
                <label className="browse-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                  Browse PDF File
                  <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
                </label>
              ) : (
                <div className="selected-file-badge">
                  <span>📄 {file.name}</span>
                  <button 
                    onClick={() => setFile(null)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="upload-actions">
              <button 
                className="danger-btn" 
                onClick={handleClearDatabase} 
                disabled={status === 'clearing'}
              >
                {status === 'clearing' ? 'Wiping Database...' : 'Clear Knowledge Base'}
              </button>

              <div className="action-buttons-right">
                <button 
                  className="primary-btn" 
                  onClick={submitUpload} 
                  disabled={!file || status === 'clearing'}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Embed Document
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div className="alert error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}
          </>
        ) : status === 'uploading' ? (
          /* Processing Screen */
          <div className="processing-container">
            <div className="processing-spinner" />
            <h2>Synthesizing Vector Embeddings</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your PDF is being analyzed, chunked semantically, and embedded into the FAISS index.
            </p>
            <ul className="processing-steps">
              <li className={progressStep >= 0 ? (progressStep > 0 ? 'completed' : 'active') : ''}>
                <span>{progressStep > 0 ? '✅' : '⏳'}</span>
                <span>Reading document pages and extracting text...</span>
              </li>
              <li className={progressStep >= 1 ? (progressStep > 1 ? 'completed' : 'active') : ''}>
                <span>{progressStep > 1 ? '✅' : progressStep === 1 ? '⏳' : '⭕'}</span>
                <span>Generating 500-char semantic text chunks...</span>
              </li>
              <li className={progressStep >= 2 ? (progressStep > 2 ? 'completed' : 'active') : ''}>
                <span>{progressStep > 2 ? '✅' : progressStep === 2 ? '⏳' : '⭕'}</span>
                <span>Calculating dense 384d BGE-small embeddings...</span>
              </li>
              <li className={progressStep >= 3 ? 'completed' : ''}>
                <span>{progressStep >= 3 ? '✅' : '⭕'}</span>
                <span>Writing vectors to local FAISS index...</span>
              </li>
            </ul>
          </div>
        ) : (
          /* Success Screen */
          <div className="success-container">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Document Ingestion Complete!</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '20px' }}>
              The vector embeddings have been indexed and are immediately available for grounded RAG chat.
            </p>

            <div className="success-details">
              <p>
                <strong>Source Filename:</strong>
                <span>{uploadDetails?.filename}</span>
              </p>
              <p>
                <strong>Semantic Chunks:</strong>
                <span style={{ color: '#0284c7' }}>{uploadDetails?.chunks_created} vectors created</span>
              </p>
              <p>
                <strong>RAG Status:</strong>
                <span className="status-ready">Ready for Semantic Querying</span>
              </p>
            </div>

            <div className="success-buttons">
              <button 
                className="sample-doc-btn" 
                onClick={() => setStatus('idle')}
              >
                Upload Another Document
              </button>

              {onNavigateChat && (
                <button 
                  className="primary-btn" 
                  onClick={onNavigateChat}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  Start Asking Questions →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
