const allowedStairs = [`<img src="stair-white.png" class="stair">`];
const presetRoomNames = ["Info I", "Játék"];

// Frissített getNeighbors függvény, amely figyelembe veszi az emeletváltozás szabályait
const stairConnections = {
  // Földszint és 1. emelet közötti lépcsőkapcsolatok
  "0-12-2": { floor: 1, row: 4, col: 2 },
  "0-11-19": { floor: 1, row: 3, col: 19 },
  "1-4-2": { floor: 0, row: 12, col: 2 },
  "1-3-19": { floor: 0, row: 11, col: 19 },

  // 1. és 2. emelet közötti lépcsőkapcsolatok
  "1-4-2": { floor: 2, row: 4, col: 2 },
  "1-3-19": { floor: 2, row: 2, col: 19 },
  "2-3-2": { floor: 1, row: 4, col: 2 },
  "2-2-19": { floor: 1, row: 3, col: 19 },
};

// Emeletek: minden emelet saját sor- és oszlopszámmal, illetve cellaadatokkal
const floors = {
  0: {
    rows: 13,
    cols: 20,

    "cell-0-0": "X",
    "cell-0-1": "X",
    "cell-0-2": "HAjtó",
    "cell-0-3": "X",
    "cell-0-4": "X",
    "cell-0-5": "X",
    "cell-0-6": "X",
    "cell-0-7": "X",
    "cell-0-8": "X",
    "cell-0-9": "X",
    "cell-0-10": "X",
    "cell-0-11": "X",
    "cell-0-12": "X",
    "cell-0-13": "X",
    "cell-0-14": "X",
    "cell-0-15": "X",
    "cell-0-16": "X",
    "cell-0-17": "X",
    "cell-0-18": "X",
    "cell-0-19": "X",

    "cell-1-0": "X",
    "cell-1-1": "IpElek",
    "cell-1-2": "",
    "cell-1-3": "X",
    "cell-1-4": "X",
    "cell-1-5": "KNX",
    "cell-1-6": "X",
    "cell-1-7": "X",
    "cell-1-8": "PLC",
    "cell-1-9": "X",
    "cell-1-10": "X",
    "cell-1-11": "X",
    "cell-1-12": "X",
    "cell-1-13": "X",
    "cell-1-14": "X",
    "cell-1-15": "DKA",
    "cell-1-16": "X",
    "cell-1-17": "X",
    "cell-1-18": "Mech",
    "cell-1-19": "X",

    "cell-2-0": "X",
    "cell-2-1": "X",
    "cell-2-2": "",
    "cell-2-3": "",
    "cell-2-4": "",
    "cell-2-5": "",
    "cell-2-6": "",
    "cell-2-7": "",
    "cell-2-8": "",
    "cell-2-9": "",
    "cell-2-10": "",
    "cell-2-11": "",
    "cell-2-12": "",
    "cell-2-13": "",
    "cell-2-14": "",
    "cell-2-15": "",
    "cell-2-16": "",
    "cell-2-17": "",
    "cell-2-18": "",
    "cell-2-19": "Kondi",

    "cell-3-0": "",
    "cell-3-1": "",
    "cell-3-2": "",
    "cell-3-3": "X",
    "cell-3-4": "FérfiÖ",
    "cell-3-5": "X",
    "cell-3-6": "X",
    "cell-3-7": "FwcT",
    "cell-3-8": "X",
    "cell-3-9": "X",
    "cell-3-10": "NőiÖ",
    "cell-3-11": "X",
    "cell-3-12": "X",
    "cell-3-13": "X",
    "cell-3-14": "Szert.",
    "cell-3-15": "X",
    "cell-3-16": "Torna T.",
    "cell-3-17": "X",
    "cell-3-18": "X",
    "cell-3-19": "X",

    "cell-4-0": "Elektr",
    "cell-4-1": "X",
    "cell-4-2": "",
    "cell-4-3": "X",
    "cell-4-4": "X",
    "cell-4-5": "X",
    "cell-4-6": "X",
    "cell-4-7": "X",
    "cell-4-8": "X",
    "cell-4-9": "X",
    "cell-4-10": "X",
    "cell-4-11": "X",
    "cell-4-12": "X",
    "cell-4-13": "X",
    "cell-4-14": "X",
    "cell-4-15": "X",
    "cell-4-16": "X",
    "cell-4-17": "X",
    "cell-4-18": "X",
    "cell-4-19": "X",

    "cell-5-0": "X",
    "cell-5-1": "X",
    "cell-5-2": "",
    "cell-5-3": "X",
    "cell-5-4": "X",
    "cell-5-5": "X",
    "cell-5-6": "X",
    "cell-5-7": "X",
    "cell-5-8": "X",
    "cell-5-9": "X",
    "cell-5-10": "X",
    "cell-5-11": "X",
    "cell-5-12": "X",
    "cell-5-13": "X",
    "cell-5-14": "X",
    "cell-5-15": "X",
    "cell-5-16": "X",
    "cell-5-17": "X",
    "cell-5-18": "X",
    "cell-5-19": "X",

    "cell-6-0": "KAjtó",
    "cell-6-1": "",
    "cell-6-2": "",
    "cell-6-3": "UAjtó",
    "cell-6-4": "X",
    "cell-6-5": "X",
    "cell-6-6": "X",
    "cell-6-7": "X",
    "cell-6-8": "X",
    "cell-6-9": "X",
    "cell-6-10": "X",
    "cell-6-11": "X",
    "cell-6-12": "X",
    "cell-6-13": "X",
    "cell-6-14": "X",
    "cell-6-15": "X",
    "cell-6-16": "X",
    "cell-6-17": "X",
    "cell-6-18": "X",
    "cell-6-19": "X",

    "cell-7-0": "X",
    "cell-7-1": "X",
    "cell-7-2": "",
    "cell-7-3": "X",
    "cell-7-4": "X",
    "cell-7-5": "X",
    "cell-7-6": "X",
    "cell-7-7": "X",
    "cell-7-8": "X",
    "cell-7-9": "X",
    "cell-7-10": "X",
    "cell-7-11": "X",
    "cell-7-12": "X",
    "cell-7-13": "X",
    "cell-7-14": "X",
    "cell-7-15": "X",
    "cell-7-16": "X",
    "cell-7-17": "X",
    "cell-7-18": "X",
    "cell-7-19": "X",

    "cell-8-0": "X",
    "cell-8-1": "Chill",
    "cell-8-2": "",
    "cell-8-3": "X",
    "cell-8-4": "X",
    "cell-8-5": "X",
    "cell-8-6": "X",
    "cell-8-7": "X",
    "cell-8-8": "X",
    "cell-8-9": "X",
    "cell-8-10": "X",
    "cell-8-11": "X",
    "cell-8-12": "X",
    "cell-8-13": "X",
    "cell-8-14": "X",
    "cell-8-15": "X",
    "cell-8-16": "X",
    "cell-8-17": "SzerT",
    "cell-8-18": "NőiM",
    "cell-8-19": "X",

    "cell-9-0": "X",
    "cell-9-1": "Büfé",
    "cell-9-2": "",
    "cell-9-3": "",
    "cell-9-4": "",
    "cell-9-5": "",
    "cell-9-6": "X",
    "cell-9-7": "X",
    "cell-9-8": "X",
    "cell-9-9": "X",
    "cell-9-10": "X",
    "cell-9-11": "X",
    "cell-9-12": "X",
    "cell-9-13": "X",
    "cell-9-14": "X",
    "cell-9-15": "X",
    "cell-9-16": "I. Tant.",
    "cell-9-17": "",
    "cell-9-18": "",
    "cell-9-19": "HBej",

    "cell-10-0": "X",
    "cell-10-1": "X",
    "cell-10-2": "",
    "cell-10-3": "",
    "cell-10-4": "X",
    "cell-10-5": "",
    "cell-10-6": "X",
    "cell-10-7": "X",
    "cell-10-8": "X",
    "cell-10-9": "X",
    "cell-10-10": "X",
    "cell-10-11": "X",
    "cell-10-12": "X",
    "cell-10-13": "X",
    "cell-10-14": "X",
    "cell-10-15": "X",
    "cell-10-16": "X",
    "cell-10-17": "",
    "cell-10-18": "",
    "cell-10-19": "X",

    "cell-11-0": "Játék",
    "cell-11-1": "",
    "cell-11-2": "",
    "cell-11-3": "",
    "cell-11-4": "",
    "cell-11-5": "",
    "cell-11-6": "",
    "cell-11-7": "",
    "cell-11-8": "",
    "cell-11-9": "",
    "cell-11-10": "",
    "cell-11-11": "",
    "cell-11-12": "",
    "cell-11-13": "",
    "cell-11-14": "",
    "cell-11-15": "",
    "cell-11-16": "",
    "cell-11-17": "",
    "cell-11-18": "",
    "cell-11-19": `<img src="stair-white.png" class="stair">`,

    "cell-12-0": "",
    "cell-12-1": "Fwc0",
    "cell-12-2": `<img src="stair-white.png" class="stair">`,
    "cell-12-3": "FőBej",
    "cell-12-4": "X",
    "cell-12-5": "X",
    "cell-12-6": "X",
    "cell-12-7": "Mat2",
    "cell-12-8": "X",
    "cell-12-9": "Mat3",
    "cell-12-10": "X",
    "cell-12-11": "X",
    "cell-12-12": "X",
    "cell-12-13": "X",
    "cell-12-14": "CadC",
    "cell-12-15": "X",
    "cell-12-16": "X",
    "cell-12-17": "X",
    "cell-12-18": "Info VI",
    "cell-12-19": "X",
  },
  1: {
    rows: 6,
    cols: 20,
    "cell-0-0": "X",
    "cell-0-1": "X",
    "cell-0-2": "X",
    "cell-0-3": "X",
    "cell-0-4": "X",
    "cell-0-5": "X",
    "cell-0-6": "X",
    "cell-0-7": "X",
    "cell-0-8": "X",
    "cell-0-9": "X",
    "cell-0-10": "X",
    "cell-0-11": "X",
    "cell-0-12": "X",
    "cell-0-13": "X",
    "cell-0-14": "X",
    "cell-0-15": "X",
    "cell-0-16": "X",
    "cell-0-17": "X",
    "cell-0-18": "X",
    "cell-0-19": "X",

    "cell-1-0": "X",
    "cell-1-1": "X",
    "cell-1-2": "X",
    "cell-1-3": "X",
    "cell-1-4": "X",
    "cell-1-5": "X",
    "cell-1-6": "X",
    "cell-1-7": "X",
    "cell-1-8": "X",
    "cell-1-9": "X",
    "cell-1-10": "X",
    "cell-1-11": "X",
    "cell-1-12": "X",
    "cell-1-13": "X",
    "cell-1-14": "X",
    "cell-1-15": "X",
    "cell-1-16": "X",
    "cell-1-17": "Info II",
    "cell-1-18": "",
    "cell-1-19": "X",

    "cell-2-0": "Igazg.",
    "cell-2-1": "Titk",
    "cell-2-2": "Tanári",
    "cell-2-3": "X",
    "cell-2-4": "X",
    "cell-2-5": "Info III",
    "cell-2-6": "X",
    "cell-2-7": "X",
    "cell-2-8": "X",
    "cell-2-9": "X",
    "cell-2-10": "X",
    "cell-2-11": "X",
    "cell-2-12": "X",
    "cell-2-13": "X",
    "cell-2-14": "X",
    "cell-2-15": "X",
    "cell-2-16": "X",
    "cell-2-17": "X",
    "cell-2-18": "Info I",
    "cell-2-19": "X",

    "cell-3-0": "",
    "cell-3-1": "",
    "cell-3-2": "",
    "cell-3-3": "",
    "cell-3-4": "",
    "cell-3-5": "",
    "cell-3-6": "",
    "cell-3-7": "",
    "cell-3-8": "",
    "cell-3-9": "",
    "cell-3-10": "",
    "cell-3-11": "",
    "cell-3-12": "",
    "cell-3-13": "",
    "cell-3-14": "",
    "cell-3-15": "",
    "cell-3-16": "",
    "cell-3-17": "",
    "cell-3-18": "",
    "cell-3-19": `<img src="stair-white.png" class="stair">`,

    "cell-4-0": "X",
    "cell-4-1": "Fwc1",
    "cell-4-2": `<img src="stair-white.png" class="stair">`,
    "cell-4-3": "Gaz.ir",
    "cell-4-4": "V. Tant.",
    "cell-4-5": "X",
    "cell-4-6": "Kajtor",
    "cell-4-7": "X",
    "cell-4-8": "X",
    "cell-4-9": "X",
    "cell-4-10": "Info VII",
    "cell-4-11": "X",
    "cell-4-12": "X",
    "cell-4-13": "X",
    "cell-4-14": "Info V",
    "cell-4-15": "X",
    "cell-4-16": "X",
    "cell-4-17": "X",
    "cell-4-18": "Info IV",
    "cell-4-19": "X",

    "cell-5-0": "X",
    "cell-5-1": "X",
    "cell-5-2": "X",
    "cell-5-3": "X",
    "cell-5-4": "X",
    "cell-5-5": "X",
    "cell-5-6": "X",
    "cell-5-7": "X",
    "cell-5-8": "X",
    "cell-5-9": "X",
    "cell-5-10": "X",
    "cell-5-11": "X",
    "cell-5-12": "X",
    "cell-5-13": "X",
    "cell-5-14": "X",
    "cell-5-15": "X",
    "cell-5-16": "X",
    "cell-5-17": "X",
    "cell-5-18": "X",
    "cell-5-19": "X",
  },

  2: {
    rows: 6,
    cols: 20,
    "cell-0-0": "X",
    "cell-0-1": "X",
    "cell-0-2": "X",
    "cell-0-3": "X",
    "cell-0-4": "X",
    "cell-0-5": "X",
    "cell-0-6": "X",
    "cell-0-7": "X",
    "cell-0-8": "X",
    "cell-0-9": "X",
    "cell-0-10": "X",
    "cell-0-11": "X",
    "cell-0-12": "X",
    "cell-0-13": "X",
    "cell-0-14": "X",
    "cell-0-15": "X",
    "cell-0-16": "X",
    "cell-0-17": "X",
    "cell-0-18": "X",
    "cell-0-19": "X",

    "cell-1-0": "X",
    "cell-1-1": "X",
    "cell-1-2": "X",
    "cell-1-3": "X",
    "cell-1-4": "X",
    "cell-1-5": "X",
    "cell-1-6": "X",
    "cell-1-7": "X",
    "cell-1-8": "X",
    "cell-1-9": "X",
    "cell-1-10": "X",
    "cell-1-11": "X",
    "cell-1-12": "X",
    "cell-1-13": "X",
    "cell-1-14": "X",
    "cell-1-15": "X",
    "cell-1-16": "X",
    "cell-1-17": "X",
    "cell-1-18": "X",
    "cell-1-19": "X",

    "cell-2-0": "Játék",
    "cell-2-1": "",
    "cell-2-2": "",
    "cell-2-3": "",
    "cell-2-4": "",
    "cell-2-5": "",
    "cell-2-6": "",
    "cell-2-7": "",
    "cell-2-8": "",
    "cell-2-9": "",
    "cell-2-10": "",
    "cell-2-11": "",
    "cell-2-12": "",
    "cell-2-13": "",
    "cell-2-14": "",
    "cell-2-15": "",
    "cell-2-16": "",
    "cell-2-17": "",
    "cell-2-18": "",
    "cell-2-19": `<img src="stair-white.png" class="stair">`,

    "cell-3-0": "Nwc2",
    "cell-3-1": "Fwc2",
    "cell-3-2": `<img src="stair-white.png" class="stair">`,
    "cell-3-3": "X",
    "cell-3-4": "X",
    "cell-3-5": "Mat1",
    "cell-3-6": "X",
    "cell-3-7": "VII. Tant.",
    "cell-3-8": "X",
    "cell-3-9": "X",
    "cell-3-10": "VIII. Tant.",
    "cell-3-11": "X",
    "cell-3-12": "X",
    "cell-3-13": "X",
    "cell-3-14": "IX. Tant.",
    "cell-3-15": "X",
    "cell-3-16": "X",
    "cell-3-17": "X",
    "cell-3-18": "X. Tant.",
    "cell-3-19": "X",

    "cell-4-0": "X",
    "cell-4-1": "X",
    "cell-4-2": "X",
    "cell-4-3": "X",
    "cell-4-4": "X",
    "cell-4-5": "X",
    "cell-4-6": "X",
    "cell-4-7": "X",
    "cell-4-8": "X",
    "cell-4-9": "X",
    "cell-4-10": "X",
    "cell-4-11": "X",
    "cell-4-12": "X",
    "cell-4-13": "X",
    "cell-4-14": "X",
    "cell-4-15": "X",
    "cell-4-16": "X",
    "cell-4-17": "X",
    "cell-4-18": "X",
    "cell-4-19": "X",

    "cell-5-0": "X",
    "cell-5-1": "X",
    "cell-5-2": "X",
    "cell-5-3": "X",
    "cell-5-4": "X",
    "cell-5-5": "X",
    "cell-5-6": "X",
    "cell-5-7": "X",
    "cell-5-8": "X",
    "cell-5-9": "X",
    "cell-5-10": "X",
    "cell-5-11": "X",
    "cell-5-12": "X",
    "cell-5-13": "X",
    "cell-5-14": "X",
    "cell-5-15": "X",
    "cell-5-16": "X",
    "cell-5-17": "X",
    "cell-5-18": "X",
    "cell-5-19": "X",
  },
};

