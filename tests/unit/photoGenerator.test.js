const photoGenerator = require('../../src/utils/photoGenerator');

describe('photoGenerator', () => {
  test('generatePhotoBuffer returns a Buffer', async () => {
    const buffer = await photoGenerator.generatePhotoBuffer('test-task-id-123');
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  test('generatePhotoBuffer contains SVG content', async () => {
    const buffer = await photoGenerator.generatePhotoBuffer('test-id');
    const content = buffer.toString('utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
    expect(content).toContain('test-id'.toUpperCase().slice(0, 8));
  });

  test('generatePhotoBuffer returns valid XML', async () => {
    const buffer = await photoGenerator.generatePhotoBuffer('abc');
    const content = buffer.toString('utf-8');
    expect(content).toMatch(/<svg[\s\S]*<\/svg>/);
  });
});