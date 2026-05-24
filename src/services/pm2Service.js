const pm2 = require('pm2');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

let client = null;

module.exports = {
  async connect() {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err);
        client = pm2;
        resolve();
      });
    });
  },

  async listProcesses() {
    return new Promise((resolve, reject) => {
      client.list((err, list) => {
        if (err) return reject(err);
        resolve(list.map(p => ({
          name: p.name,
          id: p.pm_id,
          status: p.pm2_env.status,
          restarts: p.pm2_env.restart_time,
          cpu: p.monit.cpu,
          memory: p.monit.memory,
          uptime: p.pm2_env.pm_uptime ? Math.floor((Date.now() - p.pm2_env.pm_uptime) / 1000) : 0
        })));
      });
    });
  },

  async restart(name) {
    return new Promise((resolve, reject) => {
      client.restart(name, (err) => err ? reject(err) : resolve());
    });
  },

  async reload(name) {
    return new Promise((resolve, reject) => {
      client.reload(name, (err) => err ? reject(err) : resolve());
    });
  },

  async stop(name) {
    return new Promise((resolve, reject) => {
      client.stop(name, (err) => err ? reject(err) : resolve());
    });
  },

  async getLogs(name) {
    const logFile = path.join(config.PM2_LOGS_DIR, `${name}-out.log`);
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      return content.split('\n').filter(l => l.trim()).slice(-30);
    } catch {
      return ['Logs unavailable or process not running.'];
    }
  }
};