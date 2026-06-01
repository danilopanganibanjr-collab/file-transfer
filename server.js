const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3005;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// In-memory file registry: { id: { originalName, filename, size, uploadedAt } }
const fileRegistry = {};

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(4).toString('hex'); // e.g. "a3f2b1c0"
    const ext = path.extname(file.originalname);
    const filename = `${id}${ext}`;
    req.fileId = id;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

app.use(express.static(path.join(__dirname, 'public')));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const id = req.fileId;
  fileRegistry[id] = {
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    uploadedAt: Date.now()
  };

  res.json({ id, originalName: req.file.originalname });
});

// File info endpoint
app.get('/info/:id', (req, res) => {
  const meta = fileRegistry[req.params.id];
  if (!meta) return res.status(404).json({ error: 'File not found' });
  res.json({ originalName: meta.originalName, size: meta.size, uploadedAt: meta.uploadedAt });
});

// Download endpoint
app.get('/file/:id', (req, res) => {
  const meta = fileRegistry[req.params.id];
  if (!meta) return res.status(404).send('File not found or expired.');

  const filePath = path.join(UPLOADS_DIR, meta.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found on disk.');

  res.download(filePath, meta.originalName);
});

// List all files (for the server owner)
app.get('/api/files', (req, res) => {
  const files = Object.entries(fileRegistry).map(([id, meta]) => ({
    id,
    originalName: meta.originalName,
    size: meta.size,
    uploadedAt: meta.uploadedAt
  }));
  res.json(files);
});

// Delete a file
app.delete('/api/files/:id', (req, res) => {
  const id = req.params.id;
  const meta = fileRegistry[id];
  if (!meta) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(UPLOADS_DIR, meta.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  delete fileRegistry[id];

  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }

  console.log(`\n✓ File Transfer running!\n`);
  console.log(`  Local:    http://localhost:${PORT}`);
  addresses.forEach(({ name, address }) => {
    console.log(`  ${name.padEnd(10)} http://${address}:${PORT}`);
  });
  console.log('');
});