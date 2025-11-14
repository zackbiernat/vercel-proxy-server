// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [apiUrl, setApiUrl] = useState('https://api.gambly.com/');
  const [proxyResults, setProxyResults] = useState(null);
  const [directResults, setDirectResults] = useState(null);
  const [clientResults, setClientResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [iterations, setIterations] = useState(5);

  const runTests = async () => {
    setLoading(true);
    setProxyResults(null);
    setDirectResults(null);
    setClientResults(null);

    // Run multiple iterations for better average
    const proxyTimes = [];
    const directTimes = [];
    const clientTimes = [];

    for (let i = 0; i < iterations; i++) {
      // Test 1: Proxy route (simulates your current cookie-based setup)
      try {
        const proxyStart = performance.now();
        const proxyRes = await fetch(`/api/proxy-test?url=${encodeURIComponent(apiUrl)}`);
        const proxyEnd = performance.now();
        const proxyData = await proxyRes.json();
        
        proxyTimes.push({
          clientToVercel: proxyEnd - proxyStart,
          vercelToBackend: proxyData.timings?.backendTime || 0,
          total: proxyEnd - proxyStart,
          vercelRegion: proxyData.vercelRegion
        });
      } catch (error) {
        console.error('Proxy test failed:', error);
      }

      // Test 2: Direct from Vercel (what Vercel experiences calling your API)
      try {
        const directRes = await fetch(`/api/direct-test?url=${encodeURIComponent(apiUrl)}`);
        const directData = await directRes.json();
        
        directTimes.push({
          vercelToBackend: directData.timings?.responseTime || 0,
          vercelRegion: directData.vercelRegion
        });
      } catch (error) {
        console.error('Direct test failed:', error);
      }

      // Test 3: Client direct (your current setup, for comparison)
      try {
        const clientStart = performance.now();
        await fetch(apiUrl, { 
          mode: 'no-cors' // Won't get response, but measures connection time
        });
        const clientEnd = performance.now();
        
        clientTimes.push({
          total: clientEnd - clientStart
        });
      } catch (error) {
        // Expected to fail due to CORS, but we got timing
        const clientEnd = performance.now();
        clientTimes.push({
          total: clientEnd - clientStart
        });
      }

      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate averages
    const avgProxy = proxyTimes.reduce((acc, t) => ({
      clientToVercel: acc.clientToVercel + t.clientToVercel,
      vercelToBackend: acc.vercelToBackend + t.vercelToBackend,
      total: acc.total + t.total
    }), { clientToVercel: 0, vercelToBackend: 0, total: 0 });

    Object.keys(avgProxy).forEach(key => {
      avgProxy[key] = Math.round(avgProxy[key] / proxyTimes.length);
    });

    const avgDirect = Math.round(
      directTimes.reduce((acc, t) => acc + t.vercelToBackend, 0) / directTimes.length
    );

    const avgClient = Math.round(
      clientTimes.reduce((acc, t) => acc + t.total, 0) / clientTimes.length
    );

    setProxyResults({
      average: avgProxy,
      all: proxyTimes,
      vercelRegion: proxyTimes[0]?.vercelRegion
    });

    setDirectResults({
      average: avgDirect,
      all: directTimes,
      vercelRegion: directTimes[0]?.vercelRegion
    });

    setClientResults({
      average: avgClient,
      all: clientTimes
    });

    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Vercel ↔ AWS Latency Test</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This tool measures the latency you'll experience when proxying requests from Vercel to your AWS backend.
      </p>

      <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Your API URL:
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.gambly.com/endpoint"
            style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <small style={{ color: '#666' }}>
            Make sure this endpoint returns JSON and allows CORS or is public
          </small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Test iterations:
          </label>
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="20"
            style={{ width: '100px', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <small style={{ color: '#666', marginLeft: '10px' }}>
            More iterations = more accurate average
          </small>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Running Tests...' : 'Run Latency Tests'}
        </button>
      </div>

      {(proxyResults || directResults || clientResults) && (
        <div>
          <h2>Results</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Vercel Region: <strong>{proxyResults?.vercelRegion || 'Unknown'}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Current Setup (Client Direct) */}
            <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
              <h3 style={{ marginTop: 0 }}>Current Setup (AWS K8s)</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                Browser → CloudFront → AWS Backend
              </p>
              {clientResults && (
                <>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>
                    ~{clientResults.average}ms
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Total round trip time
                  </div>
                </>
              )}
            </div>

            {/* Vercel Proxy Setup */}
            <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800' }}>
              <h3 style={{ marginTop: 0 }}>With Vercel Proxy</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                Browser → Vercel → CloudFront → AWS
              </p>
              {proxyResults && (
                <>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100', marginBottom: '10px' }}>
                    ~{proxyResults.average.total}ms
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    Total round trip time
                  </div>
                  <div style={{ fontSize: '14px', padding: '10px', background: 'white', borderRadius: '4px' }}>
                    <div>Client → Vercel: {proxyResults.average.clientToVercel}ms</div>
                    <div>Vercel → Backend: {proxyResults.average.vercelToBackend}ms</div>
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px', background: '#ffebee', borderRadius: '4px' }}>
                    <strong>Added latency: ~{proxyResults.average.total - clientResults.average}ms</strong>
                  </div>
                </>
              )}
            </div>

            {/* Vercel Direct (Server perspective) */}
            <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '2px solid #2196f3' }}>
              <h3 style={{ marginTop: 0 }}>Vercel Server → Backend</h3>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                What Vercel experiences calling your API
              </p>
              {directResults && (
                <>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1565c0', marginBottom: '10px' }}>
                    ~{directResults.average}ms
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Server-side API call time
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Detailed breakdown */}
          {proxyResults && (
            <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Analysis</h3>
              <ul style={{ lineHeight: '1.8' }}>
                <li>
                  <strong>Current latency:</strong> {clientResults.average}ms per API call
                </li>
                <li>
                  <strong>With Vercel proxy:</strong> {proxyResults.average.total}ms per API call
                </li>
                <li>
                  <strong>Added overhead:</strong> ~{proxyResults.average.total - clientResults.average}ms ({Math.round(((proxyResults.average.total - clientResults.average) / clientResults.average) * 100)}% increase)
                </li>
                <li style={{ marginTop: '10px', color: '#d32f2f' }}>
                  ⚠️ <strong>Impact:</strong> If a page makes 10 proxied API calls, expect an additional ~{(proxyResults.average.total - clientResults.average) * 10}ms total delay
                </li>
              </ul>

              <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                <strong>💡 Recommendation:</strong>
                <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                  <li>If added latency is acceptable: Proceed with Vercel migration</li>
                  <li>If too slow: Consider token-based auth to eliminate proxy routes</li>
                  <li>Hybrid: Keep only auth routes proxied, use tokens for data fetching</li>
                </ul>
              </div>
            </div>
          )}

          {/* Raw data */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Raw Test Data</summary>
            <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify({ proxyResults, directResults, clientResults }, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#e8eaf6', borderRadius: '8px' }}>
        <h3>How to interpret these results:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li><strong>Current Setup:</strong> Your existing latency with frontend and backend both in AWS</li>
          <li><strong>With Vercel Proxy:</strong> What you'll experience if you migrate with cookie-based auth (using proxy routes)</li>
          <li><strong>Vercel Server → Backend:</strong> The raw time it takes for Vercel's servers to call your API</li>
        </ol>
        <p style={{ marginTop: '15px', color: '#666' }}>
          The "Added overhead" shows the performance cost of moving to Vercel while keeping your proxy-based architecture.
          Multiply this by the number of API calls per page to estimate total impact.
        </p>
      </div>
    </div>
  );
}
