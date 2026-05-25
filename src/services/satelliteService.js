const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { generatePhotoBuffer } = require('../utils/photoGenerator');
const redisService = require('./redisService');

const QUEUE_KEY = 'sat:taskQueue';

const state = {
  taskQueue: [],
  photos: [],
};

let isProcessing = false;

async function persistQueue() {
  try {
    await redisService.set(QUEUE_KEY, JSON.stringify(state.taskQueue));
  } catch (err) {
    console.error('Queue persist error:', err.message);
  }
}

async function loadQueue() {
  try {
    const raw = await redisService.get(QUEUE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      state.taskQueue = loaded.filter(t => t.status === 'pending' || t.status === 'processing');
      console.log(`Queue restored: ${state.taskQueue.length} pending tasks`);
    }
  } catch (err) {
    console.error('Queue load error:', err.message);
  }
}

async function processQueueLoop() {
  if (isProcessing) return;
  isProcessing = true;

  while (true) {
    const task = state.taskQueue.find(t => t.status === 'pending');

    if (!task) break;

    if (state.photos.length >= config.MAX_PHOTOS) {
      console.log('Storage full. Waiting for photo deletion...');
      await new Promise(res => setTimeout(res, 2000));
      continue;
    }

    task.status = 'processing';
    console.log(`Task ${task.id}: Generating photo...`);

    await new Promise(res => setTimeout(res, config.PHOTO_GEN_TIME));

    const buffer = await generatePhotoBuffer(task.id);
    const newPhoto = {
      id: uuidv4(),
      taskId: task.id,
      timestamp: new Date().toISOString(),
      buffer: buffer
    };

    state.photos.push(newPhoto);
    task.status = 'done';
    console.log(`Photo ${newPhoto.id} ready.`);
  }

  isProcessing = false;
}

module.exports = {
  loadQueue,
  persistQueue,

  startQueueProcessing: () => setInterval(processQueueLoop, 1000),

  getQueue: () => state.taskQueue,

  addTask: () => {
    const task = { id: uuidv4(), type: 'photo', status: 'pending', createdAt: new Date().toISOString() };
    state.taskQueue.push(task);
    persistQueue();
    return task;
  },

  getPhotos: () => state.photos.map(p => ({ id: p.id, timestamp: p.timestamp, taskId: p.taskId })),

  getPhotoBuffer: (id) => state.photos.find(p => p.id === id),

  deletePhoto: (id) => {
    const idx = state.photos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    state.photos.splice(idx, 1);
    return true;
  }
};