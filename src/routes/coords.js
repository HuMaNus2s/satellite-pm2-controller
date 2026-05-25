const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');
const satelliteService = require('../services/satelliteService');
const config = require('../config');

router.get('/', async (req, res) => {
  try {
    const { coords, target } = await redisService.getCoords();

    const delta = {
      dx: +(coords.x - target.x).toFixed(2),
      dy: +(coords.y - target.y).toFixed(2),
      dz: +(coords.z - target.z).toFixed(2),
    };

    const isCritical = Math.abs(delta.dx) > config.THRESHOLD ||
                       Math.abs(delta.dy) > config.THRESHOLD ||
                       Math.abs(delta.dz) > config.THRESHOLD;

    res.json({
      coords,
      target,
      delta,
      isCritical,
      threshold: config.THRESHOLD
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get coordinates from Redis' });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { x, y, z } = req.body;
    if (x == null || y == null || z == null) {
      return res.status(400).json({ error: 'x, y, z required' });
    }
    await redisService.updateCoords(x, y, z);

    const task = { id: uuidv4(), type: 'correction', status: 'pending', createdAt: new Date().toISOString(), axis: 'manual' };
    satelliteService.getQueue().push(task);
    satelliteService.persistQueue();

    res.json({ success: true, coords: { x, y, z }, taskId: task.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coordinates' });
  }
});

module.exports = router;