let currentFloor = 0;
let grid = [];

// Grid létrehozása az aktuális emelet beállításai szerint
let timeoutIds = [];

function createGrid() {
  const gridElement = document.getElementById("grid");

  gridElement.innerHTML = ""; // Előző grid törlése
  grid = [];
  const floorData = floors[currentFloor];
  const rows = floorData.rows;
  const cols = floorData.cols;

  const fragment = document.createDocumentFragment();

  for (let row = 0; row < rows; row++) {
    let rowArray = [];
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      const cellId = `cell-${row}-${col}`;
      cell.id = cellId;
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-col", col);
      cell.classList.add("cell");
      cell.style.userSelect = "none";

      const key = `cell-${row}-${col}`;
      if (floorData[key]) {
        const name = floorData[key];
        if (name === "X") {
          cell.classList.add("black");
          cell.innerHTML = "";
        } else {
          cell.innerHTML = name;
        }
      }

      // Csak az aktuális emelet útvonalát rendereljük
      const pathIndex = currentPath.findIndex(
        (n) => n.floor === currentFloor && n.row === row && n.col === col
      );
      if (pathIndex !== -1) {
        const delay = pathIndex * 25; // Kis késleltetés az animációhoz
        const timeoutId = setTimeout(() => {
          cell.classList.add("path");
          cell.style.animationDelay = `${pathIndex * 0.1}s`;
        }, delay);
        timeoutIds.push(timeoutId);
      }

      rowArray.push(cell);
      fragment.appendChild(cell);
    }
    grid.push(rowArray);
  }

  gridElement.appendChild(fragment);
}

