# CafeManager - Mobile-First Income Management System

A comprehensive web application for managing daily collection data from multiple cafeterias and eco-shops across office locations.

## 🎯 Architecture Overview

- **Frontend**: GitHub-hosted HTML/CSS/JavaScript (100% mobile-responsive)
- **Backend**: Google Apps Script (serverless)
- **Data**: Google Sheets (master data + user credentials)
- **Deployment**: Apps Script Web App + GitHub Pages

## 📁 Project Structure

```
html/
├── index.html              (User data entry & reports)
├── adminReport.html        (Admin consolidated reports)
├── shopPanel.html          (Individual shop reports)
├── adminReportPDF.html     (PDF template)
└── shopReportPDF.html      (PDF template)
js/
├── config.js               (API configuration & utilities)
README.md
SETUP_GUIDE.md
```

## 🚀 Quick Start

### Step 1: Deploy Apps Script Backend

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Replace code with `Code.gs` (provided)
4. Click **Deploy > New Deployment**
   - Type: Web app
   - Execute as: Your email
   - Who has access: Anyone
5. **Copy the deployment URL**

### Step 2: Configure Frontend

Edit `html/js/config.js` and update:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercontent',
  // ... other config
};
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings > Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** | Folder: **/html**
4. Your site: `https://venu68108-debug.github.io/cafemanager/`

## 🔗 Access URLs

| Role | URL |
|------|-----|
| **Data Entry Users** | `https://venu68108-debug.github.io/cafemanager/index.html` |
| **Shop Managers** | `https://venu68108-debug.github.io/cafemanager/shopPanel.html` |
| **Admins** | `https://venu68108-debug.github.io/cafemanager/adminReport.html` |

## 📱 Mobile-First Features

✅ Fully responsive design (320px - 1920px)  
✅ Touch-optimized buttons and forms  
✅ Native mobile date pickers  
✅ Vertical stack layout on mobile  
✅ Fast load times  
✅ Works offline (with cached data)  

## 🔐 Security

- SHA-256 hashed credentials
- No localStorage for sensitive data
- CORS-safe API communication
- Session-based authentication
- Admin-only access controls

## 📋 Google Sheet Structure

### USER_CREDENTIALS Sheet
- Username | HashedPassword | LocationName
- For admin accounts: LocationName = "ADMIN_REPORT"

### MASTER-[LOCATION] Sheets
- Date | Total Collection | Online Collection | Remittance to Bank

## 🐛 Troubleshooting

**"Config not found" error**
- Check `html/js/config.js` exists
- Verify APPS_SCRIPT_URL is set correctly
- Clear browser cache

**"Failed to call function"**
- Confirm Apps Script deployment URL
- Check deployment hasn't expired
- Verify user has Google Sheet access

**Mobile layout broken**
- Use DevTools to inspect (F12)
- Check viewport meta tag in HTML
- Verify CSS files loading

## ✅ Setup Checklist

- [ ] Deploy Apps Script
- [ ] Update config.js with deployment URL
- [ ] Verify HTML files in correct location
- [ ] Enable GitHub Pages
- [ ] Test login on all pages
- [ ] Test data submission
- [ ] Test PDF/CSV downloads
- [ ] Test on mobile device

## 📞 Support

For setup guidance, see `SETUP_GUIDE.md`

---

**Status**: Production Ready  
**Version**: 1.0
