import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes timeout for thorough multi-agent research
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check backend API health connectivity.
 */
export async function checkApiHealth() {
  try {
    const res = await client.get('/');
    return { ok: true, data: res.data };
  } catch (error) {
    return {
      ok: false,
      error: error.response?.data?.detail || error.message || 'Cannot reach backend server',
    };
  }
}

/**
 * Execute research pipeline for a given topic.
 * @param {string} topic
 */
export async function runResearch(topic) {
  try {
    const res = await client.post('/api/research', { topic });
    return { ok: true, data: res.data };
  } catch (error) {
    let friendlyMessage = 'An unexpected error occurred while executing research.';

    if (error.code === 'ECONNABORTED') {
      friendlyMessage = 'The request timed out. The agents took too long to complete research.';
    } else if (!error.response) {
      friendlyMessage = 'Could not connect to the research server at ' + API_BASE_URL + '. Ensure FastAPI is running on port 8000.';
    } else if (error.response?.status === 429) {
      friendlyMessage = 'Rate limit exceeded by the model provider. Please wait a moment before trying again.';
    } else if (error.response?.data?.detail) {
      friendlyMessage = error.response.data.detail;
    }

    return {
      ok: false,
      error: friendlyMessage,
    };
  }
}

