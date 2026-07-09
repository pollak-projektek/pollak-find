import React, { useState, useEffect } from 'react';

const StairIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h5v-6h5v-6h5V3"/>
  </svg>
);

const DoorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
    <path d="M2 20h20" />
    <path d="M14 12v.01" />
  </svg>
);

const MapGrid = ({ currentFloor, path, startRoom, endRoom, is3D, mapData, onCellClick, isEditor }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (!mapData) return null;
  const { floors } = mapData;
  const floorData = floors[currentFloor];
  
  if (!floorData) return null;

  const rows = floorData.rows;
  const cols = floorData.cols;

  const gridStyle = {
    gridTemplateRows: `repeat(${rows}, var(--cell-size))`,
    gridTemplateColumns: `repeat(${cols}, var(--cell-size))`
  };

  const getCellType = (r, c) => {
    const key = `cell-${r}-${c}`;
    const val = floorData[key] || "";
    if (val === "X") return "wall";
    if (val === "STAIR") return "stair";
    if (val === "DOOR") return "door";
    if (val !== "") return "room";
    return "empty";
  };

  const getCellValue = (r, c) => {
    const key = `cell-${r}-${c}`;
    const val = floorData[key] || "";
    if (val === "X" || val === "STAIR" || val === "DOOR") return "";
    return val.trim();
  };

  const cells = [];
  const visited = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = getCellType(r, c);
      const val = getCellValue(r, c);
      
      const pathIndex = path.findIndex(p => p.floor === currentFloor && p.row === r && p.col === c);
      const isPath = pathIndex !== -1;
      
      if (!isEditor && type === 'room') {
        if (visited.has(`${r}-${c}`)) continue;

        let w = 1;
        while (c + w < cols && getCellValue(r, c + w) === val && !visited.has(`${r}-${c + w}`)) {
          w++;
        }

        let h = 1;
        let canExpandDown = true;
        while (r + h < rows && canExpandDown) {
          for (let dw = 0; dw < w; dw++) {
            if (getCellValue(r + h, c + dw) !== val || visited.has(`${r + h}-${c + dw}`)) {
              canExpandDown = false;
              break;
            }
          }
          if (canExpandDown) h++;
        }

        for (let dh = 0; dh < h; dh++) {
          for (let dw = 0; dw < w; dw++) {
            visited.add(`${r + dh}-${c + dw}`);
          }
        }

        let extraClass = "";
        let style = {
          gridColumn: `${c + 1} / span ${w}`,
          gridRow: `${r + 1} / span ${h}`,
        };
        if (w > 1 || h > 1) {
          style.width = 'auto';
          style.height = 'auto';
        }
        
        if (startRoom && val === startRoom) extraClass += " start";
        if (endRoom && val === endRoom) extraClass += " end";

        cells.push(
          <div 
            key={`room-${r}-${c}`}
            className={`cell ${type} ${extraClass}`}
            style={style}
            title={val}
            onClick={(e) => onCellClick && onCellClick(r, c, e)}
          >
            <span className="room-label">{val}</span>
          </div>
        );
      } else {
        // Fallback for editor mode or non-room cells
        let extraClass = "";
        let style = {
          gridColumn: `${c + 1} / span 1`,
          gridRow: `${r + 1} / span 1`,
        };
        let showText = type === 'room';
        
        if (isPath && type === 'empty') {
          extraClass = "path";
          style.animationDelay = `${pathIndex * 0.05}s`;
        } else if (isPath && (type === 'stair' || type === 'door')) {
          extraClass = "path-highlight";
        }
        
        if (startRoom && val === startRoom) extraClass += " start";
        if (endRoom && val === endRoom) extraClass += " end";

        if (isEditor && type === 'room') {
          const isTopSame = r > 0 && getCellValue(r - 1, c) === val;
          const isLeftSame = c > 0 && getCellValue(r, c - 1) === val;
          if (isTopSame || isLeftSame) {
            showText = false;
          }
        }

        cells.push(
          <div 
            key={`${r}-${c}`}
            className={`cell ${type} ${extraClass}`}
            style={style}
            title={type === 'room' ? val : (type === 'stair' ? 'Lépcső' : (type === 'door' ? 'Ajtó' : ''))}
            onMouseDown={(e) => {
              if (isEditor) {
                setIsDrawing(true);
                onCellClick && onCellClick(r, c, e);
              }
            }}
            onMouseEnter={(e) => {
              if (isEditor && isDrawing) {
                onCellClick && onCellClick(r, c, e);
              }
            }}
            onClick={(e) => {
              if (!isEditor) {
                onCellClick && onCellClick(r, c, e);
              }
            }}
          >
            {showText && <span className="room-label">{val}</span>}
            {type === 'stair' && <StairIcon />}
            {type === 'door' && <DoorIcon />}
          </div>
        );
      }
    }
  }
  // Build path overlay segments
  const pathSegments = [];
  if (!isEditor && path.length > 0) {
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];

      if (p1.floor === currentFloor && p2.floor === currentFloor) {
        const isHorizontal = p1.row === p2.row;
        const isVertical = p1.col === p2.col;

        if (!isHorizontal && !isVertical) continue;

        let style = {
          animationDelay: `${i * 0.03}s`,
        };

        if (isHorizontal) {
          const cMin = Math.min(p1.col, p2.col);
          style.gridRow = `${p1.row + 1} / span 1`;
          style.gridColumn = `${cMin + 1} / span 2`;
          pathSegments.push(
            <div
              key={`path-seg-${i}`}
              className="path-segment horizontal"
              style={style}
            />
          );
        } else if (isVertical) {
          const rMin = Math.min(p1.row, p2.row);
          style.gridColumn = `${p1.col + 1} / span 1`;
          style.gridRow = `${rMin + 1} / span 2`;
          pathSegments.push(
            <div
              key={`path-seg-${i}`}
              className="path-segment vertical"
              style={style}
            />
          );
        }
      }
    }
  }

  return (
    <div className={`grid-container glass-panel ${is3D ? 'is-3d' : ''}`} style={gridStyle}>
      {cells}
      {pathSegments}
    </div>
  );
};

export default MapGrid;
