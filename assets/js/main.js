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

  // Contact form: submit in the background via FormSubmit's AJAX endpoint.
  // Without JavaScript the form still posts normally and lands on /contact/thanks/.
  var form = document.getElementById('contact-form');
  if (form && window.fetch && window.FormData) {
    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');

    var show = function (kind, html) {
      status.className = 'form-status ' + kind;
      status.innerHTML = html;
      status.hidden = false;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Collect fields; checkbox groups are joined into one readable value.
      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (key === '_next') return;
        data[key] = data[key] ? data[key] + ', ' + value : value;
      });
      if (data._honey) return; // bot filled the hidden field

      button.disabled = true;
      button.textContent = 'Sending…';

      fetch(form.getAttribute('data-ajax'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().then(function (body) {
            if (!res.ok || String(body.success) !== 'true') throw new Error(body.message || 'Request failed');
          });
        })
        .then(function () {
          form.reset();
          show('ok', '<strong>Thank you!</strong> Your request has been sent. We will reply within one business day.');
        })
        .catch(function () {
          show('err', 'Sorry, your message could not be sent. Please email us at ' +
            '<a href="mailto:info@avenzatechnologies.com">info@avenzatechnologies.com</a> or call ' +
            '<a href="tel:+17204167970">(720) 416-7970</a>.');
        })
        .then(function () {
          button.disabled = false;
          button.textContent = 'Send Request';
        });
    });
  }
})();
