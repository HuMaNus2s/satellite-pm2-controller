const path = require('path');
const os = require('os');

module.exports = {
  PORT: process.env.APP_PORT || 3000,
  REDIS_URL: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,

  THRESHOLD: process.env.THRESHOLD || 5,
  MAX_PHOTOS: process.env.MAX_PHOTOS || 5,
  PHOTO_GEN_TIME: process.env.PHOTO_GEN_TIME || 30000,

  PM2_LOGS_DIR: path.join(os.homedir(), '.pm2', 'logs')
};
