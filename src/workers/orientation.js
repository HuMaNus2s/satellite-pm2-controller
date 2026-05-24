const redisService = require('../services/redisService');
const config = require('../config');

process.on('SIGINT', () => {
  console.log('[Orientation] Shutting down...');
  process.exit(0);
});

console.log(`[Orientation ${process.env.NODE_APP_INSTANCE}] started`);

setInterval(async () => {
  try {
    const { coords, target } = await redisService.getCoords();

    const correct = (curr, tgt) => curr + (tgt - curr) * 0.15;
    const nx = correct(coords.x, target.x);
    const ny = correct(coords.y, target.y);
    const nz = correct(coords.z, target.z);

    await redisService.updateCoords(nx, ny, nz);

    const dx = Math.abs(nx - target.x);
    if (dx > config.THRESHOLD) {
      console.log(`Deviation high (${dx.toFixed(1)}), correcting...`);
    }

  } catch (err) {
    console.error('Orientation loop error:', err.message);
  }
}, 500);