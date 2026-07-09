// Helper to calculate heuristic (Manhattan distance + heavy floor penalty)
function heuristic(a, b) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  const dz = Math.abs(a.floor - b.floor) * 100; // Penalize floor changes
  return dx + dy + dz;
}

// Find all nodes by room name across all floors
export function findAllNodesByName(name, mapData) {
  const nodes = [];
  const { floors } = mapData;
  for (const floorKey in floors) {
    const floor = floors[floorKey];
    for (let r = 0; r < floor.rows; r++) {
      for (let c = 0; c < floor.cols; c++) {
        const key = `cell-${r}-${c}`;
        if (floor[key] === name) {
          nodes.push({ floor: parseInt(floorKey, 10), row: r, col: c, key: `${floorKey}-${r}-${c}` });
        }
      }
    }
  }
  return nodes;
}

// Check if a cell is walkable
const isWalkable = (floorData, r, c) => {
  const key = `cell-${r}-${c}`;
  const val = floorData[key];
  if (val === undefined || val === 'X') return false;
  if (val === 'STAIR' || val === 'DOOR') return true;
  if (val !== "") return true; // room
  return true; // empty (corridor)
};

// Get walkable neighbors for a node
function getNeighbors(node, mapData) {
  const neighbors = [];
  const { floors } = mapData;
  const floorData = floors[node.floor];
  
  if (!floorData) return neighbors;

  // Directions: Up, Down, Left, Right
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  for (const [dr, dc] of dirs) {
    const nr = node.row + dr;
    const nc = node.col + dc;
    
    if (nr >= 0 && nr < floorData.rows && nc >= 0 && nc < floorData.cols) {
      if (isWalkable(floorData, nr, nc)) {
        neighbors.push({ floor: node.floor, row: nr, col: nc, key: `${node.floor}-${nr}-${nc}` });
      }
    }
  }

  // Handle cross-floor stair connections
  const currentKey = `cell-${node.row}-${node.col}`;
  if (floorData[currentKey] === "STAIR") {
    for (const fl in floors) {
      const targetFloor = parseInt(fl, 10);
      if (Math.abs(targetFloor - node.floor) === 1) { // adjacent floors
        const targetFloorData = floors[fl];
        let closestStair = null;
        let minDistance = Infinity;
        
        for (let r = 0; r < targetFloorData.rows; r++) {
          for (let c = 0; c < targetFloorData.cols; c++) {
            if (targetFloorData[`cell-${r}-${c}`] === "STAIR") {
              const dist = Math.abs(r - node.row) + Math.abs(c - node.col);
              if (dist < minDistance) {
                minDistance = dist;
                closestStair = { r, c };
              }
            }
          }
        }
        
        if (closestStair) {
          neighbors.push({ floor: targetFloor, row: closestStair.r, col: closestStair.c, key: `${targetFloor}-${closestStair.r}-${closestStair.c}` });
        }
      }
    }
  }

  return neighbors;
}

// Multi-floor A* algorithm
export function multiFloorAStar(startName, endName, mapData) {
  const startNodes = findAllNodesByName(startName, mapData);
  const endNodes = findAllNodesByName(endName, mapData);

  if (startNodes.length === 0 || endNodes.length === 0) {
    console.error("Start or end node not found");
    return [];
  }

  const openSet = [...startNodes];
  const cameFrom = new Map();
  
  const gScore = new Map();
  const fScore = new Map();

  const h = (node) => {
    let minH = Infinity;
    for (const end of endNodes) {
      const val = heuristic(node, end);
      if (val < minH) minH = val;
    }
    return minH;
  };

  for (const start of startNodes) {
    gScore.set(start.key, 0);
    fScore.set(start.key, h(start));
  }

  while (openSet.length > 0) {
    // Find node with lowest fScore
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

    if (endNodes.some(end => end.key === current.key)) {
      // Reconstruct path
      const path = [current];
      let currKey = current.key;
      while (cameFrom.has(currKey)) {
        const prev = cameFrom.get(currKey);
        path.unshift(prev);
        currKey = prev.key;
      }
      return path;
    }

    openSet.splice(currentIndex, 1);
    
    const neighbors = getNeighbors(current, mapData);
    for (const neighbor of neighbors) {
      let moveCost = 1;
      const neighborVal = mapData.floors[neighbor.floor][`cell-${neighbor.row}-${neighbor.col}`];
      
      if (current.floor !== neighbor.floor) {
        moveCost = 10; // Cost to use the stairs and change floors
      } else {
        if (neighborVal === 'STAIR') {
          moveCost = 1000; // Huge penalty for walking onto a stair cell on the same floor
        } else if (neighborVal === 'DOOR') {
          moveCost = 4; // Penalty for walking through a door instead of a corridor
        } else if (neighborVal !== '') {
          // If it's a room and it's not the start or end room, penalize heavily
          if (neighborVal !== startName && neighborVal !== endName) {
            moveCost = 50;
          }
        }
      }

      const tentativeGScore = (gScore.get(current.key) ?? Infinity) + moveCost;
      
      if (tentativeGScore < (gScore.get(neighbor.key) ?? Infinity)) {
        cameFrom.set(neighbor.key, current);
        gScore.set(neighbor.key, tentativeGScore);
        fScore.set(neighbor.key, tentativeGScore + h(neighbor));
        
        if (!openSet.some(n => n.key === neighbor.key)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return []; // No path found
}
