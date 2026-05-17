const fs = require('fs');
const path = require('path');

// Vercel serverless functions write to /tmp (ephemeral, per-instance).
// For durable storage swap in Vercel KV / MongoDB / Postgres.
const TMP_FILE = '/tmp/submissions.json';
const SEED_FILE = path.join(process.cwd(), 'data', 'submissions.json');

function readData() {
  try {
    if (fs.existsSync(TMP_FILE)) return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
  } catch (_) {}
  try {
    if (fs.existsSync(SEED_FILE)) return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  } catch (_) {}
  return { submissions: [] };
}

function writeData(data) {
  fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, department, experience, skills, agreeToTerms } = req.body || {};
  if (!name || !email || !department || !experience)
    return res.status(400).json({ error: 'Missing required fields' });

  const data = readData();
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
  writeData(data);
  return res.status(201).json({ success: true, submission });
};
