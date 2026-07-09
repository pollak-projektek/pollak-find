const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/Users/fekeandras/pollak-find/src/data/mapData.json'));
const floorData = data.floors['0'];
const rows = floorData.rows;
const cols = floorData.cols;

const getCellType = (r, c) => {
  const val = floorData[`cell-${r}-${c}`] || "";
  if (val === "X") return "wall";
  if (val === "STAIR") return "stair";
  if (val === "DOOR") return "door";
  if (val !== "") return "room";
  return "empty";
};

const getCellValue = (r, c) => {
  const val = floorData[`cell-${r}-${c}`] || "";
  if (val === "X" || val === "STAIR" || val === "DOOR") return "";
  return val.trim();
};

const visited = new Set();
const rooms = [];

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (visited.has(`${r}-${c}`)) continue;
    const type = getCellType(r, c);
    if (type === 'room') {
      const val = getCellValue(r, c);
      if (val === 'I. Tant.') {
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
        rooms.push({ val, r, c, w, h });
      } else {
        // Just mark as visited (simplification for other rooms)
        // Wait, if other rooms expand, they might mark cells visited!
        // We need to implement the FULL logic.
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
      }
    }
  }
}
console.log(rooms);
