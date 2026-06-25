/**
 * BostonDentalHub — main.js
 * Pure vanilla JS, no globals exposed, DOMContentLoaded-scoped.
 * Follows project conventions: const/let only, named functions, addEventListener.
 */
document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────────────
     1. HERO SLIDESHOW
  ───────────────────────────────────────────────── */
  const slides    = Array.from(document.querySelectorAll('.hero__slide'));
  const dots      = Array.from(document.querySelectorAll('.hero__dot'));
  let currentSlide = 0;
  let slideshowTimer = null;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('is-active');
    dots[currentSlide].classList.remove('is-active');
    dots[currentSlide].setAttribute('aria-selected', 'false');

    currentSlide = index;

    slides[currentSlide].classList.add('is-active');
    dots[currentSlide].classList.add('is-active');
    dots[currentSlide].setAttribute('aria-selected', 'true');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startSlideshow() {
    slideshowTimer = setInterval(nextSlide, 3000);
  }

  function resetSlideshow() {
    clearInterval(slideshowTimer);
    startSlideshow();
  }

  if (slides.length > 1) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(dot.dataset.slide, 10));
        resetSlideshow();
      });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { goToSlide((currentSlide + 1) % slides.length); resetSlideshow(); }
        if (e.key === 'ArrowLeft')  { goToSlide((currentSlide - 1 + slides.length) % slides.length); resetSlideshow(); }
      });
    });

    startSlideshow();
  }

  /* ─────────────────────────────────────────────────
     2. STICKY NAVIGATION
  ───────────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load

  /* ─────────────────────────────────────────────────
     2. MOBILE HAMBURGER MENU
  ───────────────────────────────────────────────── */
  const hamburger   = document.getElementById('nav-hamburger');
  const mobileMenu  = document.getElementById('nav-mobile');
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('.nav__mobile-link, .nav__mobile-cta') : [];

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileMenu.classList.add('nav__mobile--open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.classList.remove('nav__mobile--open');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on link click
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        hamburger.focus();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (
        hamburger.getAttribute('aria-expanded') === 'true' &&
        !nav.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ─────────────────────────────────────────────────
     3. ACTIVE NAV LINK ON SCROLL
  ───────────────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  function updateActiveLink() {
    let currentId = '';
    sections.forEach(function (section) {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 100) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('nav__link--active');
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('nav__link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ─────────────────────────────────────────────────
     4. FAQ ACCORDION
  ───────────────────────────────────────────────── */
  const faqButtons = document.querySelectorAll('.faq__question');

  faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answerId   = button.getAttribute('aria-controls');
      const answer     = document.getElementById(answerId);

      // Close all other open items
      faqButtons.forEach(function (otherBtn) {
        if (otherBtn !== button) {
          const otherId  = otherBtn.getAttribute('aria-controls');
          const otherAns = document.getElementById(otherId);
          otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) {
            otherAns.hidden = true;
          }
        }
      });

      // Toggle this item
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        if (answer) { answer.hidden = true; }
      } else {
        button.setAttribute('aria-expanded', 'true');
        if (answer) { answer.hidden = false; }
      }
    });

    // Keyboard: Enter / Space already fires click; support arrow keys
    button.addEventListener('keydown', function (e) {
      const item  = button.closest('.faq__item');
      const items = Array.from(document.querySelectorAll('.faq__item'));
      const idx   = items.indexOf(item);

      if (e.key === 'ArrowDown' && idx < items.length - 1) {
        e.preventDefault();
        items[idx + 1].querySelector('.faq__question').focus();
      }
      if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault();
        items[idx - 1].querySelector('.faq__question').focus();
      }
    });
  });

  /* ─────────────────────────────────────────────────
     5. CONTACT FORM VALIDATION & SUBMISSION
  ───────────────────────────────────────────────── */
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('form-submit');
  const successMsg  = document.getElementById('form-success');
  const errorMsg    = document.getElementById('form-error');

  /**
   * Sanitise a string to plain text — prevent XSS if value is ever
   * rendered to the DOM. Trim whitespace, strip HTML tags.
   */
  function sanitiseText(value) {
    return String(value)
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isValidEmail(value) {
    // RFC-5322-ish pattern, good enough for a front-end check
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isValidPhone(value) {
    // Allow digits, spaces, dashes, parens, +
    return /^[\d\s\-()+]{7,20}$/.test(value);
  }

  function markValid(input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  function markInvalid(input) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
  }

  function validateForm() {
    let valid = true;

    const firstName = form.elements['firstName'];
    const lastName  = form.elements['lastName'];
    const email     = form.elements['email'];
    const phone     = form.elements['phone'];

    if (!sanitiseText(firstName.value)) {
      markInvalid(firstName);
      valid = false;
    } else {
      markValid(firstName);
    }

    if (!sanitiseText(lastName.value)) {
      markInvalid(lastName);
      valid = false;
    } else {
      markValid(lastName);
    }

    if (!isValidEmail(sanitiseText(email.value))) {
      markInvalid(email);
      valid = false;
    } else {
      markValid(email);
    }

    if (!isValidPhone(sanitiseText(phone.value))) {
      markInvalid(phone);
      valid = false;
    } else {
      markValid(phone);
    }

    return valid;
  }

  // Validate individual fields on blur for real-time feedback
  if (form) {
    ['firstName', 'lastName', 'email', 'phone'].forEach(function (name) {
      const input = form.elements[name];
      if (!input) { return; }
      input.addEventListener('blur', function () {
        if (name === 'email') {
          if (!isValidEmail(sanitiseText(input.value))) {
            markInvalid(input);
          } else {
            markValid(input);
          }
        } else if (name === 'phone') {
          if (!isValidPhone(sanitiseText(input.value))) {
            markInvalid(input);
          } else {
            markValid(input);
          }
        } else {
          if (!sanitiseText(input.value)) {
            markInvalid(input);
          } else {
            markValid(input);
          }
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      successMsg.hidden = true;
      errorMsg.hidden   = true;

      if (!validateForm()) {
        errorMsg.hidden = false;
        errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      // Simulate async submission (replace with real fetch when backend exists)
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Request Appointment`;

        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        form.reset();

        // Re-clear invalid states
        form.querySelectorAll('.is-invalid').forEach(function (el) {
          el.classList.remove('is-invalid');
        });
      }, 1000);
    });
  }

  /* ─────────────────────────────────────────────────
     6. SCROLL REVEAL ANIMATION
  ───────────────────────────────────────────────── */
  const revealTargets = document.querySelectorAll(
    '.service-card, .review-card, .faq__item, .why-us__feature, .insurance__financing-card, .insurance__logo-card'
  );

  // Add reveal class
  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, idx) {
      if (entry.isIntersecting) {
        // Stagger siblings slightly
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children)
          : [];
        const delay = siblings.indexOf(entry.target) * 60;

        setTimeout(function () {
          entry.target.classList.add('reveal--visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────────────
     7. FOOTER YEAR
  ───────────────────────────────────────────────── */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ─────────────────────────────────────────────────
     8. SMOOTH SCROLL FOR ANCHOR LINKS
     (supplements CSS scroll-behavior for older Safari)
  ───────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) { return; }

      e.preventDefault();
      const navH   = nav ? nav.getBoundingClientRect().height : 0;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL without triggering a jump
      if (history.pushState) {
        history.pushState(null, '', '#' + targetId);
      }
    });
  });

});
