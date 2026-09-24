import { useState } from 'react';
import { extractData } from '../services/api';

const Extractor = () => {
    const [inputText, setInputText] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleExtract = async () => {
        if (!inputText.trim()) return;
        
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await extractData(inputText);
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || "Failed to extract data");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2>Smart Data Extractor</h2>
            </div>
            
            {!result && (
                <textarea 
                    placeholder="Paste a messy CV, profile, or invoice here...&#10;&#10;Example: Meet Ahmed. He has 4 years of experience in Python and React. His email is ahmed@test.com."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="input-box"
                />
            )}
            
            {!result && (
                <button onClick={handleExtract} disabled={loading || !inputText.trim()} className="btn primary-btn">
                    {loading ? (
                        <><div className="spinner"></div> Extracting Insights...</>
                    ) : (
                        "Extract Structured Data"
                    )}
                </button>
            )}

            {error && <div className="error-box">{error}</div>}

            {result && result.data && (
                <div className="result-card">
                    
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {result.data.full_name ? result.data.full_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="profile-title">
                            <h3>{result.data.full_name}</h3>
                            <p>Extracted Profile Entity</p>
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-box">
                            <label>Email Address</label>
                            <span>{result.data.email}</span>
                        </div>
                        <div className="info-box">
                            <label>Experience</label>
                            <span>{result.data.years_of_experience} Years</span>
                        </div>
                    </div>

                    <div className="skills-section">
                        <h4>Technical Skills</h4>
                        <div className="skills-container">
                            {result.data.key_skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="summary-text">
                        "{result.data.summary}"
                    </div>
                    
                    <div className="token-badge">
                        Tokens Consumed: {result.usage.total_tokens}
                    </div>

                    <button onClick={() => {setResult(null); setInputText("");}} className="btn primary-btn" style={{marginTop: '10px'}}>
                        Extract Another Profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default Extractor;
