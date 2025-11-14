# Quick Start: Deploy in 5 Minutes

## Method 1: GitHub + Vercel (Recommended)

1. **Create a new GitHub repository**
   ```bash
   cd vercel-latency-test
   git init
   git add .
   git commit -m "Initial commit - Vercel latency test"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/vercel-latency-test.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Click "Import" next to your repository
   - Click "Deploy" (no configuration needed)
   - Wait ~60 seconds for deployment

3. **Test it**
   - Open your Vercel URL (e.g., `https://vercel-latency-test.vercel.app`)
   - Enter your API endpoint: `https://api.gambly.com/YOUR-ENDPOINT`
   - Click "Run Latency Tests"

## Method 2: Vercel CLI (Fastest)

```bash
# From this directory
npm install -g vercel
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? vercel-latency-test
# - Directory? ./
# - Want to override settings? No
```

Vercel will give you a URL immediately.

## What to Test

### Good endpoints to test:
- Health check endpoints: `/health`, `/ping`, `/status`
- Lightweight GET endpoints that return JSON
- Public API endpoints (no auth required for this test)

### Example URLs:
```
https://api.gambly.com/health
https://api.gambly.com/v1/status
https://api.gambly.com/public/config
```

### Don't test:
- Endpoints that require authentication (unless your cookies are already set)
- Slow endpoints (that do heavy processing)
- Non-JSON endpoints
- Endpoints behind a VPN/firewall

## Reading the Results

### Scenario A: Low Added Latency (< 100ms)
```
Current Setup: 80ms
With Vercel Proxy: 150ms
Added overhead: 70ms
```
✅ **Decision**: Probably safe to proceed with Vercel + proxy architecture

### Scenario B: Medium Added Latency (100-200ms)
```
Current Setup: 90ms
With Vercel Proxy: 240ms
Added overhead: 150ms
```
⚠️ **Decision**: Consider hybrid approach or token-based auth

### Scenario C: High Added Latency (> 200ms)
```
Current Setup: 85ms
With Vercel Proxy: 320ms
Added overhead: 235ms
```
❌ **Decision**: Token-based auth strongly recommended, or stay on AWS

## Quick Calculation

**Page Impact Formula:**
```
Total Added Delay = Added Overhead × Number of Proxied API Calls

Example:
- Added overhead: 120ms
- API calls per page: 6
- Total impact: 120ms × 6 = 720ms extra per page load
```

## Common Issues

**"Network error" or timeout:**
- Make sure your API endpoint is publicly accessible
- Check that CloudFront allows requests from Vercel IPs
- Try a simpler endpoint

**CORS errors in console:**
- These are expected and don't affect the test accuracy
- The timing is still captured correctly

**Very slow results (> 1000ms):**
- Check your API endpoint itself isn't slow
- Test from browser dev tools directly first
- Make sure CloudFront is working

## After Testing

Take your results and:

1. **Document the numbers** for stakeholder discussions
2. **Calculate cost** of different approaches:
   - Stay on AWS (known cost)
   - Move to Vercel (check Vercel pricing)
   - Migrate to token auth (dev time cost)

3. **Make decision** based on:
   - Performance requirements
   - Development effort
   - Long-term maintainability
   - Team preferences

4. **Next steps**:
   - If proceeding: Plan your migration
   - If not: Consider alternatives
   - If unsure: Run more tests with production traffic simulation

## Need Help?

Common questions answered in the main README.md
