const HISTORY_KEY = 'pollakfind_search_history';
const FAVORITES_KEY = 'pollakfind_favorites';
const MAX_HISTORY = 10;

// --- Search History ---
export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function addSearchHistory(startRoom, endRoom) {
  if (!startRoom || !endRoom) return;
  const history = getSearchHistory();
  const entry = { start: startRoom, end: endRoom, timestamp: Date.now() };
  
  // Remove duplicate
  const filtered = history.filter(
    h => !(h.start === startRoom && h.end === endRoom)
  );
  filtered.unshift(entry);
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, MAX_HISTORY)));
}

export function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// --- Favorites ---
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

export function toggleFavorite(roomName) {
  const favorites = getFavorites();
  const index = favorites.indexOf(roomName);
  if (index === -1) {
    favorites.unshift(roomName);
  } else {
    favorites.splice(index, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(roomName) {
  return getFavorites().includes(roomName);
}
