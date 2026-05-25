const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/services/redisService', () => ({
  getCoords: jest.fn(() => Promise.resolve({
    coords: { x: 95, y: 102, z: 100 },
    target: { x: 100, y: 100, z: 100 }
  })),
  get: jest.fn(),
  set: jest.fn(),
  updateCoords: jest.fn(),
}));

jest.mock('../../src/services/satelliteService', () => ({
  getQueue: jest.fn(() => []),
  addTask: jest.fn(() => ({ id: 'task-1', type: 'photo', status: 'pending' })),
  getPhotos: jest.fn(() => [
    { id: 'photo-1', timestamp: '2024-01-01T00:00:00.000Z', taskId: 'task-1' }
  ]),
  getPhotoBuffer: jest.fn((id) => {
    if (id === 'photo-1') {
      return { id: 'photo-1', buffer: Buffer.from('<svg></svg>'), taskId: 'task-1' };
    }
    return undefined;
  }),
  deletePhoto: jest.fn((id) => id === 'photo-1'),
  loadQueue: jest.fn(),
  persistQueue: jest.fn(),
}));

jest.mock('../../src/services/pm2Service', () => ({
  listProcesses: jest.fn(() => Promise.resolve([
    { name: 'gateway', id: 0, status: 'online', restarts: 0, cpu: 0, memory: 50000000, uptime: 3600 },
    { name: 'orientation-0', id: 1, status: 'online', restarts: 2, cpu: 5, memory: 30000000, uptime: 1800 },
  ])),
  restart: jest.fn(() => Promise.resolve()),
  reload: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  getLogs: jest.fn((name) => {
    if (name === 'gateway') return Promise.resolve(['log line 1', 'log line 2']);
    return Promise.reject(new Error('not found'));
  }),
}));

describe('API Routes Integration', () => {
  test('GET / returns index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });

  test('GET /api/healthcheck returns ok', async () => {
    const res = await request(app).get('/api/healthcheck');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/coords returns satellite coordinates', async () => {
    const res = await request(app).get('/api/coords');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('coords');
    expect(res.body).toHaveProperty('delta');
    expect(res.body).toHaveProperty('isCritical');
    expect(typeof res.body.isCritical).toBe('boolean');
  });

  test('GET /api/coords detects critical deviation', async () => {
    const redisService = require('../../src/services/redisService');
    redisService.getCoords.mockResolvedValueOnce({
      coords: { x: 80, y: 120, z: 50 },
      target: { x: 100, y: 100, z: 100 }
    });
    const res = await request(app).get('/api/coords');
    expect(res.status).toBe(200);
    expect(res.body.isCritical).toBe(true);
  });

  test('GET /api/photos/list returns photo list', async () => {
    const res = await request(app).get('/api/photos/list');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0].id).toBe('photo-1');
  });

  test('GET /api/photos/get/:id returns photo buffer', async () => {
    const res = await request(app).get('/api/photos/get/photo-1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/svg+xml');
  });

  test('GET /api/photos/get/:id returns 404 for missing', async () => {
    const res = await request(app).get('/api/photos/get/missing');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Photo not found');
  });

  test('DELETE /api/photos/get/:id deletes photo', async () => {
    const res = await request(app).delete('/api/photos/get/photo-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /api/photos/get/:id returns 404 for missing', async () => {
    const res = await request(app).delete('/api/photos/get/missing');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Photo not found');
  });

  test('GET /api/tasks/list returns empty queue', async () => {
    const res = await request(app).get('/api/tasks/list');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('PUT /api/tasks/photo adds task', async () => {
    const res = await request(app).put('/api/tasks/photo');
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  test('GET /api/processes returns process list', async () => {
    const res = await request(app).get('/api/processes');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/restart/:name restarts process', async () => {
    const res = await request(app).post('/api/restart/gateway');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/reload/:name reloads process', async () => {
    const res = await request(app).post('/api/reload/gateway');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/stop/:name stops process', async () => {
    const res = await request(app).post('/api/stop/gateway');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/logs/:name returns logs', async () => {
    const res = await request(app).get('/api/logs/gateway');
    expect(res.status).toBe(200);
    expect(res.body.logs).toBeInstanceOf(Array);
  });

  test('GET /api/logs/:name returns 404 for missing', async () => {
    const res = await request(app).get('/api/logs/nonexistent');
    expect(res.status).toBe(404);
  });
});