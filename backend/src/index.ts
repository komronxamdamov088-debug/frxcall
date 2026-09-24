import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { env } from './config/env.js';
import { app } from './app.js';

// Lokal ishga tushirish. Vercel'da esa `/api/index.ts` shu `app`ni serverless funksiya sifatida ishlatadi.
const webDist = path.resolve(__dirname, '../../frontend/dist');

const server = express();
server.use(app);
if (fs.existsSync(webDist)) {
  server.use(express.static(webDist));
  server.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(webDist, 'index.html')));
}

server.listen(env.port, () => {
  console.log(`FRONTIX Phone API: http://localhost:${env.port}`);
});
