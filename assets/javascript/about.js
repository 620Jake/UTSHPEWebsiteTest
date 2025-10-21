// assets/javascript/about.js
if (document.body.classList.contains('about')) {
  (function () {
    const container = document.getElementById('pillars');
    if (!container) return;

    const tabs = Array.from(container.querySelectorAll('.pillars-tab'));
    const titleEl = container.querySelector('#pillar-title');
    const bodyEl  = container.querySelector('#pillar-body');
    const imgEl   = container.querySelector('#pillar-image');
    const contentEl = container.querySelector('.pillars-content');

    // Announce content updates for assistive tech
    contentEl.setAttribute('role', 'region');
    contentEl.setAttribute('aria-live', 'polite');

    // Ensure each tab has an id for aria-labelledby
    tabs.forEach((t, i) => { if (!t.id) t.id = `pillar-tab-${i+1}`; });

    const copy = {
      'Academic Development':
        'The Academic Development pillar focuses on study success and connecting members to chapter & campus resources.',
      'Chapter Development':
        'Chapter Development builds familia through socials, transitions, and a welcoming culture.',
      'Community Outreach':
        'Community Outreach serves Austin through volunteer events that bond members while giving back.',
      'Leadership Development':
        'Leadership Development grows confident leaders via shadowing, mentorship, and recruiting.',
      'Professional Development':
        'Professional Development prepares members for internships & full-time roles with workshops and events.',
      'Technical Development':
        'Technical Development hones hands-on skills—coding, CAD, hardware, and more—through projects & trainings.'
    };

    function fadeSwap(img, newSrc, newAlt) {
      // Respect reduced motion
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) img.style.opacity = '0';
      const onload = () => {
        img.alt = newAlt;
        if (!reduce) requestAnimationFrame(() => { img.style.opacity = '1'; });
        img.removeEventListener('load', onload);
      };
      img.addEventListener('load', onload);
      img.src = newSrc;
    }

    function activate(tab, {focusPanel=false} = {}) {
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.setAttribute('tabindex', active ? '0' : '-1');
      });

      const newTitle = tab.dataset.title;
      const newImg   = tab.dataset.img;
      const newAlt   = tab.dataset.alt || newTitle;

      titleEl.textContent = newTitle;
      bodyEl.textContent  = copy[newTitle] || '';

      // Link region to the active tab for SR context
      contentEl.setAttribute('aria-labelledby', tab.id);

      // Swap image with a gentle fade
      fadeSwap(imgEl, newImg, newAlt);

      if (focusPanel) contentEl.focus({ preventScroll: true });
    }

    // Clicks
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activate(tab, {focusPanel:false}));
    });

    // Keyboard: arrows, Home/End, Enter/Space
    tabs.forEach((tab) => {
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        let next;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            next = tabs[(i + 1) % tabs.length];
            next.focus(); activate(next);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            next = tabs[(i - 1 + tabs.length) % tabs.length];
            next.focus(); activate(next);
            break;
          case 'Home':
            e.preventDefault();
            tabs[0].focus(); activate(tabs[0]);
            break;
          case 'End':
            e.preventDefault();
            tabs[tabs.length - 1].focus(); activate(tabs[tabs.length - 1]);
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            activate(tab, {focusPanel:true});
            break;
        }
      });
    });

    // Preload images to reduce flicker
    tabs.forEach(t => { const im = new Image(); im.src = t.dataset.img; });

    // Ensure one is active on load
    activate(tabs.find(t => t.classList.contains('is-active')) || tabs[0]);
  })();
}
