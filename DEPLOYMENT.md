# Deployment Guide

This guide explains how to deploy and run the Souls-like 3D RPG game.

## Quick Deployment (Simplest Method)

### Option 1: Direct File Open
1. Download `index.html` from this repository
2. Double-click the file or right-click → "Open with" → Choose your browser
3. The game will load and run immediately!

**Note**: This works because the game is self-contained with CDN dependencies.

### Option 2: Local Web Server (Recommended)

#### Using Python (Python 3.x)
```bash
# Navigate to the game directory
cd /path/to/fantastic-spork

# Start a simple HTTP server
python -m http.server 8000

# Open browser to:
http://localhost:8000/index.html
```

#### Using Python (Python 2.x)
```bash
cd /path/to/fantastic-spork
python -m SimpleHTTPServer 8000
# Open: http://localhost:8000/index.html
```

#### Using Node.js (http-server)
```bash
# Install http-server globally (one time)
npm install -g http-server

# Navigate to game directory
cd /path/to/fantastic-spork

# Start server
http-server -p 8000

# Open: http://localhost:8000/index.html
```

#### Using PHP
```bash
cd /path/to/fantastic-spork
php -S localhost:8000
# Open: http://localhost:8000/index.html
```

#### Using Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Web Hosting Deployment

### Option 1: GitHub Pages
```bash
# 1. Push to GitHub (already done in this repo)
git push origin main

# 2. Enable GitHub Pages
# - Go to repository Settings
# - Scroll to "Pages" section
# - Select source: main branch
# - Select folder: / (root)
# - Click Save

# 3. Access at:
https://yourusername.github.io/fantastic-spork/index.html
```

### Option 2: Netlify (Free)
```bash
# Method A: Drag and Drop
1. Go to https://app.netlify.com/drop
2. Drag the index.html file
3. Get instant URL

# Method B: GitHub Integration
1. Sign in to Netlify
2. Click "New site from Git"
3. Choose your GitHub repository
4. Click "Deploy site"
5. Get custom URL: https://your-site.netlify.app
```

### Option 3: Vercel (Free)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd /path/to/fantastic-spork

# Deploy
vercel

# Follow prompts, get instant URL
```

### Option 4: Surge.sh (Free)
```bash
# Install Surge
npm install -g surge

# Navigate to project
cd /path/to/fantastic-spork

# Deploy
surge

# Follow prompts to deploy
```

### Option 5: Traditional Web Hosting
1. Get web hosting account (Bluehost, HostGator, etc.)
2. Upload `index.html` via FTP/cPanel
3. Access via your domain: `https://yourdomain.com/index.html`

## CDN & Dependencies

### Current Setup
The game uses jsdelivr CDN for Three.js:
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
```

### Alternative CDNs (If needed)
```html
<!-- Option 1: unpkg -->
<script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>

<!-- Option 2: cdnjs -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- Option 3: jsDelivr (current) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
```

### Offline/Local Three.js (For no internet scenarios)
```bash
# Download Three.js
curl -o three.min.js https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js

# Update index.html to use local file:
<script src="three.min.js"></script>
```

## Performance Optimization for Deployment

### 1. Minification (Optional)
```bash
# Install HTML minifier
npm install -g html-minifier

# Minify the HTML
html-minifier --collapse-whitespace --remove-comments --minify-js --minify-css index.html -o index.min.html
```

### 2. Compression (Server-side)

#### Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

#### Nginx
```nginx
# Enable gzip compression
gzip on;
gzip_types text/html text/css application/javascript;
gzip_min_length 1000;

