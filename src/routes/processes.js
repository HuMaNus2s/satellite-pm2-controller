const express = require('express');
const router = express.Router();
const pm2Service = require('../services/pm2Service');

router.get('/processes', async (req, res) => {
  try {
    const processes = await pm2Service.listProcesses();
    res.json(processes);
  } catch (err) {
    console.error('Failed to list processes:', err.message);
    res.status(503).json({ error: 'PM2 daemon not available', details: err.message });
  }
});

router.get('/logs/:name', async (req, res) => {
  try {
    const logs = await pm2Service.getLogs(req.params.name);
    res.json({ name: req.params.name, logs });
  } catch (err) {
    console.error(`Failed to read logs for ${req.params.name}:`, err.message);
    res.status(404).json({ error: 'Logs not found or unreadable', details: err.message });
  }
});

router.post('/restart/:name', async (req, res) => {
  try {
    await pm2Service.restart(req.params.name);
    console.log(`Hard restart triggered for ${req.params.name}`);
    res.json({ success: true, message: `Restart initiated for ${req.params.name}` });
  } catch (err) {
    console.error(`Restart failed for ${req.params.name}:`, err.message);
    res.status(500).json({ error: 'Restart failed', details: err.message });
  }
});

router.post('/reload/:name', async (req, res) => {
  try {
    await pm2Service.reload(req.params.name);
    console.log(`Zero-downtime reload triggered for ${req.params.name}`);
    res.json({ success: true, message: `Reload initiated for ${req.params.name}` });
  } catch (err) {
    console.error(`Reload failed for ${req.params.name}:`, err.message);
    res.status(500).json({ error: 'Reload failed', details: err.message });
  }
});

router.post('/stop/:name', async (req, res) => {
  try {
    await pm2Service.stop(req.params.name);
    console.log(`Stop triggered for ${req.params.name}`);
    res.json({ success: true, message: `Stop initiated for ${req.params.name}` });
  } catch (err) {
    console.error(`Stop failed for ${req.params.name}:`, err.message);
    res.status(500).json({ error: 'Stop failed', details: err.message });
  }
});

module.exports = router;