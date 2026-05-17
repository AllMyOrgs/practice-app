const { list } = require('@vercel/blob');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BLOB_NAME = 'submissions.json';
const LOCAL_FILE = path.join(os.tmpdir(), 'local-submissions.json');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readData() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_NAME });
      const blob = blobs.find(b => b.pathname === BLOB_NAME);
      if (!blob) return { submissions: [] };
      const res = await fetch(blob.downloadUrl);
      return await res.json();
    } catch { return { submissions: [] }; }
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch { return { submissions: [] }; }
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = await readData();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
