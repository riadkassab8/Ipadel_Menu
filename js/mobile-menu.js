(() => {
  const header = document.querySelector('.site-header');
  const desktopNav = header?.querySelector('.main-nav');
  const desktopLanguage = header?.querySelector('[data-language-toggle]');
  if (!header || !desktopNav || !desktopLanguage || header.querySelector('.mobile-menu-trigger')) return;

  const trigger = document.createElement('button');
  trigger.className = 'mobile-menu-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'mobile-menu-panel');
  trigger.setAttribute('aria-label', 'Open menu');
  trigger.innerHTML = '<span class="menu-racket" aria-hidden="true"><svg viewBox="0 0 42 48"><ellipse cx="20" cy="17" rx="12" ry="15"></ellipse><path d="M14 29 8 43M25 29l6 14M12 43h20"></path><circle class="racket-ball" cx="34" cy="8" r="3"></circle></svg></span><span class="menu-trigger-word">MENU</span><span class="menu-trigger-bars" aria-hidden="true"><i></i><i></i><i></i></span>';

  const panel = document.createElement('section');
  panel.className = 'mobile-menu-panel';
  panel.id = 'mobile-menu-panel';
  panel.setAttribute('aria-hidden', 'true');
  const links = [...desktopNav.querySelectorAll('a')].map(link => link.cloneNode(true));
  const nav = document.createElement('nav');
  nav.className = 'mobile-menu-links';
  nav.setAttribute('aria-label', 'Mobile navigation');
  links.forEach((link, index) => { link.classList.add('mobile-menu-link'); link.style.setProperty('--menu-index', index); nav.append(link); });
  const language = desktopLanguage.cloneNode(true);
  language.className = 'mobile-menu-language';
  language.setAttribute('aria-label', 'Switch language');
  panel.innerHTML = '<div class="menu-court-label"><span>IPADEL / MENU COURT</span><strong>OPEN PLAY</strong></div><span class="menu-ball-trail" aria-hidden="true"></span><span class="menu-ball" aria-hidden="true"></span>';
  panel.append(nav, language);
  header.append(trigger, panel);

  const setOpen = open => {
    header.classList.toggle('mobile-menu-open', open);
    document.body.classList.toggle('mobile-menu-locked', open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.setAttribute('aria-hidden', String(!open));
  };
  trigger.addEventListener('click', () => setOpen(!header.classList.contains('mobile-menu-open')));
  panel.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 680) setOpen(false); });
})();