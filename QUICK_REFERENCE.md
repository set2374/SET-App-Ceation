# TLS eDiscovery Platform - Quick Reference

**Version**: 2.0.5 (Latest)  
**Last Updated**: November 10, 2025

---

## 🔗 Essential URLs

| Resource | URL | Notes |
|----------|-----|-------|
| **Production v2.0.5** | https://3448cfb6.tls-ediscovery.pages.dev | Latest with portrait fixes |
| **Stable Fallback (v2.0.3)** | https://d72bb3e5.tls-ediscovery.pages.dev | Works well in landscape |
| **GitHub Repository** | https://github.com/set2374/SET-App-Ceation | Main branch, tag v2.0.5 |
| **Cloudflare Dashboard** | https://dash.cloudflare.com/ | Account: Set2374@gmail.com |

---

## 🔑 Required API Keys

### Development (.dev.vars file)
```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Production (Cloudflare Secret)
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name tls-ediscovery
```

**Get Keys From**: Stephen Turman, Esq.

---

## ⚡ Quick Start Commands

### Clone & Install
```bash
git clone https://github.com/set2374/SET-App-Ceation.git
cd SET-App-Ceation
npm install
```

### Local Development
```bash
# Initialize database
npm run db:migrate:local

# Build
npm run build

# Start server (PM2)
pm2 start ecosystem.config.cjs

# View logs
pm2 logs tls-ediscovery --nostream

# Test
curl http://localhost:3000
```

### Deploy to Production
```bash
# Build and deploy
npm run build
npx wrangler pages deploy dist --project-name tls-ediscovery

# Create version tag
git tag -a v2.0.X -m "Description"
git push origin v2.0.X
```

---

## 📱 Current Issues (v2.0.5)

### Being Fixed
1. **Mobile portrait swipe not working** - v2.0.5 adds aggressive fixes
2. **Chat text too small to read** - v2.0.5 increases to 18px

### Test on iPhone 15 Pro Max
- Open: https://3448cfb6.tls-ediscovery.pages.dev
- Portrait mode (vertical)
- Try swiping left/right
- Check chat text readability
- Open Safari Dev Tools for console logs

---

## 🐛 Quick Debug Commands

### Check Logs
```bash
pm2 logs tls-ediscovery --nostream --lines 100
```

### Query Database
```bash
npm run db:console:local
# Then: SELECT * FROM documents;
```

### Fix Auth Issues
```bash
# GitHub
setup_github_environment

# Cloudflare
setup_cloudflare_api_key
```

### Restart Service
```bash
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 restart tls-ediscovery
```

---

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| **DEVELOPER_HANDOFF_v2.0.5.md** | Complete handoff document (this is the main one) |
| **README.md** | Project overview |
| **VERSION.md** | Version history |
| **CHANGELOG.md** | Detailed changes |
| **DEPLOYMENT_INSTRUCTIONS.md** | Deploy guide |

---

## 🚨 Emergency Rollback

### Option 1: Cloudflare Dashboard
1. Go to https://dash.cloudflare.com/
2. Pages → tls-ediscovery → Deployments
3. Find v2.0.3 (stable): https://d72bb3e5.tls-ediscovery.pages.dev
4. Click "Rollback"

### Option 2: Git Tag
```bash
git checkout v2.0.3
npm run build
npx wrangler pages deploy dist --project-name tls-ediscovery
git checkout main
```

---

## 📞 Support Contact

**Stephen Turman, Esq.**  
Turman Legal Solutions PLLC  
**Via**: GenSpark AI platform

**For Critical Issues**: Use Cloudflare rollback immediately

---

## ✅ Testing Checklist (v2.0.5)

Mobile Portrait (iPhone 15 Pro Max):
- [ ] Swipe left: Sources → Chat → Notes
- [ ] Swipe right: Notes → Chat → Sources  
- [ ] Panel indicators visible (3 dots at bottom)
- [ ] Chat text 18px and readable
- [ ] Panels snap cleanly
- [ ] Console logs show no errors

---

**For Full Details**: See `DEVELOPER_HANDOFF_v2.0.5.md`
