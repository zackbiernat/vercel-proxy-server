# Vercel ↔ AWS Latency Test App

This Next.js app helps you measure the real-world latency of proxying API requests from Vercel to your AWS backend.

## What it tests

1. **Current Setup**: Direct browser calls to your API (simulates your current AWS K8s setup)
2. **Vercel Proxy**: Full round-trip through Vercel's proxy route (what you'd experience with cookie-based auth)
3. **Vercel Server → Backend**: Raw server-to-server latency (what Vercel experiences)

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard
1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to this directory
cd vercel-latency-test

# Deploy
vercel
```

## How to Use

1. Once deployed, open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Enter your API endpoint (e.g., `https://api.gambly.com/health` or any endpoint that returns JSON)
3. Choose number of test iterations (5-10 recommended for good averages)
4. Click "Run Latency Tests"
5. Review the results:
   - **Current Setup**: Your baseline latency
   - **With Vercel Proxy**: What you'd experience after migration
   - **Added overhead**: The performance cost of the proxy

## Important Notes

### API Endpoint Requirements
The test endpoint should:
- Return valid JSON
- Be publicly accessible (or allow CORS)
- Respond quickly (don't use slow endpoints)
- Preferably be a lightweight endpoint like `/health` or `/ping`

### CORS Considerations
The "Current Setup" test uses `mode: 'no-cors'` which means it won't read the response body, but it still measures connection time accurately for comparison purposes.

### What the Results Mean

If the added overhead is:
- **< 50ms**: Probably acceptable for most use cases
- **50-150ms**: Noticeable but may be acceptable depending on your app
- **> 150ms**: Consider alternatives like token-based auth to eliminate proxies

**Remember**: Multiply the added overhead by the number of API calls per page to estimate total impact.

Example: If added overhead is 100ms and a typical page makes 8 API calls through the proxy, you're adding ~800ms to page load time.

## Interpreting Results by Use Case

### Gambling/Gaming Apps (Your Case)
- Real-time updates and quick interactions are critical
- Aim for < 100ms added latency
- Consider token-based auth if proxy adds > 100ms

### E-commerce
- Checkout flows are latency-sensitive
- Product browsing can tolerate more latency
- Mix of proxy (auth) and direct (data) might work well

### Content/Media Apps
- Can typically tolerate higher latency
- Focus on CDN for static assets
- API latency less critical

## Next Steps Based on Results

### If latency is acceptable:
1. ✅ Proceed with Vercel migration
2. Keep your proxy-based cookie authentication
3. Monitor real-world performance after migration

### If latency is too high:
1. Consider migrating to token-based authentication (JWT)
   - Eliminates need for proxy routes
   - Allows direct browser → CloudFront calls
   - Requires backend changes to support tokens

2. Hybrid approach:
   - Keep auth endpoints proxied (login, logout) - used infrequently
   - Use tokens for all data fetching - direct calls
   - Best of both worlds

3. Stay on AWS:
   - Use AWS Amplify or Lambda for Next.js
   - Keep everything in same region
   - Sacrifice Vercel DX for performance

## Troubleshooting

### "Missing url parameter" error
Make sure you've entered a complete URL including `https://`

### CORS errors in console
These are expected for the "Current Setup" test. The timing data is still captured and valid.

### Timeout or 500 errors
- Check that your API endpoint is publicly accessible
- Verify the endpoint returns valid JSON
- Try a simpler endpoint like `/health`

## Local Testing

```bash
npm install
npm run dev
```

Open http://localhost:3000

Note: Local testing won't give accurate Vercel region data, but you can still test the proxy logic.

## Files Explained

- `pages/index.js` - UI for running tests and displaying results
- `pages/api/proxy-test.js` - Simulates your cookie-based proxy pattern
- `pages/api/direct-test.js` - Measures raw Vercel-to-backend latency
- `package.json` - Dependencies (minimal Next.js setup)
- `next.config.js` - Basic Next.js configuration

## Questions?

After reviewing your results, you can use this data to:
1. Decide if Vercel migration makes sense with current architecture
2. Calculate ROI of migrating to token-based auth
3. Estimate real-world user impact
4. Make an informed architecture decision

Good luck with your testing! 🚀
