import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Clock, Star, MapPin, Coffee, BookOpen, Dumbbell, Music, ChevronRight } from 'lucide-react';
import { getSearchHistory, getFavorites, toggleFavorite, isFavorite } from '../utils/favorites';

const CATEGORIES = [
  { id: 'all', label: 'Összes', icon: null },
  { id: 'tanterem', label: 'Tantermek', icon: '🏫' },
  { id: 'kiszolgalo', label: 'Szolgáltatás', icon: '☕' },
  { id: 'wc', label: 'WC', icon: '🚻' },
  { id: 'sport', label: 'Sport', icon: '🏋️' },
  { id: 'egyeb', label: 'Egyéb', icon: '📍' },
];

const QuickSearch = ({ rooms, roomTypes = {}, onSelectStart, onSelectEnd, isOpen, onClose, startRoom, endRoom }) => {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mode, setMode] = useState('end'); // 'start' or 'end'
  const [favorites, setFavorites] = useState(getFavorites());
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (isOpen) {
      setFilter('');
      setFavorites(getFavorites());
    }
  }, [isOpen]);

  const history = useMemo(() => getSearchHistory(), [isOpen]);

  const categorizedRooms = useMemo(() => {
    if (!rooms) return [];
    
    return rooms.map(room => {
      const type = roomTypes[room]?.type;
      return { name: room, category: type || 'egyeb' };
    });
  }, [rooms, roomTypes]);

  const filteredRooms = useMemo(() => {
    let result = categorizedRooms;
    
    if (selectedCategory !== 'all') {
      result = result.filter(r => r.category === selectedCategory);
    }
    
    if (filter.trim()) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(lowerFilter));
    }
    
    // Sort: favorites first
    const favSet = new Set(favorites);
    result.sort((a, b) => {
      const aFav = favSet.has(a.name) ? 0 : 1;
      const bFav = favSet.has(b.name) ? 0 : 1;
      return aFav - bFav;
    });
    
    return result;
  }, [categorizedRooms, selectedCategory, filter, favorites]);

  const handleSelect = (roomName) => {
    if (mode === 'start') {
      onSelectStart(roomName);
      if (!endRoom) {
        setMode('end');
        setFilter('');
      } else {
        onClose();
      }
    } else {
      onSelectEnd(roomName);
      if (!startRoom) {
        setMode('start');
        setFilter('');
      } else {
        onClose();
      }
    }
  };

  const handleToggleFavorite = (e, roomName) => {
    e.stopPropagation();
    const updated = toggleFavorite(roomName);
    setFavorites([...updated]);
  };

  const handleHistorySelect = (entry) => {
    onSelectStart(entry.start);
    onSelectEnd(entry.end);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="quick-search-overlay">
      <div className="quick-search-container">
        {/* Header */}
        <div className="quick-search-header">
          <div className="quick-search-input-wrap">
            <Search size={20} className="quick-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="quick-search-input"
              placeholder="Keress termet, helyet..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoComplete="off"
            />
            {filter && (
              <button className="quick-search-clear" onClick={() => setFilter('')}>
                <X size={18} />
              </button>
            )}
          </div>
          <button className="quick-search-cancel" onClick={onClose}>
            Mégse
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="quick-search-mode-toggle">
          <button 
            className={`mode-btn ${mode === 'start' ? 'active' : ''}`}
            onClick={() => setMode('start')}
          >
            <div className="mode-dot start-dot" />
            <span>Honnan{startRoom ? `: ${startRoom}` : ''}</span>
          </button>
          <button 
            className={`mode-btn ${mode === 'end' ? 'active' : ''}`}
            onClick={() => setMode('end')}
          >
            <div className="mode-dot end-dot" />
            <span>Hova{endRoom ? `: ${endRoom}` : ''}</span>
          </button>
        </div>

        {/* Categories */}
        <div className="quick-search-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon && <span className="category-icon">{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="quick-search-results">
          {/* Favorites Section */}
          {!filter && favorites.length > 0 && selectedCategory === 'all' && (
            <div className="results-section">
              <div className="section-title">
                <Star size={14} /> Kedvencek
              </div>
              {favorites.filter(f => rooms.includes(f)).map(fav => (
              <button
                key={`fav-${fav}`}
                className="result-item favorite"
                onClick={() => handleSelect(fav)}
              >
                <Star size={16} className="result-icon fav-icon" fill="currentColor" />
                <span className="result-name">{fav}</span>
                <ChevronRight size={16} className="result-arrow" />
              </button>
              ))}
            </div>
          )}

          {/* History Section */}
          {!filter && history.length > 0 && selectedCategory === 'all' && (
            <div className="results-section">
              <div className="section-title">
                <Clock size={14} /> Előzmények
              </div>
              {history.slice(0, 5).map((entry, idx) => (
                <button
                  key={`hist-${idx}`}
                  className="result-item history"
                  onClick={() => handleHistorySelect(entry)}
                >
                  <Clock size={16} className="result-icon" />
                  <span className="result-name">{entry.start} → {entry.end}</span>
                  <ChevronRight size={16} className="result-arrow" />
                </button>
              ))}
            </div>
          )}

          {/* All Results */}
          <div className="results-section">
            {(filter || selectedCategory !== 'all') && (
              <div className="section-title">
                <MapPin size={14} /> {filteredRooms.length} találat
              </div>
            )}
            {filteredRooms.map(room => (
              <div
                key={room.name}
                className="result-item"
                onClick={() => handleSelect(room.name)}
              >
                <MapPin size={16} className="result-icon" />
                <span className="result-name">{room.name}</span>
                <button
                  className={`fav-toggle ${isFavorite(room.name) ? 'is-fav' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, room.name)}
                  title="Kedvencekhez"
                >
                  <Star size={14} fill={isFavorite(room.name) ? 'currentColor' : 'none'} />
                </button>
                <ChevronRight size={16} className="result-arrow" />
              </div>
            ))}
            {filteredRooms.length === 0 && (
              <div className="no-results">
                <Search size={32} />
                <p>Nincs találat: „{filter}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearch;
