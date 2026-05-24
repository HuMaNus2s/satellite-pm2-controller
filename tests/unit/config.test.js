const config = require('../../src/config');

describe('config', () => {
  test('has default PORT 3000', () => {
    expect(config.PORT).toBe(3000);
  });

  test('has THRESHOLD of 5', () => {
    expect(config.THRESHOLD).toBe(5);
  });

  test('has MAX_PHOTOS of 5', () => {
    expect(config.MAX_PHOTOS).toBe(5);
  });

  test('has PHOTO_GEN_TIME of 30000', () => {
    expect(config.PHOTO_GEN_TIME).toBe(30000);
  });

  test('REDIS_URL includes localhost', () => {
    expect(config.REDIS_URL).toContain('localhost');
  });

  test('PM2_LOGS_DIR includes .pm2', () => {
    expect(config.PM2_LOGS_DIR).toContain('.pm2');
  });
});