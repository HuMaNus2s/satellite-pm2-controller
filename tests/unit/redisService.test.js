const redisService = require('../../src/services/redisService');

describe('redisService (in-memory mode)', () => {
  beforeAll(async () => {
    await redisService.init();
  });

  beforeEach(async () => {
    await redisService.set('sat:x', '100');
    await redisService.set('sat:y', '100');
    await redisService.set('sat:z', '100');
    await redisService.set('sat:tx', '100');
    await redisService.set('sat:ty', '100');
    await redisService.set('sat:tz', '100');
  });

  test('getCoords returns initial 100,100,100', async () => {
    const { coords, target } = await redisService.getCoords();
    expect(coords).toEqual({ x: 100, y: 100, z: 100 });
    expect(target).toEqual({ x: 100, y: 100, z: 100 });
  });

  test('get and set basic operations', async () => {
    await redisService.set('test:key', 'hello');
    const val = await redisService.get('test:key');
    expect(val).toBe('hello');
  });

  test('get returns null for missing key', async () => {
    const val = await redisService.get('nonexistent');
    expect(val).toBeNull();
  });

  test('mget returns array of values', async () => {
    await redisService.set('a', '1');
    await redisService.set('b', '2');
    const vals = await redisService.mget('a', 'b', 'c');
    expect(vals).toEqual(['1', '2', null]);
  });

  test('mset stores multiple keys', async () => {
    await redisService.mset('k1', 'v1', 'k2', 'v2');
    expect(await redisService.get('k1')).toBe('v1');
    expect(await redisService.get('k2')).toBe('v2');
  });

  test('updateCoords changes stored values', async () => {
    await redisService.updateCoords(95, 105, 110);
    const { coords } = await redisService.getCoords();
    expect(coords.x).toBe(95);
    expect(coords.y).toBe(105);
    expect(coords.z).toBe(110);
  });
});