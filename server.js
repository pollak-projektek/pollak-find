import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'src', 'data', 'mapData.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Térkép adatok lekérése
app.get('/api/map', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'Map data not found' });
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(rawData));
  } catch (error) {
    console.error('Hiba a mapData.json olvasásakor:', error);
    res.status(500).json({ error: 'Nem sikerült betölteni az adatokat' });
  }
});

// Térkép adatok mentése (Editor használja)
app.post('/api/map', (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8');
    res.json({ success: true, message: 'Adatok sikeresen elmentve' });
  } catch (error) {
    console.error('Hiba a mapData.json mentésekor:', error);
    res.status(500).json({ error: 'Nem sikerült menteni az adatokat' });
  }
});

// Éles környezetben (Production) a frontendet is a backend szolgálja ki
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Minden más kérésre a React alkalmazás index.html-jét adjuk vissza (SPA routing miatt)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Backend szerver fut: http://localhost:${PORT}`);
});
