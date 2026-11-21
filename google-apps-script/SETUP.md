# Contact form → Google Sheet setup

The contact form on `/contact/` sends each submission to a small Google Apps
Script attached to a Google Sheet. The script:

- adds a row to the **Submissions** tab of the sheet, and
- emails a notification to the Google account that deployed it. Replying to
  that email replies to the visitor.

Do this once, signed in to the company Gmail account that should own the
sheet and receive the emails. It takes about 5 minutes.

## 1. Create the sheet

1. Go to <https://sheets.google.com> and create a **Blank spreadsheet**.
2. Name it something like `Avenza – Website enquiries`.

## 2. Add the script

1. In the sheet, open **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste the full contents of
   [`Code.gs`](Code.gs) from this folder.
3. Click **Save** (disk icon). Name the project `Avenza website form`.

## 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to *Select type* and choose **Web app**.
3. Set:
   - **Description:** `Website contact form`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`

   ("Anyone" is required so website visitors can submit without a Google
   login. They can only send data in; they cannot see the sheet.)
4. Click **Deploy**, then **Authorize access** and pick the company account.
5. Google shows *"Google hasn't verified this app"*. This is normal for your
   own script: click **Advanced → Go to Avenza website form (unsafe)** →
   **Allow**. It asks for permission to edit this spreadsheet and send email
   as you.
6. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy.../exec`.

## 4. Connect the website

In `contact/index.html`, replace `GOOGLE_APPS_SCRIPT_URL` in
`<form id="contact-form" action="...">` with the Web app URL, then commit and
push.

## 5. Test

Submit the form on the site. Within a few seconds you should see a new row in
the **Submissions** tab and a notification email.

## Changing the script later

After editing `Code.gs` in Apps Script, use **Deploy → Manage deployments →
Edit (pencil) → Version: New version → Deploy**. This keeps the same URL.
Creating a *New deployment* instead gives a new URL, which would then need
updating in `contact/index.html`.

## Notes

- Free Gmail accounts can send about 100 notification emails per day. The
  sheet row is still saved if that limit is hit.
- The **Status** column starts as `New`; use it to track follow-ups.
- To send notifications to a different address, change `to` in `notify_()`.
