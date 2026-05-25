const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Satellite',
    endpoints: [
      'GET  /api/healthcheck',
      'GET  /api/coords',
      'GET  /api/photos/list',
      'GET  /api/photos/get/:id',
      'DELETE /api/photos/get/:id',
      'GET  /api/tasks/list',
      'PUT  /api/tasks/photo',
      'GET  /api/processes',
      'POST /api/restart/:name',
      'POST /api/reload/:name',
      'GET  /api/logs/:name'
    ]
  });
});

app.use('/api/healthcheck', require('./routes/health'));
app.use('/api/coords', require('./routes/coords'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api', require('./routes/processes'));

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;