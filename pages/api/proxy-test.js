// pages/api/proxy-test.js
export default async function handler(req, res) {
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const timings = {
    vercelReceived: Date.now(),
    vercelToBackendStart: null,
    backendResponseReceived: null,
    vercelResponseSent: null,
    totalProxyTime: null,
    backendTime: null
  };

  try {
    // Start timing the backend call
    timings.vercelToBackendStart = Date.now();
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // Forward relevant headers (excluding host, connection, etc.)
        'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy-Test',
        'Accept': req.headers['accept'] || '*/*',
        // Forward cookies if present
        ...(req.headers.cookie && { 'Cookie': req.headers.cookie })
      }
    });

    timings.backendResponseReceived = Date.now();
    timings.backendTime = timings.backendResponseReceived - timings.vercelToBackendStart;

    const data = await response.json();
    
    timings.vercelResponseSent = Date.now();
    timings.totalProxyTime = timings.vercelResponseSent - timings.vercelReceived;

    // Return the data along with timing information
    res.status(response.status).json({
      success: true,
      timings: {
        ...timings,
        vercelProcessingTime: timings.totalProxyTime - timings.backendTime,
        breakdown: {
          vercelReceiveToFetch: timings.vercelToBackendStart - timings.vercelReceived,
          fetchToBackend: timings.backendTime,
          backendToVercelResponse: timings.vercelResponseSent - timings.backendResponseReceived
        }
      },
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      data: data
    });

  } catch (error) {
    timings.vercelResponseSent = Date.now();
    timings.totalProxyTime = timings.vercelResponseSent - timings.vercelReceived;

    res.status(500).json({
      success: false,
      error: error.message,
      timings: timings,
      vercelRegion: process.env.VERCEL_REGION || 'unknown'
    });
  }
}
