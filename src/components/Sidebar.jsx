import React, { useMemo, useEffect, useState, useRef } from 'react';
import mapData from '../data/mapData.json';
import { Search, RotateCcw, MapPin, Clock, Navigation, Layers } from 'lucide-react';
import QRCode from 'react-qr-code';

const AutocompleteInput = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="input-group" ref={wrapperRef} style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        type="text"
        value={isOpen ? filter : value}
        placeholder={placeholder}
        onFocus={() => { setIsOpen(true); setFilter(''); }}
        onChange={(e) => { setFilter(e.target.value); setIsOpen(true); }}
        style={{ width: '100%' }}
      />
      {isOpen && (
        <div className="autocomplete-dropdown glass-panel" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, maxHeight: 200, overflowY: 'auto',
          marginTop: 4, padding: 8, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {filteredOptions.length > 0 ? filteredOptions.map(opt => (
            <div
              key={opt}
              style={{
                padding: '10px 12px', cursor: 'pointer', borderRadius: 8, fontSize: 14, color: 'white'
              }}
              className="autocomplete-item"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
                setFilter('');
              }}
            >
              {opt}
            </div>
          )) : (
            <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 13 }}>Nincs találat</div>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ startRoom, setStartRoom, endRoom, setEndRoom, onSearch, onReset, isOpen, setIsOpen, pathExists, path, currentFloor }) => {
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (pathExists) {
      setQrUrl(window.location.href);
    } else {
      setQrUrl('');
    }
  }, [pathExists, startRoom, endRoom]);

  const rooms = useMemo(() => {
    const r = new Set();
    const { floors } = mapData;
    for (const fl in floors) {
      const data = floors[fl];
      for (const key in data) {
        if (key.startsWith('cell-')) {
          const val = data[key];
          if (val && val !== 'X' && val !== 'STAIR') {
            r.add(val);
          }
        }
      }
    }
    return Array.from(r).sort();
  }, []);

  return (
    <div className={`glass-panel sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="logo-container">
          <div className="logo-glow"></div>
          <img src="/Logo.png" alt="PollakFind Logo" style={{ width: 80, height: 'auto', marginBottom: 12, position: 'relative', zIndex: 2 }} />
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: '800',
          background: 'linear-gradient(90deg, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 4
        }}>
          PollakFind
        </h1>
        <p style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: '600'
        }}>
          Teremkereső
        </p>
      </div>

      <AutocompleteInput
        label="Kezdőpont"
        placeholder="Keresés (pl. Info I)"
        value={startRoom}
        onChange={setStartRoom}
        options={rooms}
      />

      <AutocompleteInput
        label="Célállomás"
        placeholder="Keresés (pl. Büfé)"
        value={endRoom}
        onChange={setEndRoom}
        options={rooms}
      />

      {pathExists && path && path.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-muted)' }}>
            <Clock size={16} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Távolság: {path.length} lépés (kb. {Math.round(path.length * 1.5)} mp)</span>
          </div>
          
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(() => {
              const instructions = [];
              let currentFl = path[0].floor;
              let stepsInFloor = 0;
              
              for (let i = 0; i < path.length; i++) {
                if (path[i].floor !== currentFl) {
                  instructions.push(<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Navigation size={14} className="text-accent" /> Séta: {stepsInFloor} lépés ({currentFl}. emelet)</div>);
                  currentFl = path[i].floor;
                  stepsInFloor = 1;
                  instructions.push(<div key={i+'stair'} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}><Layers size={14} /> Lépcsőzés: {currentFl}. emeletre</div>);
                } else {
                  stepsInFloor++;
                }
              }
              if (stepsInFloor > 0) {
                instructions.push(<div key="end" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} className="text-accent" /> Érkezés: {stepsInFloor} lépés ({currentFl}. emelet)</div>);
              }
              return instructions;
            })()}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => { onSearch(); setIsOpen(false); }}>
          <Search size={20} /> Keresés
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          <RotateCcw size={18} /> Visszaállítás
        </button>
      </div>

      {qrUrl ? (
        <div style={{ marginTop: 24, textAlign: 'center', background: 'white', padding: 16, borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <QRCode value={qrUrl} size={120} style={{ margin: '0 auto' }} />
          <p style={{ color: '#1e293b', fontSize: 11, marginTop: 8, fontWeight: 700 }}>Olvass be a telefonoddal!</p>
        </div>
      ) : (
        <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, border: '1px dashed rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: 16 }}>
          Indítsd el a keresést a QR kód generálásához!
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Kövesd a Pollákot!</p>
        <div className="social-links">


        </div>
      </div>
    </div>
  );
};

export default Sidebar;
