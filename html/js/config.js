/**
 * CAFEMANAGER - CONFIGURATION & API WRAPPER
 * Centralized configuration for frontend to connect with Apps Script backend
 * Update APPS_SCRIPT_URL with your deployment URL before deploying
 */

// ============================================
// 1. CONFIGURATION - UPDATE THIS WITH YOUR DEPLOYMENT URL
// ============================================

const CONFIG = {
  // Replace this with your Apps Script web app deployment URL
  // Get this from Apps Script > Deploy > Manage Deployments > Copy URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz5g6HY7oFQFPXkKr7Mkc7xszGk8NGgpCB46lgnY1v_VZ3m-ZRVLBWGjeo6KDSob3i0SA/exec',
  
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
// 2. API WRAPPER - Handles all communication with Apps Script
// ============================================

/**
 * Base API caller with error handling and timeout
 * @param {string} functionName - Name of Apps Script function to call
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise} Resolves with function result or rejects with error
 */
async function callAppsScript(functionName, args = []) {
  if (!CONFIG.APPS_SCRIPT_URL.includes('script.google.com')) {
    throw new Error('❌ Configuration Error: APPS_SCRIPT_URL not set. Update js/config.js with your deployment URL.');
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Function '${functionName}' timed out after ${CONFIG.API_TIMEOUT}ms`));
    }, CONFIG.API_TIMEOUT);

    try {
      google.script.run
        .withSuccessHandler((result) => {
          clearTimeout(timeout);
          if (CONFIG.FEATURES.DEBUG_MODE) {
            console.log(`✓ ${functionName}:`, result);
          }
          resolve(result);
        })
        .withFailureHandler((error) => {
          clearTimeout(timeout);
          reject(new Error(`${functionName} failed: ${error.message || error}`));
        })
        [functionName](...args);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

// ============================================
// 3. PUBLIC API FUNCTIONS - Call these from HTML
// ============================================

/**
 * User Login
 */
async function apiUserLogin(username, password) {
  try {
    return await callAppsScript('handleLogin', [username, password]);
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
    return await callAppsScript('handleAdminLogin', [username, password]);
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
    return await callAppsScript('processFormData', [formData]);
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
    return await callAppsScript('getMyAggregatedData', [locationName, fromDate, toDate]);
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
    return await callAppsScript('getMyDayByDayData', [locationName, fromDate, toDate]);
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
    return await callAppsScript('getAggregatedReportData', [fromDate, toDate]);
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
    return await callAppsScript('getReportCsvData', [fromDate, toDate]);
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
    return await callAppsScript('generateAdminPdfReportBase64', [fromDate, toDate]);
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
    return await callAppsScript('generateShopPdfReportBase64', [shopName, fromDate, toDate]);
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
  }
  if (CONFIG.FEATURES.DEBUG_MODE) {
    console.log('📋 Debug mode enabled. Configuration:', CONFIG);
  }
});
