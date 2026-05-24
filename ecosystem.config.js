module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: 3000 }
    },
    {
      name: 'orientation',
      script: 'src/workers/orientation.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '150M',
      env: {
        NODE_ENV: 'production',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379
      }
    }
  ]
};