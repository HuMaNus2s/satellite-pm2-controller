const Redis = require('ioredis');
const config = require('../config');

let redis = null;
let useRedis = true;

const memoryStore = {
  'sat:x': 100, 'sat:y': 100, 'sat:z': 100,
  'sat:tx': 100, 'sat:ty': 100, 'sat:tz': 100
};

async function init() {
  try {
    redis = new Redis(config.REDIS_URL);
    await redis.ping();
    console.log('Redis connected');

    redis.on('error', (err) => {
      console.warn('Redis disconnected, switching to in-memory:', err.message);
      useRedis = false;
    });
  } catch (err) {
    console.warn('Redis unavailable, using in-memory mode (coordinates not synced across workers)');
    useRedis = false;
  }
}

async function get(key) {
  if (useRedis && redis) return await redis.get(key);
  return memoryStore[key] !== undefined ? String(memoryStore[key]) : null;
}

async function set(key, value) {
  if (useRedis && redis) return await redis.set(key, value);
  memoryStore[key] = value;
}

async function mget(...keys) {
  if (useRedis && redis) return await redis.mget(...keys);
  return keys.map(k => memoryStore[k] !== undefined ? String(memoryStore[k]) : null);
}

async function mset(...args) {
  if (useRedis && redis) return await redis.mset(...args);
  for (let i = 0; i < args.length; i += 2) {
    memoryStore[args[i]] = args[i + 1];
  }
}

module.exports = {
  init,
  get,
  set,
  mget,
  mset,
  async getCoords() {
    const [x, y, z, tx, ty, tz] = await mget('sat:x', 'sat:y', 'sat:z', 'sat:tx', 'sat:ty', 'sat:tz');
    return {
      coords: { x: parseFloat(x) || 100, y: parseFloat(y) || 100, z: parseFloat(z) || 100 },
      target: { x: parseFloat(tx) || 100, y: parseFloat(ty) || 100, z: parseFloat(tz) || 100 }
    };
  },
  async updateCoords(x, y, z) {
    await mset('sat:x', x, 'sat:y', y, 'sat:z', z);
  }
};