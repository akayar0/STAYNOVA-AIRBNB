// server.js — StayNova HTTP Sunucu & 1. Hafta (Sprint 1) Modül Yönlendiricisi
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const { PORT } = require('./backend/config/constants');
const { initDb } = require('./backend/db');
const { handleUserRoutes } = require('./backend/modules/01-kullanici-yonetimi/userRoutes');
const { handleListingManageRoutes } = require('./backend/modules/02-ilan-yonetimi/listingManageRoutes');

initDb();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 15 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const sendJson = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
  };

  try {
    // 1. Hafta (Sprint 1) API Rotaları:
    // Modül 01: Kullanıcı Yönetimi, Kayıt, Giriş, JWT & RBAC (AIR-42)
    if (await handleUserRoutes(req, pathname, method, parseBody, sendJson)) return;

    // Modül 02: İlan CRUD İşlemleri, Görsel Yükleme ve Müsaitlik Takvimi (AIR-45)
    if (await handleListingManageRoutes(req, pathname, method, parseBody, sendJson)) return;

    if (pathname.startsWith('/api/')) {
      sendJson(404, { error: `İstenen API rotası bulunamadı: ${pathname}` });
      return;
    }

    // Statik Dosya Sunumu
    let targetFile = null;
    if (pathname === '/' || pathname === '/index.html') {
      targetFile = path.join(__dirname, 'index.html');
    } else {
      const cleanRel = pathname.replace(/^\/+/, '');
      const candidatePublic = path.join(__dirname, 'public', cleanRel);
      const candidateRoot = path.join(__dirname, cleanRel);

      if (fs.existsSync(candidatePublic) && fs.statSync(candidatePublic).isFile()) {
        targetFile = candidatePublic;
      } else if (fs.existsSync(candidateRoot) && fs.statSync(candidateRoot).isFile()) {
        targetFile = candidateRoot;
      }
    }

    if (!targetFile) {
      targetFile = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(targetFile);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    console.error('Sunucu Hatası:', err);
    sendJson(500, { error: 'Sunucu içi beklenmeyen bir hata oluştu.' });
  }
});

server.listen(PORT, () => {
  console.log(`\n===================================================================`);
  console.log(`🏨 StayNova — Otel & Ev Kiralama Platformu Sunucusu Çalışıyor!`);
  console.log(`🌐 Adres: http://localhost:${PORT}`);
  console.log(`===================================================================\n`);
});

