require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const prisma = require('./lib/db');
const redis = require('./lib/redis');
const { addJob } = require('./lib/jobs');

const port = process.env.APP_PORT || 3001;
console.log(`.env port ${port}`);
// Pomoćna funkcija za asinhrono čitanje tela zahteva
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
};

const server = http.createServer(async (req, res) => {
  // Postavljanje podrazumevanog zaglavlja za sve odgovore
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // 1. HOME RUTA
    if (req.url === '/' && req.method === 'GET') {
      const indexPath = path.join(__dirname, 'index.html');
      const html = await fs.promises.readFile(indexPath, 'utf8');

      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      return res.end(html);
    }
    
    // 2. HEALTH CHECK
    if (req.url === '/health' && req.method === 'GET') {
      const dbCheck = await prisma.$queryRaw`SELECT 1`;
      const redisCheck = await redis.ping(); // Vraća "PONG" ako radi
      
      res.writeHead(200);
      return res.end(JSON.stringify({
        status: 'healthy',
        database: dbCheck ? 'connected' : 'disconnected',
        redis: redisCheck === 'PONG' ? 'connected' : 'disconnected'
      }));
    }
    
    // 3. GET TASKS
    if (req.url === '/tasks' && req.method === 'GET') {
      const tasks = await prisma.task.findMany();
      res.writeHead(200);
      return res.end(JSON.stringify({ tasks }));
    }
    
    // 4. POST TASK (Sada potpuno bezbedan)
    if (req.url === '/tasks' && req.method === 'POST') {
      const body = await getRequestBody(req);
      
      if (!body) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Missing request body' }));
      }

      const { title } = JSON.parse(body);
      
      if (!title) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Title is required' }));
      }

      const task = await prisma.task.create({
        data: { title }
      });
      
      // Keš i pozadinski posao
      await redis.del('tasks:all');
      await addJob('process-task', { taskId: task.id });
      
      res.writeHead(201);
      return res.end(JSON.stringify({ task }));
    }
    
    // 5. CACHE EXAMPLE
    if (req.url === '/cache-example' && req.method === 'GET') {
      const cacheKey = 'example:data';
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        res.writeHead(200);
        return res.end(JSON.stringify({ 
          message: 'From cache',
          data: JSON.parse(cached)
        }));
      } else {
        const data = { value: Math.random(), timestamp: Date.now() };
        await redis.setEx(cacheKey, 3600, JSON.stringify(data));
        
        res.writeHead(200);
        return res.end(JSON.stringify({ 
          message: 'From computation, now cached',
          data 
        }));
      }
    }
    
    // 6. NOT FOUND
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    // SVE greške iz gornjeg koda (uključujući bazu, Redis i JSON parsiranje) sada završavaju ovde
    console.error('Request error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
