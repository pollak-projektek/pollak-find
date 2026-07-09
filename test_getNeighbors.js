import fs from 'fs';
import { fileURLToPath } from 'url';
import p from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = p.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(p.join(__dirname, 'src/data/mapData.json'), 'utf-8'));

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
  return neighbors;
}

console.log(getNeighbors({ floor: 0, row: 12, col: 3 }, mapData));
