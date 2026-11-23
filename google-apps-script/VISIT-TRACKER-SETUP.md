# Concept page visit tracker: setup

Sends an email alert when a client opens a concept page (for example the
Beacon concept), and logs every visit to a Google Sheet: when, device, how
long they stayed and which menu pages they looked at.

Do this once, signed in to the company Gmail account that should get the alerts.

1. Create a new **blank Google Sheet** named `Avenza – Concept visits`.
   Keep it separate from the contact form sheet.
2. **Extensions → Apps Script.** Replace everything in `Code.gs` with
   [`VisitTracker.gs`](VisitTracker.gs). Save, and name the project
   `Avenza visit tracker`.
3. **Deploy → New deployment → Web app:**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize with the company account. On "Google hasn't verified this app",
   click **Advanced → Go to Avenza visit tracker (unsafe) → Allow**.
5. Copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`)
   and put it in `TRACKER_URL` in the concept page's tracking snippet.

## Not counting your own visits

Open the concept once with `?me` added to the end of the link, for example
`https://avenzatechnologies.com/concepts/beacon-c15ca5/?me`. That browser is
then remembered as yours and never tracked. Do this on each device you use.
`?notme` turns tracking back on for that browser.

## What the alert and sheet show

- Alert email: page opened, time (Eastern), device and the visitor's time zone.
  At most one alert every 30 minutes per visitor (change `ALERT_EVERY_MIN`).
- Sheet: one `open` row per visit, plus a `left` row when they close the page
  with seconds on page, menu pages viewed and sections reached.

No names, emails or IP addresses are collected.
