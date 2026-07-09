import React from 'react';
import { Navigation, MapPin, X, Star } from 'lucide-react';
import { isFavorite, toggleFavorite } from '../utils/favorites';

const RoomPopup = ({ roomName, position, onNavigateHere, onStartHere, onClose }) => {
  if (!roomName || !position) return null;

  const handleFavToggle = () => {
    toggleFavorite(roomName);
  };

  return (
    <>
      <div className="room-popup-backdrop" onClick={onClose} />
      <div 
        className="room-popup"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className="room-popup-arrow" />
        <button className="room-popup-close" onClick={onClose}>
          <X size={14} />
        </button>
        
        <div className="room-popup-header">
          <MapPin size={16} className="text-accent" />
          <span className="room-popup-name">{roomName}</span>
          <button 
            className={`room-popup-fav ${isFavorite(roomName) ? 'is-fav' : ''}`}
            onClick={handleFavToggle}
            title="Kedvenc"
          >
            <Star size={14} fill={isFavorite(roomName) ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="room-popup-actions">
          <button className="room-popup-btn primary" onClick={() => { onNavigateHere(roomName); onClose(); }}>
            <Navigation size={14} />
            <span>Navigálás ide</span>
          </button>
          <button className="room-popup-btn secondary" onClick={() => { onStartHere(roomName); onClose(); }}>
            <MapPin size={14} />
            <span>Innen indulok</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default RoomPopup;
