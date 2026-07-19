/**
 * CAFEMANAGER - CONFIGURATION & API WRAPPER (HTTP Version)
 * Centralized configuration for frontend to connect with Apps Script backend
 * This version uses HTTP POST requests instead of google.script.run
 */

// ============================================
// 1. CONFIGURATION - set your Apps Script exec URL here
// ============================================
const CONFIG = {
  // <- Your deployed Apps Script web app exec URL:
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwwm57b264_nPDz2QY7W8iuQYWSfdMwJM790PPMKTNStrNpmOLaIh3N21qS7vozLpUTbQ/exec',

  API_TIMEOUT: 30000, // ms
  FEATURES: {
    ENABLE_PDF_EXPORT: true,
    ENABLE_CSV_EXPORT: true,
    ENABLE_DAY_BY_DAY: true,
    DEBUG_MODE: false
  }
};

// ============================================
// 2. HTTP-BASED API WRAPPER (uses text/plain to avoid preflight)
// ============================================
async function callAppsScriptViaHTTP(functionName, args = []) {
  if (!CONFIG.APPS_SCRIPT_URL || !CONFIG.APPS_SCRIPT_URL.includes('script.google.com')) {
    throw new Error('Configuration Error: APPS_SCRIPT_URL not set correctly in config.js');
  }

  const payload = { function: functionName, args: args };
  const bodyText = JSON.stringify(payload);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    // Use text/plain to avoid OPTIONS preflight in most browsers.
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: bodyText,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Apps Script returns JSON text output. Parse robustly.
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response from server');
      }
    }

    if (CONFIG.FEATURES.DEBUG_MODE) console.log(`GAS ${functionName}:`, result);
    return result;

  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`Function '${functionName}' timed out after ${CONFIG.API_TIMEOUT}ms`);
    throw new Error(`${functionName} failed: ${err.message}`);
  }
}

// ============================================
// 3. Public API functions called from pages
// (these simply wrap callAppsScriptViaHTTP)
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
  if (resp && resp.success === true && typeof resp.data === 'string') return resp.data;
  return (typeof resp === 'string') ? resp : (resp.data || '');
}

async function apiGenerateAdminPdfReportBase64(fromDate, toDate) {
  const resp = await callAppsScriptViaHTTP('generateAdminPdfReportBase64', [fromDate, toDate]);
  if (resp && resp.success === true && typeof resp.data === 'string') return resp.data;
  return (typeof resp === 'string') ? resp : (resp.data || '');
}

async function apiGenerateShopPdfReportBase64(shopName, fromDate, toDate) {
  const resp = await callAppsScriptViaHTTP('generateShopPdfReportBase64', [shopName, fromDate, toDate]);
  if (resp && resp.success === true && typeof resp.data === 'string') return resp.data;
  return (typeof resp === 'string') ? resp : (resp.data || '');
}

// ============================================
// 4. Small helpers (only included if not in other files)
// If you already have downloadBase64File, downloadCsvFile, formatCurrency etc. in another file,
// keep those and remove duplicates here.
// ============================================
function downloadBase64File(base64Data, filename, mimeType = 'application/pdf') {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadCsvFile(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateForInput(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getTodayString() { return formatDateForInput(new Date()); }
function getFirstDayOfMonthString() { const today = new Date(); return formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1)); }
