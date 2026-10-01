import { useRef, useState } from 'react';
import { clearKnowledgeBase, ingestDocument } from '../services/api';

const AdminSidebar = ({ knowledgeBase, onKnowledgeBaseChange, onKnowledgeBaseCleared }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setBusyAction('upload');
    setStatus('Reading and indexing your PDF...');
    try {
      const result = await ingestDocument(file);
      await onKnowledgeBaseChange();
      setStatus(result.message);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Document indexing failed.');
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
    setStatus('Clearing the knowledge base...');
    try {
      const result = await clearKnowledgeBase();
      await onKnowledgeBaseChange();
      onKnowledgeBaseCleared();
      setStatus(result.message + ' A fresh conversation is ready for your next PDF.');
    } catch (error) {
      setStatus(error.response?.data?.detail || 'Could not clear the knowledge base.');
    } finally {
      setBusyAction('');
    }
  };

  const isBusy = Boolean(busyAction);
  const sourceLabel = knowledgeBase.chunks
    ? `${knowledgeBase.chunks} indexed chunks`
    : 'No PDF indexed yet';

  return (
    <aside className="workspace-sidebar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">OA</div>
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Ops Assistant</h1>
        </div>
      </div>

      <section className="knowledge-panel" aria-labelledby="knowledge-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sources</p>
            <h2 id="knowledge-title">Knowledge base</h2>
          </div>
          <span className={`status-dot ${knowledgeBase.chunks ? 'ready' : ''}`} title={sourceLabel} />
        </div>

        <div className="source-summary">
          <strong>{sourceLabel}</strong>
          <span>
            {knowledgeBase.sources.length
              ? knowledgeBase.sources.join(', ')
              : 'Upload a PDF to give the assistant company context.'}
          </span>
        </div>

        <label className="drop-zone" htmlFor="knowledge-pdf">
          <input
            ref={fileInputRef}
            id="knowledge-pdf"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            disabled={isBusy}
          />
          <span className="upload-title">{file ? file.name : 'Choose a PDF'}</span>
          <span className="upload-caption">PDF only, maximum 20 MB</span>
        </label>

        <button className="primary-action" onClick={handleUpload} disabled={!file || isBusy}>
          {busyAction === 'upload' ? 'Indexing PDF...' : 'Add to knowledge base'}
        </button>
        <button className="secondary-action danger-action" onClick={handleClear} disabled={!knowledgeBase.chunks || isBusy}>
          {busyAction === 'clear' ? 'Clearing RAG...' : 'Clear RAG knowledge base'}
        </button>
        {status && <p className="sidebar-status" role="status">{status}</p>}
      </section>

      <div className="sidebar-footnote">
        Email sending pauses for your approval.
      </div>
    </aside>
  );
};

export default AdminSidebar;
