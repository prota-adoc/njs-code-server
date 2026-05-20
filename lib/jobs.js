const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

// Uzimamo URL iz Docker okruženja
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// BullMQ zahteva ioredis konekciju sa opcijom maxRetriesPerRequest postavljenom na null
const connection = new IORedis(redisUrl, { 
  maxRetriesPerRequest: null 
});

// 1. Kreiranje Queue-a (za dodavanje poslova)
const jobQueue = new Queue('jobs', { connection });

// 2. Kreiranje Worker-a (za obradu poslova u pozadini)
const worker = new Worker('jobs', async (job) => {
  console.log(`Processing job ${job.id} (Type: ${job.name}):`, job.data);
  
  // Ovde ide tvoja logika za obradu
  // Na primer, ovde možeš proveriti job.name ako imaš različite tipove poslova
  
  return { result: 'success', data: job.data };
}, { connection });

// Event handler-i za Worker-a u BullMQ verziji
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker global error:', err);
});

// Globalni handler za samu Queue instancu
jobQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

// 3. Pomoćna funkcija koja se poziva u index.js
const addJob = async (jobName, data, options = {}) => {
  // U BullMQ-u se naziv posla (jobName) šalje kao PRVI parametar
  return jobQueue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    ...options
  });
};

// Eksportujemo modul
module.exports = { jobQueue, addJob };
