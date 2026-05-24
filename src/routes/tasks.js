const express = require('express');
const router = express.Router();
const satelliteService = require('../services/satelliteService');

router.get('/list', (req, res) => res.json(satelliteService.getQueue()));

router.put('/photo', (req, res) => {
  const task = satelliteService.addTask();
  res.status(201).json(task);
});

module.exports = router;