const app = require('./src/app');
const pm2Service = require('./src/services/pm2Service');
const satelliteService = require('./src/services/satelliteService');
const redisService = require('./src/services/redisService');
const config = require('./src/config');

function startDriftSimulator() {
  setInterval(async () => {
    try {
      const { coords } = await redisService.getCoords();
      const drift = (val) => val + (Math.random() - 0.5) * 1.5;
      await redisService.updateCoords(drift(coords.x), drift(coords.y), drift(coords.z));
    } catch (err) {
      console.error('Drift simulator error:', err.message);
    }
  }, 500);
  console.log('Drift simulator started');
}

async function start() {
  await redisService.init();

  try {
    await pm2Service.connect();
    console.log('PM2 API available');
  } catch (e) {
    console.warn('PM2 unavailable (running in gateway mode)');
  }

  await satelliteService.loadQueue();
  satelliteService.startQueueProcessing();
  console.log('Photo processing system started');

  startDriftSimulator();

  app.listen(config.PORT, () => {
    console.log(`Gateway running on http://localhost:${config.PORT}`);
  });
}

start().catch(console.error);