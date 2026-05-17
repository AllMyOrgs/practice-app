// Local dev server — mirrors Vercel serverless behaviour
const http = require('http');

const submitHandler = require('./api/submit');
const submissionsHandler = require('./api/submissions');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }

    // Shim Express-style helpers onto the raw Node res object
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    if (req.url === '/api/submit') return submitHandler(req, res);
    if (req.url === '/api/submissions') return submissionsHandler(req, res);

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

server.listen(PORT, () => {
  console.log(`Backend dev server running at http://localhost:${PORT}`);
});