# Browser caching
location ~* \.(html)$ {
    expires 1h;
}
```

### 3. Content Delivery Network (CDN)
- Upload to Cloudflare for global CDN
- Faster load times worldwide
- DDoS protection included

## Browser Compatibility Testing

### Before Deployment, Test On:
- ✅ Chrome/Chromium (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Testing Checklist:
```
[ ] Game loads without errors
[ ] 3D scene renders correctly
[ ] Controls respond properly
[ ] Audio plays (may require user interaction)
[ ] Pointer lock works
[ ] No console errors
[ ] Performance is acceptable (>30 FPS minimum)
```

## Security Considerations

### Content Security Policy (Optional)
Add to your HTML `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline';">
```

### HTTPS (Recommended)
- Most free hosting services provide HTTPS automatically
- GitHub Pages: HTTPS enabled by default
- Netlify/Vercel: HTTPS enabled by default
- For custom domains: Use Let's Encrypt (free SSL)

## Mobile Deployment

### Responsive Considerations
The game is designed for desktop but works on mobile:
- Touch controls may be challenging
- Consider adding virtual joystick for mobile
- Landscape orientation recommended

### Progressive Web App (PWA) - Optional Enhancement
Create `manifest.json`:
```json
{
  "name": "Souls-like 3D RPG",
  "short_name": "Souls RPG",
  "description": "Browser-based 3D action RPG",
  "start_url": "/index.html",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#0a0a0a",
  "theme_color": "#4a90e2",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

Add to HTML:
```html
<link rel="manifest" href="manifest.json">
```

## Monitoring & Analytics (Optional)

### Google Analytics
```html
<!-- Add before closing </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-TRACKING-ID');
</script>
```

## Troubleshooting Deployment

### Issue: Three.js Not Loading
```
Problem: CDN blocked or unavailable
Solution 1: Try alternative CDN
Solution 2: Download Three.js locally
Solution 3: Check network/firewall settings
```

### Issue: Pointer Lock Fails
```
Problem: HTTPS required for some browsers
Solution: Deploy with HTTPS (not http://)
```

### Issue: Audio Not Playing
```
Problem: Browser autoplay policy
Solution: This is normal - audio plays after first user interaction
```

### Issue: Poor Performance
```
Problem: Low-end device or browser
Solution 1: Close other tabs/applications
Solution 2: Update graphics drivers
Solution 3: Try different browser
Solution 4: Enable hardware acceleration in browser
```

## Production Checklist

Before going live:
- [ ] Test in all major browsers
- [ ] Test on mobile devices
- [ ] Verify Three.js loads from CDN
- [ ] Check all controls work
- [ ] Verify audio plays (after interaction)
- [ ] Test death/respawn system
- [ ] Confirm no console errors
- [ ] Test on slow connection (3G)
- [ ] Verify HTTPS works
- [ ] Check meta tags for SEO
- [ ] Test fullscreen functionality

## Recommended Deployment Flow

```
Development → Testing → Staging → Production

1. Development: Local server (http-server, Live Server)
2. Testing: Test on localhost with different browsers
3. Staging: Deploy to Netlify/Vercel preview URL
4. Production: Deploy to final URL (GitHub Pages, custom domain)
```

## Custom Domain Setup

### GitHub Pages with Custom Domain
```
1. Add CNAME file with your domain
2. Configure DNS:
   - Type: A
   - Name: @
   - Value: GitHub Pages IP (185.199.108.153)
3. Enable HTTPS in repository settings
```

### Netlify with Custom Domain
```
1. Go to Domain Settings in Netlify
2. Add custom domain
3. Follow DNS configuration steps
4. HTTPS enabled automatically
```

## Backup & Version Control

```bash
# Always maintain git repository
git add .
git commit -m "Deploy version X.X.X"
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin main --tags
```

## Support & Maintenance

### Updating the Game
1. Make changes to `index.html`
2. Test locally
3. Commit to git
4. Push to hosting service
5. Verify deployment

### Rolling Back
```bash
# If something breaks
git revert HEAD
git push origin main
```

## Cost Summary

| Service | Cost | Features |
|---------|------|----------|
| GitHub Pages | Free | Unlimited bandwidth, HTTPS |
| Netlify | Free | 100GB bandwidth/month, HTTPS |
| Vercel | Free | Unlimited bandwidth, HTTPS |
| Surge.sh | Free | 25GB bandwidth/month |
| Python Server | Free | Local only |

## Final Deployment Command

```bash
# Quick deploy to Netlify (recommended)
npx netlify-cli deploy --prod

# Or GitHub Pages (if repo already exists)
git push origin main
# Enable GitHub Pages in settings
```

---

**You're ready to deploy! Choose your preferred method and share your game with the world! 🎮**
