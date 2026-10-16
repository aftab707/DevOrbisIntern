import { useRef, useState } from 'react';
import { clearKnowledgeBase, ingestDocument } from '../services/api';
import {
  SparklesIcon,
  BotIcon,
  CalculatorIcon,
  BookOpenIcon,
  BuildingIcon,
  MailIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UploadCloudIcon,
  TrashIcon,
  FileTextIcon,
  CpuIcon
} from './Icons';

const AdminSidebar = ({ knowledgeBase, onKnowledgeBaseChange, onKnowledgeBaseCleared }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setBusyAction('upload');
    setStatus('Reading and indexing PDF chunks with sentence-transformers...');
    try {
      const result = await ingestDocument(file);
      await onKnowledgeBaseChange();
      setStatus(`✓ ${result.message}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Document indexing failed. Check server logs.');
    } finally {
      setBusyAction('');
    }
  };

  const handleClear = async () => {
    if (!knowledgeBase.chunks) return;
    const confirmed = window.confirm(
      `Clear ${knowledgeBase.chunks} searchable chunks from the knowledge base? Client records will stay safe.`
    );
    if (!confirmed) return;

    setBusyAction('clear');
    setStatus('Clearing the vector knowledge base...');
    try {
      const result = await clearKnowledgeBase();
      await onKnowledgeBaseChange();
      onKnowledgeBaseCleared();
      setStatus('✓ RAG vector store purged. Ready for fresh documents.');
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Could not clear the knowledge base.');
    } finally {
      setBusyAction('');
    }
  };

  const isBusy = Boolean(busyAction);

  const activeTools = [
    { name: 'Calculator', desc: 'AST Math Sandbox', icon: <CalculatorIcon size={16} />, type: 'safe' },
    { name: 'Knowledge Base', desc: 'Supabase pgvector RAG', icon: <BookOpenIcon size={16} />, type: 'safe' },
    { name: 'Client CRM', desc: 'Accounts & Balances', icon: <BuildingIcon size={16} />, type: 'safe' },
    { name: 'Draft Email', desc: 'Compose proposed email', icon: <MailIcon size={16} />, type: 'safe' },
    { name: 'Send Email', desc: 'HITL Executive Gate', icon: <ShieldAlertIcon size={16} />, type: 'gate' },
  ];

  return (
    <aside className="workspace-sidebar">
      {/* Brand Header */}
      <div className="brand-lockup">
        <div className="brand-identity">
          <div className="brand-mark" aria-hidden="true">
            <BotIcon size={22} />
          </div>
          <div className="brand-info">
            <h1>Ops AI Assistant</h1>
            <span className="brand-badge">LangGraph v0.2</span>
          </div>
        </div>
      </div>

      {/* Agent Telemetry & Architecture */}
      <div>
        <div className="sidebar-section-title">
          <span>Engine Telemetry</span>
          <CpuIcon size={14} />
        </div>
        <div className="telemetry-card">
          <div className="telemetry-row">
            <span className="telemetry-label">Architecture</span>
            <span className="telemetry-badge-emerald">
              <span className="status-dot-pulse" style={{ width: 6, height: 6 }} />
              StateGraph
            </span>
          </div>
          <div className="telemetry-row">
            <span className="telemetry-label">LLM Core</span>
            <span className="telemetry-value">Llama-3.3-70b</span>
          </div>
          <div className="telemetry-row">
            <span className="telemetry-label">HITL Guard</span>
            <span className="telemetry-badge-amber">
              <ShieldCheckIcon size={12} />
              Armed
            </span>
          </div>
        </div>
      </div>

      {/* Available Tools Suite */}
      <div>
        <div className="sidebar-section-title">
          <span>Connected Tools ({activeTools.length})</span>
          <SparklesIcon size={14} />
        </div>
        <div className="tools-list">
          {activeTools.map((t) => (
            <div key={t.name} className={`tool-item ${t.type === 'gate' ? 'sensitive' : ''}`}>
              <div className="tool-icon-wrapper">
                {t.icon}
              </div>
              <div className="tool-info">
                <span className="tool-name">{t.name}</span>
                <span className="tool-desc">{t.desc}</span>
              </div>
              <span className={`tool-tag ${t.type}`}>
                {t.type === 'gate' ? 'HITL' : 'SAFE'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Base (RAG) Management */}
      <section className="knowledge-panel" aria-labelledby="kb-panel-title">
        <div className="panel-header">
          <div className="panel-header-left">
            <BookOpenIcon size={16} />
            <span id="kb-panel-title">RAG Vector Base</span>
          </div>
          <span className="chunk-counter-badge">
            {knowledgeBase.chunks} {knowledgeBase.chunks === 1 ? 'Chunk' : 'Chunks'}
          </span>
        </div>

        {/* Sources List */}
        <div className="source-chips-container">
          {knowledgeBase.sources.length > 0 ? (
            knowledgeBase.sources.map((src, i) => (
              <div key={i} className="source-chip" title={src}>
                <FileTextIcon size={12} />
                <span>{src}</span>
              </div>
            ))
          ) : (
            <p className="source-empty-hint">
              No documents indexed. Ingest a company PDF to enable contextual RAG answering.
            </p>
          )}
        </div>

        {/* Upload Dropzone */}
        <label className={`drop-zone ${file ? 'has-file' : ''}`} htmlFor="knowledge-pdf">
          <input
            ref={fileInputRef}
            id="knowledge-pdf"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isBusy}
          />
          <div className="upload-icon">
            <UploadCloudIcon size={24} />
          </div>
          <span className="upload-title">{file ? file.name : 'Choose or drop PDF'}</span>
          <span className="upload-caption">Vectorized via pgvector • Max 20 MB</span>
        </label>

        {/* Action Buttons */}
        <button
          className="primary-action"
          onClick={handleUpload}
          disabled={!file || isBusy}
        >
          <UploadCloudIcon size={16} />
          {busyAction === 'upload' ? 'Indexing Chunks...' : 'Ingest & Index PDF'}
        </button>

        <button
          className="secondary-action danger-action"
          onClick={handleClear}
          disabled={!knowledgeBase.chunks || isBusy}
        >
          <TrashIcon size={14} />
          {busyAction === 'clear' ? 'Purging...' : 'Purge Vector Store'}
        </button>

        {status && (
          <div className="sidebar-status-banner" role="status">
            {status}
          </div>
        )}
      </section>

      {/* Security Guard Footnote Card */}
      <div className="security-guard-card">
        <div className="security-guard-icon">
          <ShieldAlertIcon size={18} />
        </div>
        <div className="security-guard-text">
          <strong>Security Gate Active</strong>
          External dispatches and mutations pause for human executive authorization.
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
