import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Sidebar from './components/Sidebar';
import MapGrid from './components/MapGrid';
import ThreeMapGrid from './components/ThreeMapGrid';
import EditorPanel from './components/EditorPanel';
import QuickSearch from './components/QuickSearch';
import RoomPopup from './components/RoomPopup';
import { multiFloorAStar, findAllNodesByName } from './utils/pathfinding';
import { addSearchHistory } from './utils/favorites';
import { Menu, ArrowUp, ArrowDown, MapPin, Box, Edit3, Layers, Search, Share2 } from 'lucide-react';
import initialMapData from './data/mapData.json';
import './index.css';

// Haptic feedback helper
const haptic = (pattern = 10) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

function App() {
  const [startRoom, setStartRoom] = useState('');
  const [endRoom, setEndRoom] = useState('');
  const [path, setPath] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [targetFloor, setTargetFloor] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [showAllFloors, setShowAllFloors] = useState(false);
  const [urlInitialized, setUrlInitialized] = useState(false);

  // Editor State
  const [mapDataState, setMapDataState] = useState(initialMapData);
  
  // Fetch latest map data from backend on mount
  useEffect(() => { 
    fetch('/api/map')
      .then(res => res.json())
      .then(data => {
        if (data && data.floors) {
          setMapDataState(data);
        }
      })
      .catch(err => console.error('Hiba a térkép betöltésekor:', err));
  }, []);
  const [isEditor, setIsEditor] = useState(false);
  const [editorTool, setEditorTool] = useState('wall');
  const [editorRoomName, setEditorRoomName] = useState('Új Terem');
  const [editorRoomType, setEditorRoomType] = useState('tanterem');

  // New mobile-first states
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomPopupPos, setRoomPopupPos] = useState(null);

  // Detect mobile (matches CSS: portrait phones + landscape phones)
  const mobileQuery = '(max-width: 768px), (max-height: 500px)';
  const [isMobile, setIsMobile] = useState(window.matchMedia(mobileQuery).matches);

  useEffect(() => {
    const mql = window.matchMedia(mobileQuery);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Room list for search
  const rooms = useMemo(() => {
    const r = new Set();
    const { floors } = mapDataState;
    for (const fl in floors) {
      const data = floors[fl];
      for (const key in data) {
        if (key.startsWith('cell-')) {
          const val = data[key];
          if (val && val !== 'X' && val !== 'STAIR' && val !== 'DOOR') {
            r.add(val);
          }
        }
      }
    }
    return Array.from(r).sort();
  }, [mapDataState]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get('start');
    const end = params.get('end');
    if (start && end) {
      setStartRoom(start);
      setEndRoom(end);
      const foundPath = multiFloorAStar(start, end, mapDataState);
      setPath(foundPath);
      
      if (!urlInitialized && foundPath.length > 0) {
        setCurrentFloor(foundPath[0].floor);
        const endNodes = findAllNodesByName(end, mapDataState);
        if (endNodes.length > 0) setTargetFloor(endNodes[0].floor);
        setUrlInitialized(true);
      }
    }
  }, [mapDataState, urlInitialized]);

  const handleSearch = useCallback(() => {
    if (!startRoom || !endRoom) return;
    const foundPath = multiFloorAStar(startRoom, endRoom, mapDataState);
    setPath(foundPath);
    
    if (foundPath.length > 0) {
      haptic([10, 50, 10]);
      setCurrentFloor(foundPath[0].floor);
      const endNodes = findAllNodesByName(endRoom, mapDataState);
      if (endNodes.length > 0) setTargetFloor(endNodes[0].floor);
      
      // Save to history
      addSearchHistory(startRoom, endRoom);
      
      const newUrl = `${window.location.pathname}?start=${encodeURIComponent(startRoom)}&end=${encodeURIComponent(endRoom)}`;
      window.history.pushState({path: newUrl}, '', newUrl);
    } else {
      alert("Nincs útvonal a kiválasztott pontok között!");
    }
  }, [startRoom, endRoom, mapDataState]);

  const handleReset = () => {
    setStartRoom('');
    setEndRoom('');
    setPath([]);
    setTargetFloor(null);
    setSelectedRoom(null);
    window.history.pushState({path: window.location.pathname}, '', window.location.pathname);
  };

  // Share current route
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PollakFind: ${startRoom} → ${endRoom}`,
          text: `Útvonal: ${startRoom} → ${endRoom}`,
          url: url,
        });
        haptic(10);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      haptic(10);
    }
  };

  // Room tap handler (user mode - shows popup)
  const handleRoomTap = useCallback((r, c, event) => {
    if (isEditor) return;
    
    const floorData = mapDataState.floors[currentFloor];
    const key = `cell-${r}-${c}`;
    const val = floorData[key];
    
    if (val && val !== 'X' && val !== 'STAIR' && val !== 'DOOR') {
      haptic(5);
      setSelectedRoom(val);
      
      // Position popup near the click/touch point
      if (event) {
        const rect = event.currentTarget?.getBoundingClientRect?.();
        const clientX = event.touches?.[0]?.clientX ?? event.clientX;
        const clientY = event.touches?.[0]?.clientY ?? event.clientY;
        setRoomPopupPos({
          x: clientX,
          y: clientY - 10,
        });
      }
    }
  }, [isEditor, mapDataState, currentFloor]);

  const handleCellClick = (r, c, event) => {
    if (!isEditor) {
      handleRoomTap(r, c, event);
      return;
    }
    
    const newMapData = JSON.parse(JSON.stringify(mapDataState));
    const floor = newMapData.floors[currentFloor];
    const key = `cell-${r}-${c}`;
    const val = floor[key];

    if (editorTool === 'picker') {
      if (val && val !== 'X' && val !== 'STAIR' && val !== 'DOOR') {
        setEditorRoomName(val);
        setEditorRoomType(mapDataState.rooms?.[val]?.type || 'tanterem');
        setEditorTool('room'); // Auto-switch back to room painting
      }
      return;
    }
    
    if (editorTool === 'wall') {
      floor[key] = 'X';
    } else if (editorTool === 'empty') {
      floor[key] = '';
    } else if (editorTool === 'stair') {
      floor[key] = 'STAIR';
    } else if (editorTool === 'door') {
      floor[key] = 'DOOR';
    } else if (editorTool === 'room') {
      const roomName = editorRoomName.trim();
      floor[key] = roomName;
      if (roomName) {
        if (!newMapData.rooms) newMapData.rooms = {};
        newMapData.rooms[roomName] = { type: editorRoomType };
      }
    }
    
    setMapDataState(newMapData);
  };

  const handleNavigateToRoom = (roomName) => {
    setEndRoom(roomName);
    if (startRoom) {
      // Auto-search if start is already set
      setTimeout(() => {
        const foundPath = multiFloorAStar(startRoom, roomName, mapDataState);
        setPath(foundPath);
        if (foundPath.length > 0) {
          haptic([10, 50, 10]);
          setCurrentFloor(foundPath[0].floor);
          const endNodes = findAllNodesByName(roomName, mapDataState);
          if (endNodes.length > 0) setTargetFloor(endNodes[0].floor);
          addSearchHistory(startRoom, roomName);
          const newUrl = `${window.location.pathname}?start=${encodeURIComponent(startRoom)}&end=${encodeURIComponent(roomName)}`;
          window.history.pushState({path: newUrl}, '', newUrl);
        }
      }, 0);
    }
  };

  const handleStartFromRoom = (roomName) => {
    setStartRoom(roomName);
  };

  const handleResizeGrid = (action, direction, applyToAllFloors) => {
    const newMapData = JSON.parse(JSON.stringify(mapDataState));
    
    const keysToResize = applyToAllFloors ? Object.keys(newMapData.floors) : [String(currentFloor)];

    keysToResize.forEach(floorKey => {
      const floor = newMapData.floors[floorKey];
      const oldRows = floor.rows;
      const oldCols = floor.cols;

      if (action === 'expand') {
        if (direction === 'bottom') {
          for (let c = 0; c < oldCols; c++) floor[`cell-${oldRows}-${c}`] = 'X';
          floor.rows += 1;
        } else if (direction === 'right') {
          for (let r = 0; r < oldRows; r++) floor[`cell-${r}-${oldCols}`] = 'X';
          floor.cols += 1;
        } else if (direction === 'top') {
          for (let r = oldRows - 1; r >= 0; r--) {
            for (let c = 0; c < oldCols; c++) {
              const val = floor[`cell-${r}-${c}`];
              floor[`cell-${r + 1}-${c}`] = val !== undefined ? val : 'X';
            }
          }
          for (let c = 0; c < oldCols; c++) floor[`cell-0-${c}`] = 'X';
          floor.rows += 1;
        } else if (direction === 'left') {
          for (let r = 0; r < oldRows; r++) {
            for (let c = oldCols - 1; c >= 0; c--) {
              const val = floor[`cell-${r}-${c}`];
              floor[`cell-${r}-${c + 1}`] = val !== undefined ? val : 'X';
            }
          }
          for (let r = 0; r < oldRows; r++) floor[`cell-${r}-0`] = 'X';
          floor.cols += 1;
        }
      } else if (action === 'shrink') {
        if (oldRows <= 1 || oldCols <= 1) return; // limit minimum size
        
        if (direction === 'bottom') {
          floor.rows -= 1;
        } else if (direction === 'right') {
          floor.cols -= 1;
        } else if (direction === 'top') {
          for (let r = 1; r < oldRows; r++) {
            for (let c = 0; c < oldCols; c++) {
              floor[`cell-${r - 1}-${c}`] = floor[`cell-${r}-${c}`];
            }
          }
          floor.rows -= 1;
        } else if (direction === 'left') {
          for (let r = 0; r < oldRows; r++) {
            for (let c = 1; c < oldCols; c++) {
              floor[`cell-${r}-${c - 1}`] = floor[`cell-${r}-${c}`];
            }
          }
          floor.cols -= 1;
        }
      }
    });

    setMapDataState(newMapData);
  };

  const showUpBlink = targetFloor !== null && targetFloor > currentFloor;
  const showDownBlink = targetFloor !== null && targetFloor < currentFloor;

  const floorText = targetFloor !== null 
    ? (targetFloor > 0 ? `A célállomásod a(z) ${targetFloor}. emeleten található` : "A célállomásod a földszinten található")
    : "";

  return (
    <div className="app-container">
      {/* Mobile Quick Search Bar */}
      {isMobile && !isEditor && (
        <button 
          className="mobile-search-bar glass-panel"
          onClick={() => { haptic(5); setQuickSearchOpen(true); }}
        >
          <Search size={18} className="text-accent" />
          <span className="mobile-search-text">
            {startRoom && endRoom 
              ? `${startRoom} → ${endRoom}` 
              : 'Hova mész? Keress termet...'}
          </span>
        </button>
      )}

      {/* Desktop menu toggle */}
      <button 
        className="glass-panel mobile-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu />
      </button>

      <Sidebar 
        startRoom={startRoom} 
        setStartRoom={setStartRoom}
        endRoom={endRoom}
        setEndRoom={setEndRoom}
        onSearch={handleSearch}
        onReset={handleReset}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        pathExists={path.length > 0}
        path={path}
        currentFloor={currentFloor}
      />
      
      <div className="map-area">
        {!isMobile && import.meta.env.DEV && (
          <EditorPanel 
            isEditor={isEditor}
            setIsEditor={setIsEditor}
            editorTool={editorTool}
            setEditorTool={setEditorTool}
            editorRoomName={editorRoomName}
            setEditorRoomName={setEditorRoomName}
            editorRoomType={editorRoomType}
            setEditorRoomType={setEditorRoomType}
            mapDataState={mapDataState}
            onResizeGrid={handleResizeGrid}
          />
        )}



        {is3D ? (
          <ThreeMapGrid 
            currentFloor={currentFloor} 
            path={path} 
            startRoom={startRoom}
            endRoom={endRoom}
            mapData={mapDataState}
            onCellClick={handleCellClick}
            showAllFloors={showAllFloors}
          />
        ) : (
          <TransformWrapper
            initialScale={isMobile ? 0.8 : 1}
            minScale={0.2}
            maxScale={4}
            centerOnInit={true}
            limitToBounds={false}
            wheel={{ step: 0.1 }}
            panning={{ disabled: isEditor, velocityDisabled: true }}
            doubleClick={{ disabled: isEditor }}
          >
            <TransformComponent 
              wrapperStyle={{ width: '100%', height: '100%' }} 
              contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MapGrid 
                currentFloor={currentFloor} 
                path={path} 
                startRoom={startRoom}
                endRoom={endRoom}
                mapData={mapDataState}
                onCellClick={handleCellClick}
                isEditor={isEditor}
              />
            </TransformComponent>
          </TransformWrapper>
        )}
        
        {/* Route info banner */}
        {path.length > 0 && (
          <div className="route-info-banner glass-panel">
            <div className="route-info-content">
              <div className="route-info-main">
                <MapPin size={16} className="text-accent" />
                <span className="route-info-distance">
                  {path.length} lépés · ~{Math.round(path.length * 1.5)} mp
                </span>
              </div>
              {floorText && (
                <div className="route-info-floor">
                  {floorText}
                </div>
              )}
            </div>
            <button className="route-share-btn" onClick={handleShare} title="Megosztás">
              <Share2 size={18} />
            </button>
          </div>
        )}
        
        {/* Floor controls */}
        <div className="floor-controls">
          {!isMobile && import.meta.env.DEV && (
            <button 
              className={`floor-btn ${isEditor ? 'active' : ''}`}
              onClick={() => setIsEditor(!isEditor)}
              title="Szerkesztő mód"
              style={{ marginBottom: 16 }}
            >
              <Edit3 size={20} />
            </button>
          )}
          
          {is3D && (
            <button 
              className={`floor-btn ${showAllFloors ? 'active' : ''}`}
              onClick={() => { setShowAllFloors(!showAllFloors); haptic(5); }}
              title="Összes emelet (Robbantott nézet)"
              style={{ marginBottom: 16 }}
            >
              <Layers size={20} />
            </button>
          )}

          <button 
            className={`floor-btn ${is3D ? 'active' : ''}`}
            onClick={() => { setIs3D(!is3D); haptic(5); }}
            title="3D Nézet"
            style={{ marginBottom: 16 }}
          >
            <Box size={20} />
          </button>
          
          {[2, 1, 0].map(floor => (
            <button 
              key={floor}
              className={`floor-btn ${currentFloor === floor ? 'active' : ''} ${targetFloor === floor && currentFloor !== floor ? 'blink-floor' : ''}`}
              onClick={() => { setCurrentFloor(floor); setShowAllFloors(false); haptic(5); }}
            >
              {floor === 0 ? 'F' : `${floor}.`}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search Overlay */}
      <QuickSearch
        rooms={rooms}
        roomTypes={mapDataState?.rooms || {}}
        onSelectStart={(room) => { setStartRoom(room); }}
        onSelectEnd={(room) => { 
          setEndRoom(room);
          // If both are set, auto-search
          if (startRoom && room) {
            setTimeout(() => {
              const foundPath = multiFloorAStar(startRoom, room, mapDataState);
              setPath(foundPath);
              if (foundPath.length > 0) {
                haptic([10, 50, 10]);
                setCurrentFloor(foundPath[0].floor);
                const endNodes = findAllNodesByName(room, mapDataState);
                if (endNodes.length > 0) setTargetFloor(endNodes[0].floor);
                addSearchHistory(startRoom, room);
                const newUrl = `${window.location.pathname}?start=${encodeURIComponent(startRoom)}&end=${encodeURIComponent(room)}`;
                window.history.pushState({path: newUrl}, '', newUrl);
              }
            }, 0);
          }
        }}
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        startRoom={startRoom}
        endRoom={endRoom}
      />

      {/* Room Popup */}
      <RoomPopup
        roomName={selectedRoom}
        position={roomPopupPos}
        onNavigateHere={handleNavigateToRoom}
        onStartHere={handleStartFromRoom}
        onClose={() => { setSelectedRoom(null); setRoomPopupPos(null); }}
      />
    </div>
  );
}

export default App;
