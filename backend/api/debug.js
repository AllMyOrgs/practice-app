const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  const info = {
    hasToken,
    tokenPreview: hasToken
      ? process.env.BLOB_READ_WRITE_TOKEN.slice(0, 12) + '...'
      : 'NOT SET — blob writes are going to /tmp (lost on cold start)',
    vercelEnv: process.env.VERCEL_ENV || 'not on vercel',
    nodeVersion: process.version,
  };

  if (hasToken) {
    try {
      const { blobs } = await list();
      info.blobStoreReachable = true;
      info.existingBlobs = blobs.map(b => ({ name: b.pathname, size: b.size, url: b.url }));
    } catch (err) {
      info.blobStoreReachable = false;
      info.blobError = err.message;
    }
  }

  res.status(200).json(info);
};
