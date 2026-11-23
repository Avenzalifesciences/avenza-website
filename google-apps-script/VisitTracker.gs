/**
 * Avenza Technologies - concept page visit tracker.
 *
 * Paste into Extensions > Apps Script of a NEW Google Sheet (separate from the
 * contact form sheet), then deploy as a Web app (see VISIT-TRACKER-SETUP.md).
 *
 * Each visit to a client concept page adds a row to the "Visits" tab. When a
 * page is opened, an email alert goes to the Google account that deployed the
 * script, at most once every ALERT_EVERY_MIN minutes per visitor and page.
 * No email address is hard-coded here, so this file is safe to keep public.
 */

var SHEET_NAME = 'Visits';
var ALERT_EVERY_MIN = 30;
var TIME_ZONE = 'America/New_York';

var HEADERS = ['When', 'Page', 'Event', 'Device', 'Visitor time zone', 'Came from',
  'Seconds on page', 'Menu pages viewed', 'Sections reached', 'Visitor ID'];

function doPost(e) {
  var d = {};
  try {
    d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    d = (e && e.parameter) || {};
  }

  var type = clean_(d.type || 'open').slice(0, 20);
  var page = clean_(d.page || 'Unknown page').slice(0, 80);
  var vid = clean_(d.vid || '').slice(0, 40);
  var device = clean_(d.device || '').slice(0, 60);

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    getSheet_().appendRow([
      new Date(), page, type, device, clean_(d.tz).slice(0, 60), clean_(d.ref).slice(0, 200),
      d.seconds ? Number(d.seconds) || '' : '', clean_(d.menus).slice(0, 500),
      clean_(d.sections).slice(0, 300), vid
    ]);
  } finally {
    lock.releaseLock();
  }

  if (type === 'open') {
    var cache = CacheService.getScriptCache();
    var key = ('alert_' + vid + '_' + page).slice(0, 240);
    if (!cache.get(key)) {
      cache.put(key, '1', ALERT_EVERY_MIN * 60);
      try {
        notify_(page, device, d);
      } catch (err) {
        console.error('Alert email failed: ' + err);
      }
    }
  }
  return ContentService.createTextOutput('ok');
}

function doGet() {
  return ContentService.createTextOutput('Avenza visit tracker is running.');
}

function notify_(page, device, d) {
  var to = Session.getEffectiveUser().getEmail();
  if (!to) return;
  var when = Utilities.formatDate(new Date(), TIME_ZONE, 'EEE MMM d, h:mm a');
  var body =
    page + ' was just opened.\n\n' +
    'When: ' + when + ' (Eastern)\n' +
    'Device: ' + (device || 'unknown') + '\n' +
    'Visitor time zone: ' + (clean_(d.tz) || 'unknown') + '\n' +
    'Came from: ' + (clean_(d.ref) || 'direct link / email') + '\n\n' +
    'Every visit, how long they stayed and which menu pages they opened are logged here:\n' +
    SpreadsheetApp.getActiveSpreadsheet().getUrl() + '\n\n' +
    'Alerts are sent at most once every ' + ALERT_EVERY_MIN + ' minutes per visitor.';
  MailApp.sendEmail({
    to: to,
    subject: '👀 ' + page + ' opened · ' + (device || 'unknown device') + ' · ' + when,
    body: body
  });
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

// Trim and stop values like "=HYPERLINK(...)" from being read as formulas.
function clean_(v) {
  var s = String(v == null ? '' : v).trim();
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}
