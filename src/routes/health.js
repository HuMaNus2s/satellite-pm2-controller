const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'gateway', uptime: process.uptime() });
});

module.exports = router;