// Emelet váltása dropdown segítségével
// Eredeti switchFloor függvény minimális módosítással
function switchFloor(floor) {
  if (floors[floor]) {
    currentFloor = floor;
    gridMovedManually = false;

    if (fullPath.length > 0) {
      // Az aktuális emelet teljes útvonalszakaszának kiválasztása
      const floorSegmentStart = fullPath.findIndex(
        (n) => n.floor === currentFloor
      );
      const floorSegmentEnd = fullPath.findLastIndex(
        (n) => n.floor === currentFloor
      );

      if (floorSegmentStart !== -1 && floorSegmentEnd !== -1) {
        // Az aktuális emelet teljes szakasza a kezdőponttól a lépcsőig
        currentPath = fullPath.slice(floorSegmentStart, floorSegmentEnd + 1);
      } else {
        // Ha az emeleten nincs útvonal (pl. csak áthaladás), üres
        currentPath = [];
      }
    } else {
      currentPath = [];
    }

    createGrid();
    centerGrid(true);
    updateFloorDisplay();
    updateArrowBlink();
    updateArrowPosition(); // Csak ezt adtam hozzá
  }
}

function generateQRCode(start, end) {
  const qrContainer = document.getElementById("qrcode-container");
  const qrDiv = document.getElementById("qrcode");
  const qrMessage = document.getElementById("qr-message");

  // Előző QR-kód törlése
  qrDiv.innerHTML = "";

  // QR-kód generálása

  const url = window.location.href.split("?")[0];

  new QRCode(qrDiv, {
    text: `${url}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(
      end
    )}`,
    width: 156,
    height: 156,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });

  // Üzenet elrejtése és QR-kód megjelenítése
  qrMessage.style.display = "none";
  qrDiv.style.display = "flex";

  // Animáció indítása
  qrContainer.classList.remove("animate");
  void qrContainer.offsetWidth;
  qrContainer.classList.add("animate");
}

