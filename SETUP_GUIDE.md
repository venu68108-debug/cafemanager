# Complete Setup Guide for CafeManager

Follow these steps to transform your Apps Script and Google Sheets into a fully mobile-responsive web application.

## 📋 Prerequisites

- Google account with access to the Google Sheet
- GitHub account with push access to `venu68108-debug/cafemanager`
- Google Sheet: https://docs.google.com/spreadsheets/d/1HIxY9hwjI2ITVRvl3_v5kABZJtS7lffYFoqihLRPO5s/

## 🔧 Step-by-Step Setup

### PHASE 1: Deploy Apps Script Backend

#### 1.1 Open Apps Script Editor

1. Go to your Google Sheet
2. Click **Extensions > Apps Script**
3. You'll see the Apps Script editor in a new tab

#### 1.2 Replace Code

1. Delete all existing code
2. Paste the complete `Code.gs` from this repository
3. Press `Ctrl+S` to save

#### 1.3 Deploy as Web App

1. Click **Deploy** button (top right)
2. Select **New deployment**
3. Fill in:
   - **Type**: Select "Web app"
   - **Execute as**: Your email address
   - **Who has access**: "Anyone"
4. Click **Deploy**
5. You'll see a confirmation dialog
6. **COPY the deployment URL** - You'll need this!

Example URL format:
```
https://script.google.com/macros/d/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxx/usercontent
```

#### 1.4 Grant Permissions

1. A popup may ask for permissions
2. Click **Review permissions**
3. Choose your Google account
4. Click **Allow** (the app needs access to Google Sheets)

### PHASE 2: Configure Frontend

#### 2.1 Update config.js

1. Go to `html/js/config.js` in the repository
2. Find this line:
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID_HERE/usercontent',
   ```
3. Replace `YOUR_DEPLOYMENT_ID_HERE` with your actual deployment ID
4. Example (yours will be different):
   ```javascript
   APPS_SCRIPT_URL: 'https://script.google.com/macros/d/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxx/usercontent',
   ```
5. Save the file

#### 2.2 Verify File Structure

Ensure these files exist in the repository:

```
html/
├── index.html
├── adminReport.html
├── shopPanel.html
├── adminReportPDF.html
├── shopReportPDF.html
└── js/
    └── config.js
```

### PHASE 3: Enable GitHub Pages

#### 3.1 Access Repository Settings

1. Go to https://github.com/venu68108-debug/cafemanager
2. Click **Settings** (top right)
3. In left sidebar, click **Pages**

#### 3.2 Configure GitHub Pages

1. Under "Build and deployment":
   - **Source**: "Deploy from a branch"
   - **Branch**: "main"
   - **Folder**: "/html" (or root if files are there)
2. Click **Save**
3. GitHub will process (takes 1-2 minutes)
4. You'll see: "Your site is published at: https://venu68108-debug.github.io/cafemanager/"

#### 3.3 Verify Deployment

1. Wait 2-3 minutes
2. Visit: `https://venu68108-debug.github.io/cafemanager/index.html`
3. You should see the login page

### PHASE 4: Set Up User Credentials

#### 4.1 Create Admin Account

1. Go back to Apps Script
2. In the editor, find `createUser` function
3. In the bottom, click **Run** next to the function name (or Ctrl+Enter)
4. When prompted, paste this code in the console:
   ```javascript
   createUser("admin", "admin123", "ADMIN_REPORT");
   ```
5. Press Enter
6. You'll see a popup confirming the user was created

#### 4.2 Create Regular User Accounts

For each location, run:

```javascript
createUser("netedc_user", "password123", "NETEDC-CAFETERIA");
createUser("ketedc_user", "password123", "KETEDC-CAFETERIA");
// etc. for each location
```

**Available Locations**:
- NETEDC-CAFETERIA
- KETEDC-CAFETERIA
- KETEDC-ECOSHOP
- NETEDC-ECOSHOP
- PETEDC-ECOSHOP
- CHATHEN-ECOSHOP
- CAFETERIA-PTP

### PHASE 5: Testing

#### 5.1 Test User Login

1. Visit: `https://venu68108-debug.github.io/cafemanager/index.html`
2. Enter credentials:
   - Username: `netedc_user`
   - Password: `password123`
3. Click **Login**
4. You should see the data entry form

