const satelliteService = require('../../src/services/satelliteService');

jest.mock('../../src/services/redisService', () => ({
  get: jest.fn(),
  set: jest.fn(),
  getCoords: jest.fn(() => Promise.resolve({ coords: { x: 100, y: 100, z: 100 }, target: { x: 100, y: 100, z: 100 } })),
  updateCoords: jest.fn(),
}));

jest.mock('../../src/utils/photoGenerator', () => ({
  generatePhotoBuffer: jest.fn(() => Promise.resolve(Buffer.from('<svg></svg>'))),
}));

describe('satelliteService', () => {
  beforeEach(() => {
    while (satelliteService.getQueue().length) satelliteService.getQueue().pop();
    jest.clearAllMocks();
  });

  test('addTask creates a pending task', () => {
    const task = satelliteService.addTask();
    expect(task).toHaveProperty('id');
    expect(task.type).toBe('photo');
    expect(task.status).toBe('pending');
    expect(satelliteService.getQueue()).toHaveLength(1);
  });

  test('addTask persists via redisService', () => {
    satelliteService.addTask();
    const mockRedis = require('../../src/services/redisService');
    expect(mockRedis.set).toHaveBeenCalled();
  });

  test('persistQueue persists current queue', () => {
    satelliteService.addTask();
    satelliteService.addTask();
    satelliteService.persistQueue();
    const mockRedis = require('../../src/services/redisService');
    expect(mockRedis.set).toHaveBeenCalled();
  });

  test('getPhotos returns empty array initially', () => {
    expect(satelliteService.getPhotos()).toEqual([]);
  });

  test('getPhotoBuffer returns undefined for missing', () => {
    expect(satelliteService.getPhotoBuffer('nonexistent')).toBeUndefined();
  });

  test('deletePhoto returns false for missing', () => {
    expect(satelliteService.deletePhoto('nonexistent')).toBe(false);
  });

  test('loadQueue restores tasks from redis', async () => {
    const mockRedis = require('../../src/services/redisService');
    mockRedis.get.mockResolvedValueOnce(JSON.stringify([{ id: 'restored-id', type: 'photo', status: 'pending' }]));
    await satelliteService.loadQueue();
    const queue = satelliteService.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].id).toBe('restored-id');
  });

  test('loadQueue with null does nothing', async () => {
    const mockRedis = require('../../src/services/redisService');
    mockRedis.get.mockResolvedValueOnce(null);
    await satelliteService.loadQueue();
    expect(satelliteService.getQueue()).toHaveLength(0);
  });

  test('deletePhoto and getPhotoBuffer with real photo flow', async () => {
    satelliteService.addTask();
    satelliteService.addTask();

    const photosMeta = satelliteService.getPhotos();
    expect(photosMeta).toEqual([]);

    const delMissing = satelliteService.deletePhoto('bad-id');
    expect(delMissing).toBe(false);

    const bufMissing = satelliteService.getPhotoBuffer('bad-id');
    expect(bufMissing).toBeUndefined();
  });
  
  test('persistQueue called on addTask', () => {
    const mockRedis = require('../../src/services/redisService');
    satelliteService.addTask();
    satelliteService.addTask();
    expect(mockRedis.set).toHaveBeenCalledTimes(2);
  });

  test('persistQueue handles set error gracefully', async () => {
    const mockRedis = require('../../src/services/redisService');
    mockRedis.set.mockRejectedValueOnce(new Error('Redis error'));
    satelliteService.addTask();
    await new Promise(r => setTimeout(r, 50));
    expect(satelliteService.getQueue()).toHaveLength(1);
  });
});