# Avenza Technologies LLC — Website

Static marketing site for Avenza Technologies LLC, a digital growth company:
marketing strategy, website modernization and new builds, short-form video
(TikTok, Instagram Reels, YouTube Shorts), social media management, and
sales / stock dashboards for small and growing businesses.

Live at **https://avenzatechnologies.com** (GitHub Pages).

## Structure

```
index.html             Home            ->  /
about/index.html       About           ->  /about/
services/index.html    Services        ->  /services/
contact/index.html     Contact         ->  /contact/   (consultation form)
contact/thanks/        Form thank-you  ->  /contact/thanks/ (no-JS fallback)
about.html             redirect stub   ->  /about/
services.html          redirect stub   ->  /services/
contact.html           redirect stub   ->  /contact/
assets/css/styles.css  Shared styles (light + dark themes)
assets/js/main.js      Mobile nav toggle, footer year, contact form submit
google-apps-script/    Form backend (Google Sheet + email), not served
CNAME                  Custom domain for GitHub Pages
.nojekyll              Serve files as-is, skip Jekyll processing
```

No build step. Plain HTML, CSS, and JS — edit and commit.

**Pages live in directories** so URLs have no `.html` extension. A new page
means a new folder with an `index.html` in it.

**Internal links and asset paths are root-absolute** (`/about/`,
`/assets/css/styles.css`), because pages sit at different depths and a
relative path would resolve differently from each one. This is correct for
the custom domain, which is the only way the site is reached — it does not
work from the `username.github.io/avenza-website/` fallback URL.

The three `*.html` files at the root are redirect stubs preserving the
original URLs. Safe to delete once nothing links to them.

## Local preview

```
python -m http.server 4173
```

Then open http://localhost:4173.

## Deployment

Pushing to `main` publishes automatically via GitHub Pages
(Settings → Pages → Source: `main`, folder `/`).

Illustrations are inline SVGs inside each page (not image files) so they
follow the light/dark theme colours.

## Contact form

GitHub Pages cannot process form POSTs, so the form on `/contact/` sends to a
Google Apps Script web app attached to a Google Sheet owned by the company
Gmail account. Each submission becomes a row in the sheet's **Submissions**
tab, and the account gets an email notification (reply goes to the visitor).

- Script source and step-by-step setup: [`google-apps-script/`](google-apps-script/SETUP.md)
- The web app URL goes in `action` on `<form id="contact-form">` in
  `contact/index.html`. Until it is set (it was a placeholder before setup),
  the form shows visitors the email and phone fallback instead.
- With JavaScript the form submits in the background (`assets/js/main.js`);
  without it, it posts normally and the script redirects to `/contact/thanks/`.
- Spam: a hidden `_honey` field silently drops bot submissions.

## Contact details

Email `info@avenzatechnologies.com`, phone `(720) 416-7970`, Charleston SC.
Update these in `contact/index.html`, the footer of every page, and the
error message in `assets/js/main.js` if they change.
