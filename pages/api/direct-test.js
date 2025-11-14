// pages/api/direct-test.js
export default async function handler(req, res) {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const timings = {
    requestReceived: Date.now(),
    responseTime: null
  };

  try {
    // This simulates timing metadata that would normally be on the client
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Direct-Test',
        'Accept': '*/*'
      }
    });

    const data = await response.json();
    timings.responseTime = Date.now() - timings.requestReceived;

    res.status(response.status).json({
      success: true,
      timings: timings,
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      note: 'This measures Vercel edge → Backend, similar to what proxy would experience',
      data: data
    });

  } catch (error) {
    timings.responseTime = Date.now() - timings.requestReceived;

    res.status(500).json({
      success: false,
      error: error.message,
      timings: timings,
      vercelRegion: process.env.VERCEL_REGION || 'unknown'
    });
  }
}
