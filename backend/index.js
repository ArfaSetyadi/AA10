const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
// Get all active notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get trash notes
app.get('/api/notes/trash', async (req, res) => {
  try {
    const notes = await Note.find({ isDeleted: true }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a note
app.post('/api/notes', async (req, res) => {
  const note = new Note({
    title: req.body.title,
    content: req.body.content
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Move note to trash
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { isDeleted: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note moved to trash' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Restore note from trash
app.put('/api/notes/:id/restore', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { isDeleted: false });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Permanently delete note
app.delete('/api/notes/:id/permanent', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simplenotes';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
