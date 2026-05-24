module.exports = {
  generatePhotoBuffer: async (taskId) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU');
    const idShort = taskId.slice(0, 8).toUpperCase();

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="100%" height="100%" fill="#FFFFFF"/>

        <text x="400" y="300" font-family="monospace bolt" font-size="32" fill="#000000" text-anchor="middle">
          ${dateStr}
        </text>

        <text x="400" y="340" font-family="monospace" font-size="28" fill="#000000" text-anchor="middle">
          ${timeStr}
        </text>

        <text x="400" y="400" font-family="monospace" font-size="20" fill="#666666" text-anchor="middle">
          TASK: ${idShort}
        </text>
      </svg>
    `.trim();
    return Buffer.from(svg, 'utf-8');
  }
};