const roomIndex = {};

function buildRoomIndex() {
  for (let fl in floors) {
    const floorData = floors[fl];
    for (let row = 0; row < floorData.rows; row++) {
      for (let col = 0; col < floorData.cols; col++) {
        const cellValue = getCell(parseInt(fl), row, col);
        if (cellValue && cellValue !== "X") {
          roomIndex[cellValue] = { floor: parseInt(fl), row, col };
        }
      }
    }
  }
}

// Az indexet egyszer felépítjük, amikor az oldal betöltődik
// DOM betöltésekor az eredeti kódhoz hozzáadom a kezdeti pozíció beállítását
document.addEventListener("DOMContentLoaded", function () {
  buildRoomIndex();
  createGrid();

  updateFloorDisplay();
  updateArrowPosition(); // Hozzáadva a kezdeti pozícióhoz

  const urlParams = new URLSearchParams(window.location.search);
  const start = urlParams.get("start");
  const end = urlParams.get("end");

  if (start && end && roomIndex[start] && roomIndex[end]) {
    document.getElementById("start").value = start;
    document.getElementById("end").value = end;
    runPathfinding();
  } else {
    document.getElementById("qr-message").style.display = "block";
  }
});

setupDesktop();

window.addEventListener("resize", centerGrid);

function setupDesktop() {
  const gridElement = document.getElementById("grid");

  window.resetGridPosition = function () {
    fullPath = [];
    currentPath = [];
    createGrid();
    document.getElementById("start").value = "";
    document.getElementById("end").value = "";
    document.getElementById("qrcode").innerHTML = "";
    document.getElementById("qrcode").style.display = "none";
    document.getElementById("qr-message").style.display = "block";
    targetFloor = null;
    updateArrowBlink();
    updateFloorDisplay();
  };
}

