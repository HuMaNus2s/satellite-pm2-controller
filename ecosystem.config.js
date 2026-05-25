module.exports = {
  apps: [
    {
      name: 'gateway',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { PORT: process.env.APP_PORT }
    },
    {
      name: 'orientation',
      script: 'src/workers/orientation.js',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '150M',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT
      }
    }
  ]
};