#### 5.2 Test Data Entry

1. Fill in the form:
   - Date: Today
   - Total Collection: 5000
   - Online Collection: 2000
   - Remittance to Bank: 3000
2. Click **Submit Data**
3. Confirm the submission
4. You should see success message

#### 5.3 Test Report Viewing

1. Click **View Report** (My Data Report section)
2. Select date range
3. Click **View Report**
4. You should see your submitted data

#### 5.4 Test Admin Panel

1. Visit: `https://venu68108-debug.github.io/cafemanager/adminReport.html`
2. Enter admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click **Login**
4. Select date range
5. Click **Generate Report**
6. You should see data from all locations
7. Test **Download Report (CSV)** button
8. Test **Download PDF Report** button

#### 5.5 Test on Mobile Device

1. On your phone, visit: `https://venu68108-debug.github.io/cafemanager/index.html`
2. Test login
3. Test form entry
4. Verify layout looks good
5. Test on both portrait and landscape modes

### PHASE 6: Troubleshooting

#### Issue: "Config not found" error

**Solution**:
1. Open DevTools (F12)
2. Check console for error messages
3. Verify `config.js` is loading
4. Clear browser cache (Ctrl+Shift+Delete)
5. Reload page

#### Issue: "Failed to call function" error

**Solution**:
1. Verify deployment URL in `config.js` is correct
2. Check it matches exactly (no extra spaces)
3. Visit the deployment URL directly in browser
4. You should see "Redirecting..."
5. If error, deployment link is invalid

#### Issue: Login fails

**Solution**:
1. Check username/password are correct
2. Run `createUser()` again to verify account exists
3. Check Google Sheet's `USER_CREDENTIALS` sheet
4. Ensure user has correct LocationName

#### Issue: Mobile layout broken

**Solution**:
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Check for CSS errors
4. Verify viewport meta tag is in HTML head:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```
5. Test on actual device

#### Issue: PDF download fails

**Solution**:
1. Check date range is valid
2. Try smaller date range (1-2 weeks)
3. Check Google Sheet has data for that range
4. Check Apps Script logs for errors
5. Verify PDF template HTML is correct

## 🔄 Redeployment After Changes

If you modify `Code.gs`:

1. Go to Apps Script editor
2. Make your changes
3. Press Ctrl+S to save
4. Click **Deploy > Manage deployments**
5. Click the trash icon to delete old deployment
6. Click **Deploy > New deployment**
7. Follow deployment steps again
8. Update `config.js` if URL changes

## 📱 Mobile Optimization Tips

The app is 100% mobile-responsive with:

- **Breakpoint 1**: 320px (mobile phones)
- **Breakpoint 2**: 768px (tablets)
- **Breakpoint 3**: 1024px (desktop)

Features:
- Touch-friendly buttons (44px minimum height)
- Large input fields for easy typing
- Vertical stacking on small screens
- Horizontal layout on larger screens
- Native date pickers on mobile
- Fast load times (< 2 seconds)

## ✅ Final Verification Checklist

- [ ] Apps Script deployed successfully
- [ ] Deployment URL copied to config.js
- [ ] GitHub Pages enabled
- [ ] Website accessible at https://venu68108-debug.github.io/cafemanager/
- [ ] Admin account created
- [ ] User accounts created for each location
- [ ] Login works on index.html
- [ ] Data entry form works
- [ ] Reports generate successfully
- [ ] PDF download works
- [ ] CSV download works
- [ ] Admin panel works
- [ ] Shop panel works
- [ ] Mobile layout looks good
- [ ] Tested on actual mobile device

## 🎉 You're Done!

Your mobile-responsive CafeManager app is now live!

### Access URLs

| Role | URL |
|------|-----|
| **Data Entry** | https://venu68108-debug.github.io/cafemanager/index.html |
| **Shop Reports** | https://venu68108-debug.github.io/cafemanager/shopPanel.html |
| **Admin Reports** | https://venu68108-debug.github.io/cafemanager/adminReport.html |

### Next Steps

1. Distribute login credentials to team members
2. Train users on how to use the system
3. Monitor data quality
4. Make adjustments as needed

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console (F12)
3. Check Apps Script logs for server errors
4. Verify Google Sheet structure hasn't changed

---

**Questions?** Ask about specific errors and I'll help debug!
