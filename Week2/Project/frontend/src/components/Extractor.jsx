import { useState } from 'react';
import { extractData } from '../services/api';

const SAMPLE_CV = `Meet Usman Tariq. He is a Senior Full Stack AI Engineer with 6 years of solid industry experience.
He has successfully architected cloud platforms using Python, FastAPI, React.js, Docker, MongoDB, and LangChain.
He previously led backend microservices at FinTech Global and developed automated LLM pipelines.
Reach him directly via email at usman.tariq@devorbis.ai.`;

const Extractor = () => {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleExtract = async () => {
    if (!inputText.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await extractData(inputText);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to extract structured data from the provided text.");
      }
    } catch (err) {
      setError(err.message || "Network error while connecting to extraction service.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setInputText(SAMPLE_CV);
    setError(null);
  };

  const copyJson = () => {
    if (!result?.data) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="extractor-page">
      {/* Input Card */}
      {!result && (
        <div className="extractor-card">
          <div className="extractor-card-header">
            <div className="extractor-card-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="extractor-card-title">Raw Profile / CV Text Input</div>
              <div className="extractor-card-sub">Paste unstructured resume text, LinkedIn profile, or bio</div>
            </div>
            <button
              onClick={loadSample}
              className="reset-btn"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              title="Populate test data for quick demo"
            >
              📄 Load Sample CV
            </button>
          </div>

          <div className="extractor-card-body">
            <textarea
              className="cv-textarea"
              placeholder="Paste unstructured CV or candidate notes here...&#10;&#10;e.g. John Doe has 4 years of experience specializing in React and Node.js. Contact him at john@example.com..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {inputText.length} characters · {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
              </span>

              {inputText.trim() && (
                <button
                  onClick={() => setInputText("")}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                >
                  Clear text
                </button>
              )}
            </div>

            <button
              onClick={handleExtract}
              disabled={loading || !inputText.trim()}
              className="extract-btn"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Extracting Structured Insights via LLM...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Extract Structured Data
                </>
              )}
            </button>

            {error && (
              <div className="error-box">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extracted Result Card */}
      {result && result.data && (
        <div className="result-card">
          <div className="result-header">
            <div className="result-avatar">
              {result.data.full_name && result.data.full_name !== "Not Found"
                ? result.data.full_name.charAt(0).toUpperCase()
                : "👤"}
            </div>
            <div style={{ flex: 1 }}>
              <div className="result-name">{result.data.full_name}</div>
              <div className="result-role">Extracted Candidate Profile · Parsed via JSON Schema</div>
            </div>
            <button
              onClick={copyJson}
              className="reset-btn"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.3)',
                fontSize: '12px'
              }}
            >
              {copiedJson ? '✓ JSON Copied' : '📋 Copy JSON'}
            </button>
          </div>

          <div className="result-body">
            {/* Key Information Grid */}
            <div className="info-grid">
              <div className="info-box">
                <label>Contact Email</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{result.data.email || "Not Provided"}</span>
                  {result.data.email && result.data.email !== "Not Found" && (
                    <button
                      onClick={() => copyEmail(result.data.email)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '11px' }}
                    >
                      {copiedEmail ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div className="info-box">
                <label>Experience Level</label>
                <span>
                  <strong>{result.data.years_of_experience}</strong> {result.data.years_of_experience === 1 ? 'Year' : 'Years'} of Experience
                </span>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="skills-section">
              <div className="skills-title">
                Core Competencies & Key Skills ({result.data.key_skills?.length || 0})
              </div>
              <div className="skills-grid">
                {result.data.key_skills && result.data.key_skills.length > 0 ? (
                  result.data.key_skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No explicit skills detected</span>
                )}
              </div>
            </div>

            {/* AI Summary Quote */}
            <div>
              <div className="skills-title">Executive AI Summary</div>
              <div className="summary-box">
                {result.data.summary}
              </div>
            </div>

            {/* Usage and Reset Footer */}
            <div className="token-row" style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="token-badge">
                  ⚡ {result.usage?.total_tokens || 0} Total Tokens
                </span>
                {result.usage?.prompt_tokens && (
                  <span className="token-badge" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                    Prompt: {result.usage.prompt_tokens}
                  </span>
                )}
                {result.usage?.completion_tokens && (
                  <span className="token-badge" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
                    Completion: {result.usage.completion_tokens}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setInputText("");
                }}
                className="reset-btn"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Extract Another Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Extractor;
