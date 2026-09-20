# Avenza Technologies LLC — Website

Static marketing site for Avenza Technologies LLC, a South Carolina-based
sourcing and supply partner for state government and institutional contracts.

Live at **https://avenzatechnologies.com** (GitHub Pages).

## Structure

```
index.html            Home
about.html            About
services.html         Services
contact.html          Contact
assets/css/styles.css Shared styles (light + dark themes)
assets/js/main.js     Mobile nav toggle, footer year
CNAME                 Custom domain for GitHub Pages
.nojekyll             Serve files as-is, skip Jekyll processing
```

No build step. Plain HTML, CSS, and JS — edit and commit.

## Local preview

```
python -m http.server 4173
```

Then open http://localhost:4173.

## Deployment

Pushing to `main` publishes automatically via GitHub Pages
(Settings → Pages → Source: `main`, folder `/`).

## Outstanding

- [ ] Point the contact form `action` at a real handler (Formspree, etc.) —
      it currently posts to `#` and discards submissions
- [ ] Confirm the company facts on `about.html` are current

## Contact details

Email `info@avenzatechnologies.com`, phone `(720) 416-7970`, Charleston SC.
Update these in `contact.html` if they change.
