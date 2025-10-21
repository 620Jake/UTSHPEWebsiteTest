// assets/javascript/about.js

// Run only on the About page
if (document.body.classList.contains('about')) {
  // --- Six Pillars: tab behavior & image swapping ---
  (function () {
    const container = document.getElementById('pillars');
    if (!container) return; // extra guard

    const tabs = Array.from(container.querySelectorAll('.pillars-tab'));
    const titleEl = container.querySelector('#pillar-title');
    const bodyEl  = container.querySelector('#pillar-body');
    const imgEl   = container.querySelector('#pillar-image');

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

    function activate(tab) {
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const newTitle = tab.dataset.title;
      const newImg   = tab.dataset.img;
      const newAlt   = tab.dataset.alt || newTitle;

      titleEl.textContent = newTitle;
      bodyEl.textContent  = copy[newTitle] || '';
      imgEl.src = newImg;
      imgEl.alt = newAlt;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === 'ArrowRight') { e.preventDefault(); const next = tabs[(i+1)%tabs.length]; next.focus(); activate(next); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); const prev = tabs[(i-1+tabs.length)%tabs.length]; prev.focus(); activate(prev); }
      });
    });

    // Preload images
    tabs.forEach(t => { const im = new Image(); im.src = t.dataset.img; });
  })();
}

