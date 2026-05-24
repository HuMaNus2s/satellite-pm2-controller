const request = require('supertest');

jest.mock('../../src/services/redisService', () => ({
  getCoords: jest.fn(() => Promise.reject(new Error('Redis down'))),
  get: jest.fn(),
  set: jest.fn(),
  updateCoords: jest.fn(),
}));

jest.mock('../../src/services/satelliteService', () => ({
  getQueue: jest.fn(() => []),
  addTask: jest.fn(() => ({ id: 'test' })),
  getPhotos: jest.fn(() => []),
  getPhotoBuffer: jest.fn(),
  deletePhoto: jest.fn(() => false),
  loadQueue: jest.fn(),
  persistQueue: jest.fn(),
}));

jest.mock('../../src/services/pm2Service', () => ({
  listProcesses: jest.fn(() => Promise.reject(new Error('PM2 not available'))),
  restart: jest.fn(() => Promise.reject(new Error('restart failed'))),
  reload: jest.fn(() => Promise.reject(new Error('reload failed'))),
  stop: jest.fn(() => Promise.reject(new Error('stop failed'))),
  getLogs: jest.fn(() => Promise.reject(new Error('logs error'))),
}));

describe('Error handlers', () => {
  let app;
  beforeAll(() => {
    app = require('../../src/app');
  });

  test('coords returns 500 on redis error', async () => {
    const res = await request(app).get('/api/coords');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to get coordinates from Redis');
  });

  test('processes returns 503 on pm2 error', async () => {
    const res = await request(app).get('/api/processes');
    expect(res.status).toBe(503);
  });

  test('restart returns 500 on pm2 error', async () => {
    const res = await request(app).post('/api/restart/gateway');
    expect(res.status).toBe(500);
  });

  test('reload returns 500 on pm2 error', async () => {
    const res = await request(app).post('/api/reload/gateway');
    expect(res.status).toBe(500);
  });

  test('stop returns 500 on pm2 error', async () => {
    const res = await request(app).post('/api/stop/gateway');
    expect(res.status).toBe(500);
  });

  test('logs returns 404 on pm2 error', async () => {
    const res = await request(app).get('/api/logs/gateway');
    expect(res.status).toBe(404);
  });
});