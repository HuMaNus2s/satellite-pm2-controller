const express = require('express');
const router = express.Router();
const satelliteService = require('../services/satelliteService');

router.get('/list', (req, res) => {
  res.json(satelliteService.getPhotos());
});

router.get('/get/:id', (req, res) => {
  const photo = satelliteService.getPhotoBuffer(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Content-Disposition', `attachment; filename="sat_${photo.id}.svg"`);

  res.send(photo.buffer);

  res.on('finish', () => {
    satelliteService.deletePhoto(req.params.id);
    console.log(`Photo ${req.params.id} deleted after download.`);
  });
});

router.delete('/get/:id', (req, res) => {
  const deleted = satelliteService.deletePhoto(req.params.id);
  if (deleted) res.json({ success: true });
  else res.status(404).json({ error: 'Photo not found' });
});

module.exports = router;