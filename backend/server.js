require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Config
app.use(cors());
app.use(express.json());

// SỬA 2 DÒNG NÀY ←←←←←←←←←←←←←←←←←←←←←
app.use(express.static(path.join(__dirname, 'public'))); // ← DÒNG 1

// === Cloudinary an toàn ===
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_URL.split('@')[1],
    api_key: process.env.CLOUDINARY_URL.split(':')[2].split('@')[0],
    api_secret: process.env.CLOUDINARY_URL.split(':')[1].split('@')[0],
  });
}

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const upload = multer({ storage: multer.memoryStorage() });

pool.query(`
  CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    email TEXT,
    fanpage TEXT,
    avatar TEXT
  )
`).catch(err => console.error('Error creating table:', err));

// ==================== API ROUTES ====================
app.get('/api/organizations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizations ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/organizations', upload.single('avatar'), async (req, res) => {
  const { name, description, email, fanpage } = req.body;
  let avatarUrl = 'https://via.placeholder.com/70x70/007bff/ffffff?text=' + encodeURIComponent(name);

  try {
    if (req.file) {
      if (process.env.CLOUDINARY_URL) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'event-portal' },
            (error, result) => error ? reject(error) : resolve(result)
          );
          stream.end(req.file.buffer);
        });
        avatarUrl = result.secure_url;
      } else {
        avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const query = `INSERT INTO organizations (name, description, email, fanpage, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [name, description, email, fanpage, avatarUrl];
    const dbRes = await pool.query(query, values);
    res.json(dbRes.rows[0]);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.put('/api/organizations/:id', upload.single('avatar'), async (req, res) => {
  const { id } = req.params;
  const { name, description, email, fanpage, currentAvatar } = req.body;
  try {
    let avatarUrl = currentAvatar || 'https://via.placeholder.com/70x70';
    if (req.file) {
      if (process.env.CLOUDINARY_URL) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'event-portal' },
            (error, result) => error ? reject(error) : resolve(result)
          );
          stream.end(req.file.buffer);
        });
        avatarUrl = result.secure_url;
      } else {
        avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const query = `UPDATE organizations SET name=$1, description=$2, email=$3, fanpage=$4, avatar=$5 WHERE id=$6 RETURNING *`;
    const values = [name, description, email, fanpage, avatarUrl, id];
    const dbRes = await pool.query(query, values);
    if (dbRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(dbRes.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/organizations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// SỬA DÒNG NÀY ←←←←←←←←←←←←←←←←←←←←←
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tochuc.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy mượt mà trên port ${PORT} 🎉`);
});