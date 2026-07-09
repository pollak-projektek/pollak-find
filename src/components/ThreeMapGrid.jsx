import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, ContactShadows, Edges, Line, Html } from '@react-three/drei';
import { Coffee, Info, Droplets, MapPin } from 'lucide-react';
import * as THREE from 'three';

const POIIcon = ({ val }) => {
  if (!val) return null;
  const lowerVal = val.toLowerCase();
  
  let icon = null;
  if (lowerVal.includes('büfé') || lowerVal.includes('kávé')) icon = <Coffee size={16} color="white" />;
  else if (lowerVal.includes('mosdó') || lowerVal.includes('wc')) icon = <Droplets size={16} color="white" />;
  else if (lowerVal.includes('porta') || lowerVal.includes('info')) icon = <Info size={16} color="white" />;
  else return null;

  return (
    <Html position={[0, 0.8, 0]} center transform sprite zIndexRange={[100, 0]}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '50%',
        backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
    </Html>
  );
};

const Cell = ({ r, c, w = 1, d = 1, type, val, isStart, isEnd, isPath, showText, onClick }) => {
  const [hovered, setHover] = useState(false);
  
  const x = c + (w - 1) / 2;
  const z = r + (d - 1) / 2;

  let y = 0;
  let height = 0.2;
  let color = '#334155'; // default

  if (type === 'wall') {
    height = 1.5;
    y = height / 2;
    color = '#1e293b'; 
  } else if (type === 'empty') {
    height = 0.1;
    y = height / 2;
    color = '#64748b'; 
  } else if (type === 'room') {
    height = 0.2;
    y = height / 2;
    color = hovered ? '#818cf8' : '#e2e8f0'; 
  } else if (type === 'stair') {
    height = 0.4;
    y = height / 2;
    color = '#f59e0b'; 
  } else if (type === 'door') {
    height = 1.0;
    y = height / 2;
    color = '#8b5cf6';
  }

  if (isPath) {
    color = '#10b981';
    y += 0.05;
  }
  if (isStart) {
    color = '#3b82f6';
    height = 0.4;
    y = height / 2;
  }
  if (isEnd) {
    color = '#ef4444';
    height = 0.4;
    y = height / 2;
  }

  return (
    <group position={[x, y, z]}>
      <mesh 
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
        onClick={(e) => { e.stopPropagation(); onClick && onClick(r, c); }}
      >
        <boxGeometry args={[w, height, d]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.8} 
          metalness={0.1} 
          emissive={isPath || isStart || isEnd ? color : '#000000'}
          emissiveIntensity={isPath || isStart || isEnd ? 0.6 : 0}
        />
        {(type === 'room' || type === 'wall' || type === 'door') && (
          <Edges scale={1.0} threshold={15} color="#0f172a" />
        )}
      </mesh>
      
      {type === 'room' && showText && (
        <>
          <POIIcon val={val} />
          <Text
            position={[0, height / 2 + 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.4}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {val}
          </Text>
        </>
      )}
    </group>
  );
};

const MapScene = ({ currentFloor, path, startRoom, endRoom, mapData, onCellClick }) => {
  if (!mapData) return null;
  const { floors } = mapData;
  const floorData = floors[currentFloor];
  
  if (!floorData) return null;

  const rows = floorData.rows;
  const cols = floorData.cols;

  const offsetX = -cols / 2;
  const offsetZ = -rows / 2;

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

  const isBoundaryWall = (r, c) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (getCellType(nr, nc) !== 'wall') return true;
        }
      }
    }
    return false;
  };

  const cells = [];
  const visited = new Set();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = getCellType(r, c);
      
      if (type === 'wall' && !isBoundaryWall(r, c)) continue;

      const val = getCellValue(r, c);
      const isPath = path.some(p => p.floor === currentFloor && p.row === r && p.col === c);
      const isStart = startRoom && val === startRoom;
      const isEnd = endRoom && val === endRoom;

      // Csak a termeket vonjuk össze vizuálisan
      if (type === 'room') {
        if (visited.has(`${r}-${c}`)) continue;

        // Greedy meshing: szélesség keresése
        let w = 1;
        while (c + w < cols && getCellValue(r, c + w) === val && !visited.has(`${r}-${c + w}`) && !path.some(p => p.floor === currentFloor && p.row === r && p.col === c + w)) {
          w++;
        }

        // Greedy meshing: magasság keresése
        let h = 1;
        let canExpandDown = true;
        while (r + h < rows && canExpandDown) {
          for (let dw = 0; dw < w; dw++) {
            if (getCellValue(r + h, c + dw) !== val || visited.has(`${r + h}-${c + dw}`) || path.some(p => p.floor === currentFloor && p.row === r + h && p.col === c + dw)) {
              canExpandDown = false;
              break;
            }
          }
          if (canExpandDown) h++;
        }

        // Megjelöljük a területet bejárttá
        for (let dh = 0; dh < h; dh++) {
          for (let dw = 0; dw < w; dw++) {
            visited.add(`${r + dh}-${c + dw}`);
          }
        }

        cells.push(
          <Cell 
            key={`room-${r}-${c}`}
            r={r} c={c} w={w} d={h}
            type={type}
            val={val}
            isStart={isStart}
            isEnd={isEnd}
            isPath={isPath}
            showText={true}
            onClick={onCellClick}
          />
        );
      } else {
        cells.push(
          <Cell 
            key={`${r}-${c}`}
            r={r} c={c} w={1} d={1}
            type={type}
            val={val}
            isStart={isStart}
            isEnd={isEnd}
            isPath={isPath}
            showText={type === 'room'}
            onClick={onCellClick}
          />
        );
      }
    }
  }

  return (
    <group position={[offsetX, 0, offsetZ]}>
      {cells}
      <ContactShadows position={[cols/2, 0, rows/2]} opacity={0.6} scale={40} blur={2} far={4} color="#000000" />
    </group>
  );
};