let gridMovedManually = false; // Jelzi, hogy a felhasználó mozgatta-e a gridet

// Segédfüggvény: adott emelet, sor, oszlop cellájának tartalma
function getCell(floor, row, col) {
  const key = `cell-${row}-${col}`;
  return floors[floor] ? floors[floor][key] || "" : "";
}

// Vizsgáljuk, hogy egy cella akadályként szerepel-e
function isBlocked(floor, row, col, startName, endName) {
  const cell = getCell(floor, row, col);
  if (cell === "X") return true; // Falak továbbra is akadályok

  // Ha a cella neve szerepel a presetRoomNames listában, akkor engedélyezzük az áthaladást
  if (presetRoomNames.includes(cell)) {
    return false;
  }

  // Alapból minden más akadály (ha nem indulási vagy célállomás)
  if (
    cell !== "" &&
    !allowedStairs.includes(cell) &&
    cell !== startName &&
    cell !== endName
  ) {
    return true;
  }

  return false;
}

function getNeighbors(node, startName, endName) {
  const { floor, row, col } = node;
  const neighbors = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  if (!floors[floor]) return neighbors;

  const floorData = floors[floor];
  const maxRows = floorData.rows;
  const maxCols = floorData.cols;
  const startPos = findNodeByName(startName);
  const endPos = findNodeByName(endName);

  if (!startPos || !endPos) {
    console.error("Hiba: Érvénytelen kezdő- vagy célpont.");
    return neighbors;
  }

  const sameFloor = startPos.floor === endPos.floor;

  directions.forEach(([dRow, dCol]) => {
    const nRow = row + dRow;
    const nCol = col + dCol;
    if (nRow >= 0 && nRow < maxRows && nCol >= 0 && nCol < maxCols) {
      const cellValue = getCell(floor, nRow, nCol);

      // Ha ugyanazon az emeleten van, akkor tiltsuk a lépcsőket
      if (sameFloor && allowedStairs.includes(cellValue)) {
        return;
      }

      if (!isBlocked(floor, nRow, nCol, startName, endName)) {
        neighbors.push({ floor, row: nRow, col: nCol });
      }
    }
  });

  // Ha emeletváltás szükséges, biztosítsuk, hogy a lépcsőkapcsolatok mindig működjenek
  const currentKey = `${node.floor}-${node.row}-${node.col}`;
  if (stairConnections[currentKey]) {
    const target = stairConnections[currentKey];
    neighbors.push({
      floor: target.floor,
      row: target.row,
      col: target.col,
    });
  }

  // Ellenőrizzük, hogy a célpont másik emeleten van-e, és ha igen, biztosítsuk az átjárást
  if (!sameFloor) {
    Object.entries(stairConnections).forEach(([key, target]) => {
      if (target.floor === floor && target.row === row && target.col === col) {
        const parts = key.split("-");
        neighbors.push({
          floor: parseInt(parts[0]),
          row: parseInt(parts[1]),
          col: parseInt(parts[2]),
        });
      }
    });
  }

  return neighbors;
}

