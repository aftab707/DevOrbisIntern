import { useState } from 'react';
import { approveAction } from '../services/api';

const ApprovalModal = ({ toolCall, onResolve }) => {
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  if (!toolCall) return null;

  const handleAction = async (approved) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await approveAction(approved, feedback);
      onResolve(result);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Approval request failed. You can retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation">
      <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="approval-title">
        <h3 id="approval-title">Human approval required</h3>
        <p>This demo records a simulated send. It does not contact an email provider.</p>
        <div className="tool-details">
          <strong>Action: </strong>{toolCall.name}
          <pre>{JSON.stringify(toolCall.args, null, 2)}</pre>
        </div>
        <textarea
          aria-label="Optional rejection feedback"
          placeholder="Optional rejection feedback"
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
        />
        {errorMessage && <p role="alert">{errorMessage}</p>}
        <div className="modal-actions">
          <button className="approve-btn" onClick={() => handleAction(true)} disabled={loading}>
            Approve simulated send
          </button>
          <button className="reject-btn" onClick={() => handleAction(false)} disabled={loading}>
            Reject
          </button>
        </div>
      </section>
    </div>
  );
};

export default ApprovalModal;