const PathLine = ({ path, mapData, showAllFloors }) => {
  if (!path || path.length < 2 || !showAllFloors) return null;
  const points = path.map(p => {
    const floorData = mapData.floors[p.floor];
    const offsetX = -floorData.cols / 2;
    const offsetZ = -floorData.rows / 2;
    return [
      p.col + offsetX,
      p.floor * 10 + 0.2, // Y offset per floor + small buffer
      p.row + offsetZ
    ];
  });

  return (
    <Line
      points={points}
      color="#10b981"
      lineWidth={8}
      dashed={false}
    />
  );
};

const AnimatedNavigator = ({ path, mapData, showAllFloors, currentFloor }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current || !path || path.length < 2) return;
    
    const t = state.clock.elapsedTime;
    const speed = 5; 
    const totalNodes = path.length;
    const progress = (t * speed) % totalNodes;
    
    const index = Math.floor(progress);
    const nextIndex = Math.min(index + 1, totalNodes - 1);
    const fraction = progress - index;

    const p1 = path[index];
    const p2 = path[nextIndex];
    
    const floorData1 = mapData.floors[p1.floor];
    const offsetX1 = -floorData1.cols / 2;
    const offsetZ1 = -floorData1.rows / 2;

    const floorData2 = mapData.floors[p2.floor];
    const offsetX2 = -floorData2.cols / 2;
    const offsetZ2 = -floorData2.rows / 2;

    const y1 = showAllFloors ? p1.floor * 10 + 0.5 : 0.5;
    const y2 = showAllFloors ? p2.floor * 10 + 0.5 : 0.5;
    
    meshRef.current.position.x = THREE.MathUtils.lerp(p1.col + offsetX1, p2.col + offsetX2, fraction);
    meshRef.current.position.y = THREE.MathUtils.lerp(y1, y2, fraction);
    meshRef.current.position.z = THREE.MathUtils.lerp(p1.row + offsetZ1, p2.row + offsetZ2, fraction);

    meshRef.current.visible = showAllFloors ? true : (p1.floor === currentFloor);
  });

  if (!path || path.length < 2) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#10b981" emissiveIntensity={2} toneMapped={false} />
      <pointLight color="#10b981" intensity={2} distance={5} />
    </mesh>
  );
};

const ThreeMapGrid = ({ currentFloor, path, startRoom, endRoom, mapData, onCellClick, showAllFloors }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, borderRadius: 24, overflow: 'hidden' }}>
      <Canvas camera={{ position: showAllFloors ? [0, 40, 50] : [0, 15, 20], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <Environment preset="city" />
        
        {showAllFloors ? (
          Object.keys(mapData.floors).map(floorKey => (
            <group key={floorKey} position={[0, parseInt(floorKey, 10) * 10, 0]}>
              <MapScene 
                currentFloor={parseInt(floorKey, 10)} 
                path={path} 
                startRoom={startRoom}
                endRoom={endRoom}
                mapData={mapData}
                onCellClick={onCellClick}
              />
            </group>
          ))
        ) : (
          <MapScene 
            currentFloor={currentFloor} 
            path={path} 
            startRoom={startRoom}
            endRoom={endRoom}
            mapData={mapData}
            onCellClick={onCellClick}
          />
        )}

        <PathLine path={path} mapData={mapData} showAllFloors={showAllFloors} />
        <AnimatedNavigator path={path} mapData={mapData} showAllFloors={showAllFloors} currentFloor={currentFloor} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={100}
          target={showAllFloors ? [0, 10, 0] : [0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

export default ThreeMapGrid;
