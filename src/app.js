const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// API routes
app.use('/api/healthcheck', require('./routes/health'));
app.use('/api/coords', require('./routes/coords'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api', require('./routes/processes'));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Static files (JS, CSS, assets) - don't auto-serve index
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