// Heurisztika: Manhattan távolság + emeletkülönbség
function heuristic(a, b) {
  // Ha lépcsőn vagyunk, ne számoljuk a pozíciók közötti távolságot
  if (stairConnections[`${a.floor}-${a.row}-${a.col}`]) {
    return Math.abs(a.floor - b.floor); // Prioritizáljuk az emeletváltást
  }
  return (
    Math.abs(a.row - b.row) +
    Math.abs(a.col - b.col) +
    Math.abs(a.floor - b.floor) * 10 // Emeljen nagyobb súllyal az emeletkülönbségre
  );
}

// Multi-floor A* algoritmus
function multiFloorAStar(startPos, endPos, startName, endName) {
  const openList = [];
  const closedSet = new Set();
  const gScore = {};
  const fScore = {};
  const parent = {};

  function nodeKey(node) {
    return `${node.floor}-${node.row}-${node.col}`;
  }

  const startKey = nodeKey(startPos);
  gScore[startKey] = 0;
  fScore[startKey] = heuristic(startPos, endPos);
  openList.push(startPos);

  while (openList.length) {
    let current = openList.reduce((best, node) =>
      fScore[nodeKey(node)] < fScore[nodeKey(best)] ? node : best
    );
    if (
      current.floor === endPos.floor &&
      current.row === endPos.row &&
      current.col === endPos.col
    ) {
      return reconstructPath(parent, current);
    }
    const currentKey = nodeKey(current);
    openList.splice(openList.indexOf(current), 1);
    closedSet.add(currentKey);

    const neighbors = getNeighbors(current, startName, endName);
    neighbors.forEach((neighbor) => {
      const neighborKey = nodeKey(neighbor);
      if (closedSet.has(neighborKey)) return;
      const tentativeG = gScore[currentKey] + 1;
      if (tentativeG < (gScore[neighborKey] || Infinity)) {
        parent[neighborKey] = current;
        gScore[neighborKey] = tentativeG;
        fScore[neighborKey] = tentativeG + heuristic(neighbor, endPos);
        if (!openList.some((n) => nodeKey(n) === neighborKey)) {
          openList.push(neighbor);
        }
      }
    });
  }
  return []; // Útvonal nem található
}

