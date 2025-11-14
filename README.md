# Vercel ↔ AWS Latency Test App

This Next.js app helps you measure the real-world latency of proxying API requests from Vercel to your AWS backend.

The result is available for usage here: https://vercel-proxy-server-gules.vercel.app/

## What it tests

1. **Current Setup**: Direct browser calls to your API (simulates your current AWS K8s setup)
2. **Vercel Proxy**: Full round-trip through Vercel's proxy route (what you'd experience with cookie-based auth)
3. **Vercel Server → Backend**: Raw server-to-server latency (what Vercel experiences)

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

## Questions?

After reviewing your results, you can use this data to:
1. Decide if Vercel migration makes sense with current architecture
2. Calculate ROI of migrating to token-based auth
3. Estimate real-world user impact
4. Make an informed architecture decision

Good luck with your testing! 🚀
