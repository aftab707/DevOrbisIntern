export const API_BASE_URL = "http://localhost:8000/api";

// Helper function for the standard JSON Extraction route
export const extractData = async (rawText) => {
    try {
        const response = await fetch(`${API_BASE_URL}/extract`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ raw_text: rawText })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Extraction failed:", error);
        throw error;
    }
};
