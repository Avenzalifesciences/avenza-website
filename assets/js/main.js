// Avenza Technologies LLC - shared site behavior

(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close the menu after following an in-page link
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Current year in the footer
  var year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Contact form: submits in the background to the Google Apps Script web app
  // (the form's `action`), which saves a row in the Google Sheet and emails a
  // notification. Without JavaScript the form posts normally and the script
  // sends the visitor to /contact/thanks/.
  var form = document.getElementById('contact-form');
  if (form && window.fetch && window.FormData && window.URLSearchParams) {
    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');

    var show = function (kind, html) {
      status.className = 'form-status ' + kind;
      status.innerHTML = html;
      status.hidden = false;
    };

    var fail = function () {
      show('err', 'Sorry, your message could not be sent. Please email us at ' +
        '<a href="mailto:info@avenzatechnologies.com">info@avenzatechnologies.com</a> or call ' +
        '<a href="tel:+17204167970">(720) 416-7970</a>.');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var endpoint = form.getAttribute('action');
      if (!/^https:\/\/script\.google\.com\//.test(endpoint)) {
        fail(); // endpoint not configured yet
        return;
      }

      // URL-encoded body keeps this a "simple" request (no CORS preflight),
      // and repeated checkbox names arrive in Apps Script as e.parameters.
      var body = new URLSearchParams(new FormData(form));
      body.append('_mode', 'json');

      button.disabled = true;
      button.textContent = 'Sending\u2026';

      fetch(endpoint, { method: 'POST', body: body })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data || data.result !== 'success') throw new Error(data && data.message);
          form.reset();
          show('ok', '<strong>Thank you!</strong> Your request has been sent. We will reply within one business day.');
        })
        .catch(fail)
        .then(function () {
          button.disabled = false;
          button.textContent = 'Send Request';
        });
    });
  }
})();
