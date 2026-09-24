const API_BASE_URL = 'http://localhost:8000/api';

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Upload failed');
  }
  return data;
};

export const sendChatMessage = async (query) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Chat request failed');
  }
  return data;
};

export const clearKnowledgeBase = async () => {
  const response = await fetch(`${API_BASE_URL}/clear`, {
    method: 'POST',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Clear request failed');
  }
  return data;
};
