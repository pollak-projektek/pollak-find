import React, { useState } from 'react';
import { Save, Square, BoxSelect, Layers, XCircle, ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine, X, Pipette, DoorOpen } from 'lucide-react';

const EditorPanel = ({ isEditor, setIsEditor, editorTool, setEditorTool, editorRoomName, setEditorRoomName, editorRoomType, setEditorRoomType, mapDataState, onResizeGrid }) => {
  const [applyToAllFloors, setApplyToAllFloors] = useState(true);

  if (!isEditor) return null;

  const handleSave = async () => {
    try {
      const response = await fetch('/api/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapDataState)
      });
      const result = await response.json();
      if (result.success) {
        alert('Térkép sikeresen elmentve a szerverre!');
      } else {
        alert('Hiba történt a mentés során: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Hálózati hiba mentéskor.');
    }
  };

  return (
    <div className="glass-panel editor-panel" style={{ position: 'absolute', right: 24, top: 24, width: 340, padding: 24, zIndex: 100 }}>
      <button 
        onClick={() => setIsEditor(false)} 
        style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        title="Szerkesztő bezárása"
      >
        <X size={20} />
      </button>
      <h2 style={{ fontSize: 18, marginBottom: 16, fontWeight: 'bold' }}>Térkép Szerkesztő</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <button className={`btn ${editorTool === 'wall' ? 'active' : 'btn-secondary'}`} onClick={() => setEditorTool('wall')} title="Fal rajzolása">
          <XCircle size={16} /> Fal
        </button>
        <button className={`btn ${editorTool === 'empty' ? 'active' : 'btn-secondary'}`} onClick={() => setEditorTool('empty')} title="Folyosó rajzolása">
          <Square size={16} /> Folyosó
        </button>
        <button className={`btn ${editorTool === 'stair' ? 'active' : 'btn-secondary'}`} onClick={() => setEditorTool('stair')} title="Lépcső rajzolása">
          <Layers size={16} /> Lépcső
        </button>
        <button className={`btn ${editorTool === 'door' ? 'active' : 'btn-secondary'}`} onClick={() => setEditorTool('door')} title="Ajtó lehelyezése">
          <DoorOpen size={16} /> Ajtó
        </button>
        <button className={`btn ${editorTool === 'room' ? 'active' : 'btn-secondary'}`} onClick={() => setEditorTool('room')} title="Terem rajzolása">
          <BoxSelect size={16} /> Terem
        </button>
        <button className={`btn ${editorTool === 'picker' ? 'active' : 'btn-secondary'}`} style={{ gridColumn: '2 / span 1' }} onClick={() => setEditorTool('picker')} title="Terem nevének másolása a térképről">
          <Pipette size={16} /> Pipetta
        </button>
      </div>

      {editorTool === 'room' && (
        <>
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label>Terem Neve</label>
            <input 
              type="text" 
              value={editorRoomName} 
              onChange={(e) => setEditorRoomName(e.target.value)} 
              placeholder="Pl. Info I"
            />
          </div>
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label>Terem Típusa</label>
            <select 
              value={editorRoomType} 
              onChange={(e) => setEditorRoomType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
              }}
            >
              <option value="tanterem">Tanterem</option>
              <option value="kiszolgalo">Szolgáltatás (Büfé, Iroda, stb.)</option>
              <option value="wc">WC / Mosdó</option>
              <option value="sport">Sport / Öltöző</option>
              <option value="egyeb">Egyéb</option>
            </select>
          </div>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8, fontWeight: 'bold' }}>Vászon Méretezése</h3>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 12, cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={applyToAllFloors} 
            onChange={(e) => setApplyToAllFloors(e.target.checked)} 
          />
          Minden emeletre érvényes
        </label>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)' }}>Növelés:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('expand', 'top', applyToAllFloors)} title="Hozzáadás felülre"><ArrowUpFromLine size={16} /> Fel</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('expand', 'bottom', applyToAllFloors)} title="Hozzáadás alulra"><ArrowDownFromLine size={16} /> Le</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('expand', 'left', applyToAllFloors)} title="Hozzáadás balra"><ArrowLeftFromLine size={16} /> Bal</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('expand', 'right', applyToAllFloors)} title="Hozzáadás jobbra"><ArrowRightFromLine size={16} /> Jobb</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, marginBottom: 4, color: 'var(--text-secondary)' }}>Csökkentés (Vágás):</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('shrink', 'top', applyToAllFloors)} title="Vágás felülről"><ArrowDownFromLine size={16} /> Felülről</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('shrink', 'bottom', applyToAllFloors)} title="Vágás alulról"><ArrowUpFromLine size={16} /> Alulról</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('shrink', 'left', applyToAllFloors)} title="Vágás balról"><ArrowRightFromLine size={16} /> Balról</button>
            <button className="btn btn-secondary" onClick={() => onResizeGrid('shrink', 'right', applyToAllFloors)} title="Vágás jobbról"><ArrowLeftFromLine size={16} /> Jobbról</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: 24 }}
        onClick={handleSave}
      >
        <Save size={18} /> Mentés Szerverre
      </button>
      </div>
    </div>
  );
};

export default EditorPanel;
