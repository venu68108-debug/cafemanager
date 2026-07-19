/**
 * CAFEMANAGER - CONFIGURATION & API WRAPPER (HTTP Version)
 * Centralized configuration for frontend to connect with Apps Script backend
 * This version uses HTTP POST requests instead of google.script.run
 */

// ============================================
// 1. CONFIGURATION - UPDATE THIS WITH YOUR DEPLOYMENT URL
// ============================================

const CONFIG = {
  // APPS_SCRIPT_URL: set to your deployed web app exec URL (public exec endpoint)
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbytckBFWZzDecVAt6Sh8IoDKJNic_p76nmKxbF4AqfINU1_7-XITxVrT4x33fxt1RXrfA/exec',
  
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
  if (!CONFIG.APPS_SCRIPT_URL || !CONFIG.APPS_SCRIPT_URL.includes('script.google.com')) {
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
      mode: 'cors',
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

    // Parse JSON response (Apps Script returns JSON text output)
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      // fallback: sometimes response may have surrounding HTML — try to extract JSON substring
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response from server');
      }
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

async function apiUserLogin(username, password) {
  return await callAppsScriptViaHTTP('handleLogin', [username, password]);
}

async function apiAdminLogin(username, password) {
  return await callAppsScriptViaHTTP('handleAdminLogin', [username, password]);
}

async function apiSubmitFormData(formData) {
  return await callAppsScriptViaHTTP('processFormData', [formData]);
}

async function apiGetMyAggregatedData(locationName, fromDate, toDate) {
  return await callAppsScriptViaHTTP('getMyAggregatedData', [locationName, fromDate, toDate]);
}

async function apiGetMyDayByDayData(locationName, fromDate, toDate) {
  return await callAppsScriptViaHTTP('getMyDayByDayData', [locationName, fromDate, toDate]);
}

async function apiGetAggregatedReportData(fromDate, toDate) {
  return await callAppsScriptViaHTTP('getAggregatedReportData', [fromDate, toDate]);
}

async function apiGetReportCsvData(fromDate, toDate) {
  const resp = await callAppsScriptViaHTTP('getReportCsvData', [fromDate, toDate]);
  if (resp && resp.success === true && typeof resp.data === 'string') {
    return resp.data;
  }
  return (typeof resp === 'string') ? resp : (resp.data || '');
}

async function apiGenerateAdminPdfReportBase64(fromDate, toDate) {
  const resp = await callAppsScriptViaHTTP('generateAdminPdfReportBase64', [fromDate, toDate]);
  if (resp && resp.success === true && typeof resp.data === 'string') {
    return resp.data;
  }
  return (typeof resp === 'string') ? resp : (resp.data || '');
}

async function apiGenerateShopPdfReportBase64(shopName, fromDate, toDate) {
  const resp = await callAppsScriptViaHTTP('generateShopPdfReportBase64', [shopName, fromDate, toDate]);
  if (resp && resp.success === true && typeof resp.data === 'string') {
    return resp.data;
  }
  return (typeof resp === 'string') ? resp : (resp.data || '');
}
