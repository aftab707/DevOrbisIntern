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
            <h2> Smart Data Extractor</h2>
            
            {!result && (
                <textarea 
                    placeholder="Paste a messy CV, profile, or invoice here...&#10;&#10;E.g. Meet Ahmed. He has 4 years of experience in Python and React. His email is ahmed@test.com."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="input-box"
                />
            )}
            
            {!result && (
                <button onClick={handleExtract} disabled={loading || !inputText.trim()} className="btn primary-btn">
                    {loading ? " Extracting Data..." : " Extract Data"}
                </button>
            )}

            {error && <div className="error-box"> {error}</div>}

            {result && result.data && (
                <div className="result-card">
                    <h3> Extracted Profile</h3>
                    <ul>
                        <li><strong>Name:</strong> {result.data.full_name}</li>
                        <li><strong>Email:</strong> {result.data.email}</li>
                        <li><strong>Experience:</strong> {result.data.years_of_experience} years</li>
                        <li>
                            <strong>Skills:</strong> 
                            <div>
                                {result.data.key_skills.map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </li>
                    </ul>
                    <div className="summary-text">"{result.data.summary}"</div>
                    
                    <div className="token-usage">
                         Tokens Used: {result.usage.total_tokens}
                    </div>

                    <button onClick={() => {setResult(null); setInputText("");}} className="btn primary-btn" style={{marginTop: '20px'}}>
                        Extract Another
                    </button>
                </div>
            )}
        </div>
    );
};

export default Extractor;
