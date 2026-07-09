import fs from 'fs';
import { fileURLToPath } from 'url';
import p from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = p.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(p.join(__dirname, 'src/data/mapData.json'), 'utf-8'));

function heuristic(a, b) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  const dz = Math.abs(a.floor - b.floor) * 1; 
  return dx + dy + dz;
}

function findNodeByName(name, mapData) {
  const { floors } = mapData;
  for (const floorKey in floors) {
    const floor = floors[floorKey];
    for (let r = 0; r < floor.rows; r++) {
      for (let c = 0; c < floor.cols; c++) {
        const key = `cell-${r}-${c}`;
        if (floor[key] === name) {
          return { floor: parseInt(floorKey, 10), row: r, col: c, key: `${floorKey}-${r}-${c}` };
        }
      }
    }
  }
  return null;
}

function getNeighbors(node, mapData) {
  const neighbors = [];
  const { floors } = mapData;
  const floorData = floors[node.floor];
  
  if (!floorData) return neighbors;

  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  for (const [dr, dc] of dirs) {
    const nr = node.row + dr;
    const nc = node.col + dc;
    
    if (nr >= 0 && nr < floorData.rows && nc >= 0 && nc < floorData.cols) {
      const key = `cell-${nr}-${nc}`;
      const val = floorData[key];
      if (val !== undefined && val !== "X") {
        neighbors.push({ floor: node.floor, row: nr, col: nc, key: `${node.floor}-${nr}-${nc}` });
      }
    }
  }

  const currentKey = `cell-${node.row}-${node.col}`;
  if (floorData[currentKey] === "STAIR") {
    for (const fl in floors) {
      const targetFloor = parseInt(fl, 10);
      if (Math.abs(targetFloor - node.floor) === 1) { // adjacent floors
        const targetFloorData = floors[fl];
        for (let r = 0; r < targetFloorData.rows; r++) {
          if (targetFloorData[`cell-${r}-${node.col}`] === "STAIR") {
            neighbors.push({ floor: targetFloor, row: r, col: node.col, key: `${targetFloor}-${r}-${node.col}` });
          }
        }
      }
    }
  }

  return neighbors;
}

function multiFloorAStar(startName, endName, mapData) {
  const startNode = findNodeByName(startName, mapData);
  const endNode = findNodeByName(endName, mapData);

  const openSet = [startNode];
  const cameFrom = new Map();
  const gScore = new Map();
  gScore.set(startNode.key, 0);
  const fScore = new Map();
  fScore.set(startNode.key, heuristic(startNode, endNode));

  let iterations = 0;
  while (openSet.length > 0) {
    iterations++;
    if (iterations > 100000) {
       console.log("Too many iterations");
       break;
    }
    let current = openSet[0];
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      const scoreI = fScore.get(openSet[i].key) ?? Infinity;
      const scoreCurrent = fScore.get(current.key) ?? Infinity;
      if (scoreI < scoreCurrent) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    if (current.key === endNode.key) {
      const pathArr = [current];
      let currKey = current.key;
      while (cameFrom.has(currKey)) {
        const prev = cameFrom.get(currKey);
        pathArr.unshift(prev);
        currKey = prev.key;
      }
      return pathArr;
    }

    openSet.splice(currentIndex, 1);
    
    const neighbors = getNeighbors(current, mapData);
    for (const neighbor of neighbors) {
      const tentativeGScore = (gScore.get(current.key) ?? Infinity) + 1;
      
      if (tentativeGScore < (gScore.get(neighbor.key) ?? Infinity)) {
        cameFrom.set(neighbor.key, current);
        gScore.set(neighbor.key, tentativeGScore);
        fScore.set(neighbor.key, tentativeGScore + heuristic(neighbor, endNode));
        
        if (!openSet.some(n => n.key === neighbor.key)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return []; 
}

const pathArr = multiFloorAStar("FőBej", "Info I", mapData);
console.log("Path length:", pathArr.length);

