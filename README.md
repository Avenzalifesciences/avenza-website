# Avenza Technologies LLC — Website

Static marketing site for Avenza Technologies LLC, a sourcing and supply
partner for state government and institutional contracts.

Live at **https://avenzatechnologies.com** (GitHub Pages).

## Structure

```
index.html             Home            ->  /
about/index.html       About           ->  /about/
services/index.html    Services        ->  /services/
contact/index.html     Contact         ->  /contact/
about.html             redirect stub   ->  /about/
services.html          redirect stub   ->  /services/
contact.html           redirect stub   ->  /contact/
assets/css/styles.css  Shared styles (light + dark themes)
assets/js/main.js      Mobile nav toggle, footer year
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

## Outstanding

- [ ] Confirm the company facts on `about.html` are current

The contact page has no form. Static hosting cannot process form POSTs
(GitHub Pages returns 405), so the page uses direct `mailto:` and `tel:`
links instead. If a form is ever needed, it requires a third-party handler
such as Formspree or FormSubmit.

## Contact details

Email `info@avenzatechnologies.com`, phone `(720) 416-7970`, Charleston SC.
Update these in `contact.html` if they change.
