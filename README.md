# Cafe Manager - Web Application

A mobile-responsive web application for managing daily income collection from cafeterias and eco-shops.

## 📁 Files Structure

- `index.html` - Data entry portal for location managers
- `adminReport.html` - Consolidated admin reporting dashboard
- `adminReportPDF.html` - PDF template for generating reports

## 🚀 Setup Instructions

### 1. Apps Script Deployment

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy the contents of `Code.gs` into the script editor
4. Save the project
5. Deploy the script:
   - Click "Deploy" → "New deployment"
   - Select type: "Web app"
   - Execute as: Your email
   - Allow access to: Anyone (or your organization)
   - Copy the deployment URL

### 2. Update HTML Files with Deployment URL

In both `index.html` and `adminReport.html`, find this line:

```javascript
const APPS_SCRIPT_URL = 'YOUR_DEPLOYED_APPS_SCRIPT_URL';
```

Replace `YOUR_DEPLOYED_APPS_SCRIPT_URL` with your actual deployment URL.

### 3. Host HTML Files

These HTML files are hosted on GitHub Pages. They connect to the Apps Script backend via the deployment URL.

- **Data Entry**: https://venu68108-debug.github.io/cafemanager/index.html
- **Admin Report**: https://venu68108-debug.github.io/cafemanager/adminReport.html

## 📱 Features

### Data Entry Portal (index.html)
- User authentication
- Daily income submission form
- Personal report generation
- Day-by-day data viewing
- Mobile responsive design

### Admin Dashboard (adminReport.html)
- Admin authentication
- Consolidated reports across all locations
- Multiple location tabs
- CSV export functionality
- PDF report generation
- Mobile responsive design

## 🔧 Mobile Responsive Design

- Optimized for all screen sizes (mobile, tablet, desktop)
- Touch-friendly buttons and inputs
- Responsive typography
- Flexible layouts using CSS Grid and Flexbox
- Optimized font sizes for readability
- Proper viewport meta tag

## 📊 Data Flow

```
HTML (GitHub Pages)
        ↓
   Apps Script (Backend)
        ↓
   Google Sheet (Data Storage)
```

## 🔐 Security Notes

- Credentials are validated against the USER_CREDENTIALS sheet
- Passwords are hashed using SHA-256
- Admin access is restricted to users with "ADMIN_REPORT" location
- Data is stored securely in Google Sheets

## 📝 Configuration

### User Credentials Sheet
The script reads from a sheet named `USER_CREDENTIALS` with columns:
- Username
- HashedPassword
- LocationName

### Master Data Sheets
For each location, a master sheet stores daily income data:
- Date
- Total Collection
- Online Collection
- Remittance to Bank

## 🛠 Troubleshooting

### Forms not submitting
- Verify the APPS_SCRIPT_URL in both HTML files
- Check that the Apps Script is deployed as "Web app"
- Ensure execution permissions are set correctly

### No data appearing
- Check that the correct sheet names exist in your Google Sheet
- Verify user credentials in the USER_CREDENTIALS sheet
- Check browser console for any error messages

### Mobile display issues
- Clear browser cache and refresh
- Check viewport meta tag is present
- Use Chrome DevTools to test responsive design

## 📞 Support

For issues or questions, please check the Apps Script execution logs:
1. Go to Extensions → Apps Script
2. Click "Execution log" to view recent runs
3. Check for error messages and stack traces

## 📄 License

This project is for internal organizational use.
