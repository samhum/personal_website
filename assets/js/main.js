/**
 * Samuel W. Hum — Personal Research Webpage
 * Interactive functionality: Navigation, Theme Toggle, Filtering, BibTeX Copy, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScrollProgress();
  initNavObserver();
  initMobileMenu();
  initProjectFilters();
  initVideoFilters();
  initVideoPlayers();
  initPublicationSearchAndFilters();
  initBibTeXToggleAndCopy();
  initEmailCopy();
  initContactForm();
  initMethodologyLoop();
  setCurrentYear();
});

/* -------------------------------------------------------------------------- */
/* 1. Theme Toggle (Light / Dark Mode with Persistence)                       */
/* -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} mode`);
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Scroll Progress Bar & Navbar Scroll Shadow                              */
/* -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  const navWrapper = document.getElementById('top-nav');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (navWrapper) {
      if (scrollTop > 20) {
        navWrapper.classList.add('scrolled');
      } else {
        navWrapper.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* 3. Section Active Tracking (Intersection Observer) & Smooth Scroll         */
/* -------------------------------------------------------------------------- */
function initNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Smooth scroll click handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });

        // Close mobile menu if open
        const navLinksList = document.getElementById('nav-links');
        const mobileBtn = document.getElementById('mobile-menu-btn');
        if (navLinksList && navLinksList.classList.contains('open')) {
          navLinksList.classList.remove('open');
          mobileBtn.classList.remove('is-active');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 4. Mobile Menu Toggle                                                      */
/* -------------------------------------------------------------------------- */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (!mobileBtn || !navLinks) return;

  mobileBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    mobileBtn.classList.toggle('is-active', isOpen);
    mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close when clicking outside navbar
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      mobileBtn.classList.remove('is-active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 5. Project Filtering                                                       */
/* -------------------------------------------------------------------------- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.project-filters .filter-btn');
  const projectCards = document.querySelectorAll('.projects-grid .project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 5.5. Research Video Filtering                                              */
/* -------------------------------------------------------------------------- */
function initVideoFilters() {
  const filterBtns = document.querySelectorAll('.video-filters .filter-btn');
  const videoCards = document.querySelectorAll('.videos-grid .video-card');

  if (!filterBtns.length || !videoCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      videoCards.forEach((card) => {
        const category = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || category.includes(filterVal)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 5.6. Interactive Video Players (Click-to-Play Facade)                      */
/* -------------------------------------------------------------------------- */
function initVideoPlayers() {
  const videoWrappers = document.querySelectorAll('.video-preview-wrapper');
  const isLocalFile = window.location.protocol === 'file:';

  videoWrappers.forEach((wrapper) => {
    const videoId = wrapper.getAttribute('data-video-id');
    const title = wrapper.getAttribute('data-video-title') || 'Research Video';
    const ytUrl = `https://youtu.be/${videoId}`;
    const hint = wrapper.querySelector('.video-play-hint');

    // YouTube blocks in-page iframe playback with Error 153 when run on local file://
    if (isLocalFile && hint) {
      hint.innerHTML = 'Watch on YouTube &nearr;';
      wrapper.setAttribute('title', 'Watch on YouTube (YouTube blocks embedded playback on local file:// files)');
    }

    wrapper.addEventListener('click', () => {
      if (!videoId) return;

      // When opening index.html directly from file://, open directly on YouTube to avoid Error 153
      if (isLocalFile) {
        showToast('Opening video on YouTube...');
        window.open(ytUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // On http:// or https:// (localhost or live host), embed the player in-page
      if (wrapper.querySelector('iframe')) return;

      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
      iframe.setAttribute('title', title);
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.className = 'video-embed-iframe';

      wrapper.innerHTML = '';
      wrapper.appendChild(iframe);
      wrapper.style.cursor = 'default';
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 6. Publications Search & Tag Filters                                       */
/* -------------------------------------------------------------------------- */
function initPublicationSearchAndFilters() {
  const searchInput = document.getElementById('pub-search-input');
  const filterBtns = document.querySelectorAll('.pub-filter-tags .pub-filter-btn');
  const pubItems = document.querySelectorAll('.pub-list .pub-item');
  const pubList = document.getElementById('pub-list');

  if (!pubItems.length) return;

  let currentCategory = 'all';
  let currentSearchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    pubItems.forEach((item) => {
      const year = item.getAttribute('data-year') || '';
      const isFirstAuthor = item.getAttribute('data-first-author') === 'true';
      const textContent = item.textContent.toLowerCase();
      const keywords = (item.getAttribute('data-keywords') || '').toLowerCase();

      // Check category match
      let matchesCategory = false;
      if (currentCategory === 'all') {
        matchesCategory = true;
      } else if (currentCategory === 'first-author') {
        matchesCategory = isFirstAuthor;
      } else if (currentCategory === year) {
        matchesCategory = true;
      }

      // Check search match
      let matchesSearch = true;
      if (currentSearchQuery.trim() !== '') {
        const query = currentSearchQuery.toLowerCase();
        matchesSearch = textContent.includes(query) || keywords.includes(query);
      }

      if (matchesCategory && matchesSearch) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Handle empty state
    let emptyState = document.getElementById('pub-empty-state');
    if (visibleCount === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'pub-empty-state';
        emptyState.style.padding = '36px';
        emptyState.style.textAlign = 'center';
        emptyState.style.color = 'var(--text-muted)';
        emptyState.innerHTML = '<p>No publications match your criteria. Try adjusting your search query or category filter.</p>';
        pubList.appendChild(emptyState);
      }
      emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  }

  // Category buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-pub-filter');
      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      applyFilters();
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 7. BibTeX Toggle & 1-Click Copy                                            */
/* -------------------------------------------------------------------------- */
function initBibTeXToggleAndCopy() {
  // Toggle BibTeX block
  document.querySelectorAll('.bibtex-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetBlock = document.getElementById(targetId);
      if (targetBlock) {
        const isOpen = targetBlock.classList.toggle('open');
        btn.textContent = isOpen ? 'Hide BibTeX' : 'BibTeX';
      }
    });
  });

  // Copy BibTeX citation
  document.querySelectorAll('.btn-copy-bib').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const codeElement = document.getElementById(targetId);
      if (codeElement) {
        const textToCopy = codeElement.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('BibTeX citation copied to clipboard!');
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 2000);
        }).catch(() => {
          showToast('Failed to copy to clipboard');
        });
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 8. 1-Click Copy Email Button                                               */
/* -------------------------------------------------------------------------- */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = copyBtn.getAttribute('data-clipboard');
    if (email) {
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email address copied to clipboard: ' + email);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      }).catch(() => {
        showToast('Unable to copy to clipboard');
      });
    }
  });
}

/* -------------------------------------------------------------------------- */
/* 9. Contact Form Handler (Mailto + Recruiter Feedback)                      */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');

  if (!form || !statusDiv) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name').value.trim();
    const email = document.getElementById('sender-email').value.trim();
    const type = document.getElementById('inquiry-type').value;
    const message = document.getElementById('sender-message').value.trim();

    if (!name || !email || !message) {
      statusDiv.className = 'form-feedback error';
      statusDiv.textContent = 'Please fill out all required fields before sending.';
      return;
    }

    // Build mailto link
    const subject = encodeURIComponent(`[${type}] Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Hello Samuel,\n\n${message}\n\nBest regards,\n${name}\nEmail: ${email}\nInquiry Type: ${type}`
    );
    const mailtoUrl = `mailto:hum3@illinois.edu?subject=${subject}&body=${body}`;

    // Show feedback and open mail client
    statusDiv.className = 'form-feedback success';
    statusDiv.innerHTML = `Opening your default email client... If your email client doesn't open automatically, you can email me directly at <a href="${mailtoUrl}"><strong>hum3@illinois.edu</strong></a>.`;
    
    showToast('Opening email client...');
    window.location.href = mailtoUrl;
  });
}

/* -------------------------------------------------------------------------- */
/* 10. Toast Notification Helper                                              */
/* -------------------------------------------------------------------------- */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* -------------------------------------------------------------------------- */
/* 11. Current Year in Footer                                                 */
/* -------------------------------------------------------------------------- */
function setCurrentYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/* -------------------------------------------------------------------------- */
/* 12. Methodology Iterative Loop Alignment                                   */
/* -------------------------------------------------------------------------- */
function initMethodologyLoop() {
  const step3 = document.getElementById('flow-step-3');
  const step4 = document.getElementById('flow-step-4');
  const wrapper = document.querySelector('.methodology-flow-wrapper');
  const loop = document.querySelector('.methodology-return-loop');

  if (!step3 || !step4 || !wrapper || !loop) return;

  function updateLoopPosition() {
    const wrapperRect = wrapper.getBoundingClientRect();
    const s3Rect = step3.getBoundingClientRect();
    const s4Rect = step4.getBoundingClientRect();

    const s3Center = (s3Rect.left + s3Rect.width / 2) - wrapperRect.left;
    const s4Center = (s4Rect.left + s4Rect.width / 2) - wrapperRect.left;
    loop.style.setProperty('--loop-left', `${s3Center}px`);
    loop.style.setProperty('--loop-width', `${s4Center - s3Center}px`);
  }

  updateLoopPosition();

  // ResizeObserver guarantees dynamic updates whenever layout or font sizes shift
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      updateLoopPosition();
    });
    ro.observe(wrapper);
  }

  window.addEventListener('resize', updateLoopPosition);
  window.addEventListener('orientationchange', updateLoopPosition);
  window.addEventListener('load', updateLoopPosition);
}
