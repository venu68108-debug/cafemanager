/**
 * CAFEMANAGER - CONFIGURATION & API WRAPPER (HTTP Version)
 * Centralized configuration for frontend to connect with Apps Script backend
 * This version uses HTTP POST requests instead of google.script.run
 */

// ============================================
// 1. CONFIGURATION - UPDATE THIS WITH YOUR DEPLOYMENT URL
// ============================================

const CONFIG = {
  // Replace this with your Apps Script web app deployment URL
  // Get this from Apps Script > Deploy > Manage Deployments > Copy URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID_HERE/usercontent',
  
  // API timeout in milliseconds
  API_TIMEOUT: 30000,
  
  // Feature flags
  FEATURES: {
    ENABLE_PDF_EXPORT: true,
    ENABLE_CSV_EXPORT: true,
    ENABLE_DAY_BY_DAY: true,
    DEBUG_MODE: false
  }
};

// ============================================
// 2. HTTP-BASED API WRAPPER
// ============================================

/**
 * Base API caller using HTTP POST
 * @param {string} functionName - Name of Apps Script function to call
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise} Resolves with function result or rejects with error
 */
async function callAppsScriptViaHTTP(functionName, args = []) {
  if (!CONFIG.APPS_SCRIPT_URL.includes('script.google.com')) {
    throw new Error('❌ Configuration Error: APPS_SCRIPT_URL not set. Update js/config.js with your deployment URL.');
  }

  const payload = {
    function: functionName,
    args: args
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let result;
    try {
      const text = await response.text();
      // Try to parse as JSON, handling the case where result is wrapped in HTML tags
      const jsonMatch = text.match(/\{.*\}/) || text.match(/\[.*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = text;
      }
    } catch (parseError) {
      result = await response.text();
    }

    if (CONFIG.FEATURES.DEBUG_MODE) {
      console.log(`✓ ${functionName}:`, result);
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Function '${functionName}' timed out after ${CONFIG.API_TIMEOUT}ms`);
    }
    throw new Error(`${functionName} failed: ${error.message}`);
  }
}

// ============================================
// 3. PUBLIC API FUNCTIONS - Call these from HTML
// ============================================

/**
 * User Login
 */
async function apiUserLogin(username, password) {
  try {
    return await callAppsScriptViaHTTP('handleLogin', [username, password]);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Admin Login
 */
async function apiAdminLogin(username, password) {
  try {
    return await callAppsScriptViaHTTP('handleAdminLogin', [username, password]);
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
}

/**
 * Submit Form Data
 */
async function apiSubmitFormData(formData) {
  try {
    return await callAppsScriptViaHTTP('processFormData', [formData]);
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

/**
 * Get User's Aggregated Data (Summary Report)
 */
async function apiGetMyAggregatedData(locationName, fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('getMyAggregatedData', [locationName, fromDate, toDate]);
  } catch (error) {
    console.error('Data fetch error:', error);
    throw error;
  }
}

/**
 * Get User's Day-by-Day Data
 */
async function apiGetMyDayByDayData(locationName, fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('getMyDayByDayData', [locationName, fromDate, toDate]);
  } catch (error) {
    console.error('Day-by-day data fetch error:', error);
    throw error;
  }
}

/**
 * Get Admin Aggregated Report Data (All Locations)
 */
async function apiGetAggregatedReportData(fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('getAggregatedReportData', [fromDate, toDate]);
  } catch (error) {
    console.error('Aggregated report fetch error:', error);
    throw error;
  }
}

/**
 * Get Admin CSV Report Data
 */
async function apiGetReportCsvData(fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('getReportCsvData', [fromDate, toDate]);
  } catch (error) {
    console.error('CSV data fetch error:', error);
    throw error;
  }
}

/**
 * Generate Admin PDF Report (Base64)
 */
async function apiGenerateAdminPdfReportBase64(fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('generateAdminPdfReportBase64', [fromDate, toDate]);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

/**
 * Generate Shop PDF Report (Base64)
 */
async function apiGenerateShopPdfReportBase64(shopName, fromDate, toDate) {
  try {
    return await callAppsScriptViaHTTP('generateShopPdfReportBase64', [shopName, fromDate, toDate]);
  } catch (error) {
    console.error('Shop PDF generation error:', error);
    throw error;
  }
}

// ============================================
// 4. UTILITY FUNCTIONS - Helper functions for common tasks
// ============================================

/**
 * Download file from base64
 */
function downloadBase64File(base64Data, filename, mimeType = 'application/pdf') {
  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Download CSV string as file
 */
function downloadCsvFile(csvContent, filename) {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('CSV download error:', error);
    throw error;
  }
}

/**
 * Format number with Indian locale
 */
function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDateForInput(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayString() {
  return formatDateForInput(new Date());
}

/**
 * Get first day of current month as YYYY-MM-DD string
 */
function getFirstDayOfMonthString() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDateForInput(firstDay);
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
function isValidDateString(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate date is not in future
 */
function isDateInPast(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() <= today.getTime();
}

/**
 * Check if date1 is before date2
 */
function isDateBefore(dateString1, dateString2) {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  return date1.getTime() < date2.getTime();
}

// ============================================
// 5. VALIDATION HELPERS
// ============================================

/**
 * Validate form data for submission
 */
function validateFormData(formData) {
  const errors = [];

  if (!formData.date) {
    errors.push('Date is required');
  } else if (!isValidDateString(formData.date)) {
    errors.push('Invalid date format');
  } else if (!isDateInPast(formData.date)) {
    errors.push('Date cannot be in the future');
  }

  if (typeof formData.totalCollection !== 'number' || formData.totalCollection < 0) {
    errors.push('Total Collection must be a non-negative number');
  }

  if (typeof formData.onlineCollection !== 'number' || formData.onlineCollection < 0) {
    errors.push('Online Collection must be a non-negative number');
  }

  if (formData.onlineCollection > formData.totalCollection) {
    errors.push('Online Collection cannot exceed Total Collection');
  }

  if (typeof formData.remittanceToBank !== 'number' || formData.remittanceToBank < 0) {
    errors.push('Remittance to Bank must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate date range
 */
function validateDateRange(fromDateString, toDateString) {
  const errors = [];

  if (!fromDateString || !toDateString) {
    errors.push('Both dates are required');
  } else {
    if (!isValidDateString(fromDateString)) {
      errors.push('Invalid "From Date" format');
    }
    if (!isValidDateString(toDateString)) {
      errors.push('Invalid "To Date" format');
    }
    if (isValidDateString(fromDateString) && isValidDateString(toDateString)) {
      if (!isDateBefore(fromDateString, toDateString) && fromDateString !== toDateString) {
        errors.push('"From Date" cannot be after "To Date"');
      }
      if (!isDateInPast(toDateString)) {
        errors.push('Dates cannot be in the future');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// ============================================
// 6. INITIALIZATION
// ============================================

// Check configuration on load
document.addEventListener('DOMContentLoaded', function() {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.warn('⚠️ WARNING: APPS_SCRIPT_URL not configured in config.js');
    console.warn('Please update the APPS_SCRIPT_URL with your Apps Script deployment URL');
    showNotification('❌ Backend not configured! Update config.js with your deployment URL.', 'error', 10000);
  }
  if (CONFIG.FEATURES.DEBUG_MODE) {
    console.log('📋 Debug mode enabled. Configuration:', CONFIG);
  }
});

/**
 * Show temporary notification
 */
function showNotification(message, type = 'info', duration = 4000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    font-weight: 600;
    max-width: 90vw;
  `;

  const colors = {
    success: { bg: '#dcfce7', text: '#166534', border: '1px solid #86efac' },
    error: { bg: '#fee2e2', text: '#991b1b', border: '1px solid #fca5a5' },
    info: { bg: '#dbeafe', text: '#1e40af', border: '1px solid #93c5fd' }
  };

  const color = colors[type] || colors.info;
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;
  notification.style.border = color.border;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}
