/**
 * Avenza Technologies - website contact form backend.
 *
 * Paste this into Extensions > Apps Script of the Google Sheet that should
 * collect submissions, then deploy it as a Web app (see SETUP.md).
 *
 * Each submission is appended as a row to the "Submissions" tab and an email
 * notification is sent to the Google account that deployed the script.
 * No email address is hard-coded here, so this file is safe to keep public.
 */

var SHEET_NAME = 'Submissions';
var SITE_THANKS_URL = 'https://avenzatechnologies.com/contact/thanks/';

// Form field names, in column order. Must match the `name` attributes in
// contact/index.html.
var FIELDS = [
  'Name',
  'Business',
  'email',
  'Phone',
  'Website',
  'Business type',
  'Services',
  'Monthly budget',
  'Heard about us',
  'Preferred contact',
  'Message'
];

var HEADERS = ['Submitted at'].concat([
  'Name',
  'Business',
  'Email',
  'Phone',
  'Website',
  'Business type',
  'Services',
  'Monthly budget',
  'Heard about us',
  'Preferred contact',
  'Message'
], ['Status']);

var REQUIRED = ['Name', 'Business', 'email', 'Message'];
var MAX_LEN = 5000;

function doPost(e) {
  var p = (e && e.parameter) || {};
  var multi = (e && e.parameters) || {};

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (p._honey) return respond_(p, true);

  for (var i = 0; i < REQUIRED.length; i++) {
    if (!String(p[REQUIRED[i]] || '').trim()) {
      return respond_(p, false, 'Missing required field: ' + REQUIRED[i]);
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(p.email).trim())) {
    return respond_(p, false, 'Invalid email address');
  }

  var values = FIELDS.map(function (f) {
    var v = multi[f] ? multi[f].join(', ') : (p[f] || '');
    return clean_(v);
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    getSheet_().appendRow([new Date()].concat(values, ['New']));
  } finally {
    lock.releaseLock();
  }

  try {
    notify_(values);
  } catch (err) {
    // The row is already saved; a mail quota or permission problem should not
    // make the visitor think their request failed.
    console.error('Notification email failed: ' + err);
  }

  return respond_(p, true);
}

function doGet() {
  return ContentService.createTextOutput('Avenza Technologies form endpoint is running.');
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#ecebfd');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

// Trim, cap length, and stop values like "=HYPERLINK(...)" from being
// interpreted as spreadsheet formulas.
function clean_(v) {
  var s = String(v == null ? '' : v).trim().slice(0, MAX_LEN);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function esc_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function notify_(values) {
  var to = Session.getEffectiveUser().getEmail();
  if (!to) return;

  var labels = HEADERS.slice(1, 1 + FIELDS.length);
  var rows = labels.map(function (label, i) {
    return '<tr><th align="left" style="padding:6px 12px;background:#f6f6fb;vertical-align:top">' +
      esc_(label) + '</th><td style="padding:6px 12px;white-space:pre-wrap">' +
      esc_(values[i] || '-') + '</td></tr>';
  }).join('');

  var visitorEmail = values[FIELDS.indexOf('email')];
  var business = values[FIELDS.indexOf('Business')] || values[FIELDS.indexOf('Name')];

  MailApp.sendEmail({
    to: to,
    replyTo: visitorEmail,
    subject: 'New website enquiry: ' + business,
    htmlBody:
      '<p>A new consultation request came in from avenzatechnologies.com. ' +
      'Reply to this email to answer the visitor directly.</p>' +
      '<table style="border-collapse:collapse;border:1px solid #e4e3ee;font-family:Arial,sans-serif;font-size:14px">' +
      rows + '</table>' +
      '<p><a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">Open the submissions sheet</a></p>'
  });
}

// The website's JavaScript asks for JSON (`_mode=json`). A plain HTML form
// post (JavaScript disabled) gets a page that sends the visitor back to the site.
function respond_(p, ok, message) {
  if (p._mode === 'json') {
    return ContentService
      .createTextOutput(JSON.stringify({ result: ok ? 'success' : 'error', message: message || '' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var html = ok
    ? '<p>Thank you! Your request has been sent.</p>' +
      '<p><a href="' + SITE_THANKS_URL + '" target="_top">Return to Avenza Technologies</a></p>' +
      '<script>window.top.location.replace(' + JSON.stringify(SITE_THANKS_URL) + ');</script>'
    : '<p>Sorry, your request could not be sent: ' + esc_(message || 'unknown error') + '.</p>' +
      '<p><a href="https://avenzatechnologies.com/contact/" target="_top">Go back and try again</a></p>';
  return HtmlService.createHtmlOutput(html).setTitle('Avenza Technologies');
}
