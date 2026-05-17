const { put, list } = require('@vercel/blob');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BLOB_NAME = 'submissions.json';
const LOCAL_FILE = path.join(os.tmpdir(), 'local-submissions.json');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readData() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_NAME });
    const blob = blobs.find(b => b.pathname === BLOB_NAME);
    if (!blob) return { submissions: [] };
    const res = await fetch(blob.url);
    return await res.json();
  }
  // Local dev fallback
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch { return { submissions: [] }; }
}

async function writeData(data) {
  const content = JSON.stringify(data, null, 2);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(BLOB_NAME, content, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } else {
    fs.writeFileSync(LOCAL_FILE, content);
  }
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, department, experience, skills, agreeToTerms } = req.body || {};
  if (!name || !email || !department || !experience)
    return res.status(400).json({ error: 'Missing required fields' });

  const data = await readData();

  const submission = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    department: String(department),
    experience: String(experience),
    skills: Array.isArray(skills) ? skills : [],
    agreeToTerms: Boolean(agreeToTerms),
    submittedAt: new Date().toISOString(),
  };

  data.submissions.push(submission);
  await writeData(data);

  return res.status(201).json({ success: true, submission });
};
