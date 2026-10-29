const STORAGE_KEY = 'research_ai_history_v1';

export function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse history from localStorage', e);
    return [];
  }
}

export function saveHistoryItem(item) {
  try {
    const history = loadHistoryFromStorage();
    const newItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...item,
    };
    const updated = [newItem, ...history.filter(h => h.topic !== item.topic)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save item to localStorage', e);
    return [];
  }
}

export function deleteHistoryItem(id) {
  try {
    const history = loadHistoryFromStorage();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete item from localStorage', e);
    return [];
  }
}

export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    console.error('Failed to clear history', e);
    return [];
  }
}

