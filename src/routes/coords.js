const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');
const config = require('../config');

router.get('/', async (req, res) => {
  try {
    const { coords, target } = await redisService.getCoords();

    const delta = {
      dx: +(coords.x - target.x).toFixed(2),
      dy: +(coords.y - target.y).toFixed(2),
      dz: +(coords.z - target.z).toFixed(2),
    };

    const isCritical = Math.abs(delta.dx) > config.THRESHOLD 
    || Math.abs(delta.dy) > config.THRESHOLD 
    || Math.abs(delta.dz) > config.THRESHOLD;

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

module.exports = router;