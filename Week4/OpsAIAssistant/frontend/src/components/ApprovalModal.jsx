import { useEffect, useState } from 'react';
import { approveAction } from '../services/api';
import { ShieldAlertIcon, CheckIcon, XIcon, SparklesIcon } from './Icons';

const ApprovalModal = ({ toolCall, onResolve }) => {
  const [currentToolCall, setCurrentToolCall] = useState(toolCall);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(''); // 'approve' or 'reject'
  const [showRaw, setShowRaw] = useState(false);
  const [revisedNotice, setRevisedNotice] = useState('');

  useEffect(() => {
    setCurrentToolCall(toolCall);
    setRevisedNotice('');
    setFeedback('');
  }, [toolCall]);

  if (!currentToolCall) return null;

  const handleAction = async (approved) => {
    setLoading(true);
    setLoadingType(approved ? 'approve' : 'reject');
    setErrorMessage('');
    try {
      const result = await approveAction(approved, feedback);
      if (!approved && result.needs_approval && result.pending_tool_call) {
        // Agent revised the email according to human feedback and sent a new proposal
        setCurrentToolCall(result.pending_tool_call);
        setFeedback('');
        setRevisedNotice('✓ Email revised according to your feedback. Review the updated version below:');
      } else {
        // Action was approved OR agent resolved it without further approval needed
        onResolve(result);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Approval request failed. Please retry.');
    } finally {
      setLoading(false);
      setLoadingType('');
    }
  };

  const handleDismiss = () => {
    // If the operator explicitly dismisses the modal
    onResolve({
      response: 'Human approval was dismissed. No email was sent.',
      needs_approval: false,
      pending_tool_call: null,
    });
  };

  const args = currentToolCall.args || {};
  const isEmailAction = currentToolCall.name === 'send_email' || currentToolCall.name === 'draft_email' || Boolean(args.recipient || args.subject);

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="approval-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
      >
        {/* Amber Glowing Header */}
        <div className="modal-header-amber">
          <div className="modal-amber-icon">
            <ShieldAlertIcon size={24} />
          </div>
          <div className="modal-header-text" style={{ flex: 1 }}>
            <h3 id="approval-title">Human-in-the-Loop Authorization</h3>
            <p>Executive review required before simulated dispatch</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
            title="Dismiss approval request"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Notification banner when email was revised */}
          {revisedNotice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: 12,
                fontWeight: 600,
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <SparklesIcon size={16} />
              <span>{revisedNotice}</span>
            </div>
          )}

          {/* Action Details Card */}
          <div className="inspection-box">
            <div className="inspection-header">
              <span>Proposed Tool Mutation</span>
              <span className="action-pill-amber">{currentToolCall.name || 'External Tool'}</span>
            </div>

            {isEmailAction ? (
              <div className="email-preview-card">
                <div className="email-field-row">
                  <span className="email-field-label">Recipient:</span>
                  <span className="email-field-val">{args.recipient || 'N/A'}</span>
                </div>
                <div className="email-field-row">
                  <span className="email-field-label">Subject:</span>
                  <span className="email-field-val" style={{ fontWeight: 600 }}>{args.subject || 'No Subject'}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className="email-field-label">Body Payload:</span>
                  <div className="email-body-content">
                    {args.body || 'Empty message content'}
                  </div>
                </div>
              </div>
            ) : (
              <pre style={{ color: '#cbd5e1', fontSize: 12, overflowX: 'auto', margin: 0 }}>
                {JSON.stringify(args, null, 2)}
              </pre>
            )}

            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: 6,
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              {showRaw ? 'Hide Raw JSON payload' : 'Inspect Raw JSON payload'}
            </button>

            {showRaw && (
              <pre style={{
                background: '#04070d',
                padding: 10,
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8',
                fontSize: 11,
                maxHeight: 140,
                overflow: 'auto',
                margin: 0
              }}>
                {JSON.stringify(currentToolCall, null, 2)}
              </pre>
            )}
          </div>

          {/* Feedback & Comments */}
          <div>
            <label
              htmlFor="rejection-feedback"
              style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6, letterSpacing: '0.05em' }}
            >
              Feedback / Guidance for Revision
            </label>
            <textarea
              id="rejection-feedback"
              className="feedback-textarea"
              placeholder="e.g., Make the tone warmer, add a 10% discount, and mention invoice due date..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 12
            }}>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button
            className="approve-btn-emerald"
            onClick={() => handleAction(true)}
            disabled={loading}
          >
            <CheckIcon size={16} />
            {loading && loadingType === 'approve' ? 'Authorizing & Sending...' : 'Authorize Simulated Send'}
          </button>
          <button
            className="reject-btn-subtle"
            onClick={() => handleAction(false)}
            disabled={loading}
            title={feedback.trim() ? 'Reject current draft and ask agent to revise with feedback' : 'Reject action'}
          >
            <XIcon size={16} />
            {loading && loadingType === 'reject'
              ? 'Revising with Agent...'
              : feedback.trim()
              ? 'Reject & Request Revision'
              : 'Reject Action'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