function reconstructPath(parent, current) {
  const path = [];
  function nodeKey(node) {
    return `${node.floor}-${node.row}-${node.col}`;
  }
  while (current) {
    path.push({ floor: current.floor, row: current.row, col: current.col });
    current = parent[nodeKey(current)];
  }
  return path.reverse();
}

let targetFloor = null; // Tárolja a cél emeletét

function updateArrowBlink() {
  const upArrow = document.getElementById("upArrow");
  const downArrow = document.getElementById("downArrow");

  // Előző villogás eltávolítása
  upArrow.classList.remove("blink");
  downArrow.classList.remove("blink");

  // Ha nincs cél emelet (pl. reset után), ne villogjon semmi
  if (targetFloor === null) return;

  // Villogás frissítése az aktuális emelet és a cél emelete alapján
  if (targetFloor > currentFloor) {
    upArrow.classList.add("blink"); // Felfelé kell menni
  } else if (targetFloor < currentFloor) {
    downArrow.classList.add("blink"); // Lefelé kell menni
  }
}

// Útvonalkeresés
let fullPath = []; // Teljes útvonal tárolása
let currentPath = []; // Aktuális emelet útvonala

function runPathfinding() {
  const startName = document.getElementById("start").value;
  const endName = document.getElementById("end").value;

  if (!startName || !endName) {
    alert("Válassz egy kezdő és/vagy célpontot!");
    return;
  }

  const startPos = findNodeByName(startName);
  const endPos = findNodeByName(endName);

  if (!startPos || !endPos) {
    alert("Érvénytelen kezdő- vagy célpont.");
    return;
  }

  targetFloor = endPos.floor;
  fullPath = multiFloorAStar(startPos, endPos, startName, endName);

  if (fullPath.length > 0) {
    // Az aktuális emelet teljes szakaszát állítjuk be induláskor
    const floorSegmentStart = fullPath.findIndex(
      (n) => n.floor === currentFloor
    );
    const floorSegmentEnd = fullPath.findLastIndex(
      (n) => n.floor === currentFloor
    );
    currentPath =
      floorSegmentStart !== -1 && floorSegmentEnd !== -1
        ? fullPath.slice(floorSegmentStart, floorSegmentEnd + 1)
        : [];

    createGrid();
    generateQRCode(startName, endName);
    document.getElementById("qr-message").style.display = "none";
    updateArrowBlink();
    intervallStart();

    //add text to currentFloorText: A célállomásod a X emeleten található
    let currentFloord = document.getElementById("currentFloorText");
    let text =
      endPos.floor > 0
        ? `A célállomásod a ${endPos.floor}. emeleten található`
        : "A célállomásod a földszinten található";
    currentFloord.textContent = text;
  } else {
    alert("Nincs útvonal a kiválasztott pontok között!");
    document.getElementById("qr-message").style.display = "block";
  }
}

function updateFloorDisplay() {
  const floorNames = {
    0: "Földszint",
    1: "1. Emelet",
    2: "2. Emelet",
  };
  const currentFloorElement = document.getElementById("currentFloor");
  if (currentFloorElement) {
    currentFloorElement.textContent =
      floorNames[currentFloor] || "Ismeretlen emelet";
  }
}

// Keresés az összes emeletben
function findNodeByName(name) {
  return roomIndex[name] || null;
}

