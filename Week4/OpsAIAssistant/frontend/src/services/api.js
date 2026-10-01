import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const SESSION_KEY = 'ops-assistant-session-id';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `ops-${crypto.randomUUID()}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const startNewConversation = () => {
  const sessionId = `ops-${crypto.randomUUID()}`;
  sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
};

export const chatWithAgent = async (message, sessionId = getSessionId()) => {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    session_id: sessionId
  });
  return response.data;
};

export const approveAction = async (approved, feedback = "", sessionId = getSessionId()) => {
  const response = await axios.post(`${API_BASE_URL}/approve`, {
    session_id: sessionId,
    approved,
    feedback
  });
  return response.data;
};

export const ingestDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/ingest`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getKnowledgeBaseStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/knowledge-base`);
  return response.data;
};

export const clearKnowledgeBase = async () => {
  const response = await axios.delete(`${API_BASE_URL}/knowledge-base`);
  return response.data;
};