function centerGrid(force = false) {
  // const gridElement = document.getElementById("grid");
  // const leftPanel = document.querySelector(".left-panel");
  // if (!gridElement || !leftPanel) return;
  // // Ha a felhasználó manuálisan mozgatta a gridet, ne igazítsuk újra, kivéve, ha force = true
  // if (gridMovedManually && !force) return;
  // // Alapértelmezett értékek definiálása, hogy ne legyen undefined
  // let adjustedLeft = 0;
  // let adjustedTop = 0;
  // // Csak akkor számoljuk a pozíciót, ha a képernyő szélessége >= 1300px
  // if (window.innerWidth >= 1300) {
  //   const gridWidth = gridElement.offsetWidth;
  //   const gridHeight = gridElement.offsetHeight;
  //   const windowWidth = window.innerWidth;
  //   const windowHeight = window.innerHeight;
  //   const leftPanelWidth = leftPanel.offsetWidth; // 275px
  //   const arrowContainerWidth = 40 + 10; // Nyíl szélessége (40px) + margók (10px)
  //   // A bal oldali eltolás: sidebar + nyilak
  //   const leftOffset = leftPanelWidth + arrowContainerWidth + 15; // +15 a sidebar margin miatt
  //   // Középre igazítás, figyelembe véve az eltolást
  //   adjustedLeft = (windowWidth - gridWidth) / 2 + leftOffset / 2;
  //   adjustedTop = (windowHeight - gridHeight) / 2;
  //   // Stílusok alkalmazása
  //   gridElement.style.position = "absolute";
  //   gridElement.style.left = `${adjustedLeft}px`;
  //   gridElement.style.top = `${adjustedTop}px`;
  // } else {
  //   // Mobilos nézetben (pl. < 1300px) visszaállítjuk az alapértelmezett pozíciót
  //   gridElement.style.position = ""; // Vagy "static", attól függ, mi az alapértelmezett
  //   gridElement.style.left = "";
  //   gridElement.style.top = "";
  // }
}

document.addEventListener("click", function (event) {
  /*change floor with click on the floor number*/
  console.log(event.target);
  if (event.target.classList.contains("stair")) {
    console.log("stairs");
    switch (currentFloor) {
      case 0:
        switchFloor(1);
        break;
      case 1:
        switchFloor(2);
        break;
      case 2:
        switchFloor(0);
        break;
    }
  }
});

/*
document.addEventListener("contextmenu", function (event) {
  console.log(event.target);
  event.preventDefault();
  const element = event.target;
  if (
    element.classList.contains("cell") &&
    element.id !== "start" &&
    element.id !== "end" &&
    element.innerHTML !== "X" &&
    element.innerHTML !== ""
  ) {
    document.getElementById("end").value = element.innerHTML;
  }
});
*/
function changeFloor(direction) {
  const newFloor = currentFloor + direction;
  if (floors[newFloor] !== undefined) {
    switchFloor(newFloor);
    document.getElementById("floorSelect").value = newFloor;
  }
}

document.getElementById("downArrow").addEventListener("click", function () {
  if (currentFloor > 0) {
    // Ellenőrizzük, hogy lefelé tudunk-e menni
    currentFloor--;
    switchFloor(currentFloor);
    updateArrowBlink();
  }
});

document.getElementById("upArrow").addEventListener("click", function () {
  if (currentFloor < 2) {
    // Ellenőrizzük, hogy felfelé tudunk-e menni (max 2. emelet)
    currentFloor++;
    switchFloor(currentFloor);
    updateArrowBlink();
  }
});
// Új függvény a gombok pozíciójának frissítésére
function updateArrowPosition() {
  const arrowContainer = document.querySelector(".arrow-container");
  if (arrowContainer) {
    arrowContainer.classList.remove("floor-0", "floor-1", "floor-2");
    arrowContainer.classList.add(`floor-${currentFloor}`);
  }
}

let pressed = 0;
let intervalId = null;

function intervallStart() {
  document.addEventListener("keydown", (event) => {
    const pressedKey = event.key;
    if (pressedKey === "á") {
      pressed++;
      if (pressed % 2 == 1) {
        intervalId = setInterval(() => {
          autoChangeFloor();
        }, 5000);
      } else {
        clearInterval(intervalId);
      }
    }
  });
}

function autoChangeFloor() {
  console.log(currentFloor);

  switch (currentFloor) {
    case 2:
      currentFloor = 0;
      switchFloor(currentFloor);
      break;

    default:
      currentFloor++;
      switchFloor(currentFloor);
      break;
  }
}

$(function () {
  $("#grid").draggable({});
});

const localData = localStorage.getItem("sidebar");

if (localData === "active") {
  const sidebar = document.getElementById("sidenav");
  sidebar.classList.add("active");
  document.getElementById("openbtn").style.display = "none";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidenav");
  sidebar.classList.toggle("active");

  //toggle #openbtn based on class
  const openbtn = document.getElementById("openbtn");
  if (sidebar.classList.contains("active")) {
    openbtn.style.display = "none";
    localStorage.setItem("sidebar", "active");
  } else {
    openbtn.style.display = "block";
    localStorage.setItem("sidebar", "inactive");
  }
}
