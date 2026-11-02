import { profile, skills, education, certificates } from './data.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeSocialUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
};

const render = () => {
  document.querySelector('[data-about-copy]').textContent = profile.about;
  const emailLink = document.querySelector('#email-link');
  emailLink.href = `mailto:${encodeURIComponent(profile.email).replace('%40', '@')}`;
  emailLink.innerHTML = `${escapeHtml(profile.email)} <span aria-hidden="true">↗</span>`;
  document.querySelector('#skill-groups').innerHTML = skills.map((group, index) => `<article class="skill-group reveal"><header class="skill-group-header"><span class="skill-group-title">${escapeHtml(group.group)}</span><span class="skill-group-index">0${index + 1}</span></header><div class="skill-badges">${group.items.map((item) => `<div class="skill-badge"><img src="/assets/skills/${escapeHtml(item.icon)}.svg" alt="" aria-hidden="true" loading="lazy" /><span>${escapeHtml(item.name)}</span></div>`).join('')}</div></article>`).join('');
  document.querySelector('#education-list').innerHTML = education.map((item, index) => `<article class="record-item record-education"><div class="record-entry-top"><span class="record-sequence">0${index + 1}</span><span class="record-meta">${escapeHtml(item.level)}</span><span class="record-period">${escapeHtml(item.period)}</span></div><h4>${escapeHtml(item.program)}</h4><p class="record-school"><span aria-hidden="true">↗</span>${escapeHtml(item.school)}</p></article>`).join('');
  document.querySelector('#certificate-list').innerHTML = certificates.map((item, index) => `<article class="record-item record-training"><div class="record-entry-top"><span class="record-sequence">0${index + 1}</span><span class="record-period">${escapeHtml(item.date)}</span></div><h4>${escapeHtml(item.title)}</h4></article>`).join('');
  document.querySelector('#social-links').innerHTML = profile.socials.map((social) => {
    const url = safeSocialUrl(social.url);
    return url
      ? `<a class="social-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(social.label)} ↗</a>`
      : '';
  }).join('');
  document.querySelector('#current-year').textContent = String(new Date().getFullYear());
};

render();

// A small design team builds selected copy and icons as the visitor scrolls down.
const buildTargets = [...document.querySelectorAll(
  '.hero h1, .hero-description, main section .section-heading h2, [data-about-copy], .section-note, .capability-item strong, .project-title, .project-description, .service-card h3, .service-card p, .skills-title h3, .skill-group-title, .skill-badge, .process-item h3, .process-item p, .contact-heading > p:last-child, .contact-aside-title'
)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && buildTargets.length) {
  const builder = document.createElement('div');
  builder.className = 'builder-overlay';
  builder.setAttribute('aria-hidden', 'true');
  builder.innerHTML = `
    <div class="builder-hud"><span class="builder-live-dot"></span><span>LIVE BUILD</span><b>3 DESIGNERS</b></div>
    <div class="builder-frame"><i class="frame-center-x"></i><i class="frame-center-y"></i><span class="builder-dimensions"></span></div>
    <div class="builder-cursor builder-cursor--type"><svg viewBox="0 0 22 28"><path d="M2 1.5 20 18l-8 .8-4 7.2L2 1.5Z"/></svg><span>TYPE</span></div>
    <div class="builder-cursor builder-cursor--measure"><svg viewBox="0 0 22 28"><path d="M2 1.5 20 18l-8 .8-4 7.2L2 1.5Z"/></svg><span>MEASURE</span></div>
    <div class="builder-cursor builder-cursor--draw"><svg viewBox="0 0 22 28"><path d="M2 1.5 20 18l-8 .8-4 7.2L2 1.5Z"/></svg><span>DRAW</span></div>`;
  document.body.append(builder);

  const typeCursor = builder.querySelector('.builder-cursor--type');
  const measureCursor = builder.querySelector('.builder-cursor--measure');
  const drawCursor = builder.querySelector('.builder-cursor--draw');
  const frame = builder.querySelector('.builder-frame');
  const dimensions = builder.querySelector('.builder-dimensions');
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const moveCursor = (cursor, x, y) => {
    cursor.classList.add('is-visible');
    cursor.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  };

  const prepareText = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);

    const characters = [];
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      for (const character of textNode.nodeValue) {
        const span = document.createElement('span');
        span.className = 'type-char';
        span.textContent = character;
        fragment.append(span);
        characters.push({ span, character });
      }
      textNode.replaceWith(fragment);
    });

    if (characters.length) {
      element.classList.add('typewriter');
      element.__buildCharacters = characters;
    }
  };

  buildTargets.forEach(prepareText);
  const setFrame = (target) => {
    const rect = target.getBoundingClientRect();
    frame.style.left = `${Math.max(3, rect.left)}px`;
    frame.style.top = `${Math.max(3, rect.top)}px`;
    frame.style.width = `${Math.max(8, Math.min(window.innerWidth - 6, rect.right) - Math.max(3, rect.left))}px`;
    frame.style.height = `${Math.max(8, Math.min(window.innerHeight - 6, rect.bottom) - Math.max(3, rect.top))}px`;
    dimensions.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)} PX`;
  };

  const buildIcon = async (target) => {
    const card = target.closest('.service-card');
    const icon = card?.querySelector('.service-icon');
    if (!icon || icon.dataset.built) return;
    icon.dataset.built = 'true';
    icon.querySelectorAll('path, rect, circle, line').forEach((shape) => {
      try {
        const length = shape.getTotalLength();
        shape.style.strokeDasharray = String(length);
        shape.style.strokeDashoffset = String(length);
      } catch { /* Keep unsupported SVG shapes visible. */ }
    });
    const rect = icon.getBoundingClientRect();
    moveCursor(drawCursor, rect.left, rect.top);
    await wait(160);
    icon.classList.add('is-building-icon');
    moveCursor(drawCursor, rect.right, rect.top + rect.height / 2);
    await wait(220);
    moveCursor(drawCursor, rect.left + rect.width / 2, rect.bottom);
    await wait(320);
    icon.classList.add('is-built-icon');
    drawCursor.classList.remove('is-visible');
  };

  const buildQueue = [];
  let isBuilding = false;
  const buildNext = async () => {
    if (isBuilding || !buildQueue.length) return;
    isBuilding = true;
    const target = buildQueue.shift();
    const characters = target.__buildCharacters || [];
    const inView = () => {
      const rect = target.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    if (!inView()) {
      characters.forEach(({ span }) => span.classList.add('is-typed'));
      target.classList.add('type-complete');
      isBuilding = false;
      if (buildQueue.length) buildNext(); else builder.classList.remove('is-active');
      return;
    }

    target.classList.add('type-started');
    builder.classList.add('is-active');
    frame.classList.add('is-active');
    setFrame(target);

    const measureTask = (async () => {
      const rect = target.getBoundingClientRect();
      const corners = [[rect.right, rect.top], [rect.right, rect.bottom], [rect.left, rect.bottom], [rect.left, rect.top]];
      for (let round = 0; round < 2; round += 1) {
        for (const [x, y] of corners) {
          setFrame(target);
          moveCursor(measureCursor, x, y);
          await wait(135);
        }
      }
    })();

    const textTask = (async () => {
      for (const current of characters) {
        if (!inView()) {
          characters.forEach(({ span }) => span.classList.add('is-typed'));
          break;
        }
        current.span.classList.add('is-typed');
        const rect = current.span.getBoundingClientRect();
        moveCursor(typeCursor, rect.right, rect.bottom - 2);
        setFrame(target);
        const pause = /[,.!?;:]/.test(current.character) ? 125 : current.character === ' ' ? 28 : 20;
        await wait(pause);
      }
      target.classList.add('type-complete');
    })();

    const iconTask = buildIcon(target);
    await Promise.all([measureTask, textTask, iconTask]);
    await wait(220);
    frame.classList.remove('is-active');
    [typeCursor, measureCursor, drawCursor].forEach((cursor) => cursor.classList.remove('is-visible'));
    isBuilding = false;
    if (buildQueue.length) buildNext(); else builder.classList.remove('is-active');
  };

  const queueBuild = (element) => {
    if (element.classList.contains('type-started') || element.dataset.buildQueued) return;
    element.dataset.buildQueued = 'true';
    buildQueue.push(element);
    buildNext();
  };
  const startVisibleBuilds = () => buildTargets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) queueBuild(element);
  });

  let scrollingDown = window.scrollY > 0;
  let previousScrollY = window.scrollY;
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > previousScrollY) {
      scrollingDown = true;
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          startVisibleBuilds();
          scrollTicking = false;
        });
      }
    }
    previousScrollY = currentScrollY;
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const buildObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && scrollingDown) {
          queueBuild(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    buildTargets.forEach((element) => buildObserver.observe(element));
  }
}

// Reveal content only when motion is allowed; the observer is disconnected for reduced motion.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

// A smooth segmented snake follows the pointer on desktop.
const pointerMode = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (pointerMode && !reduceMotion) {
  const snakeParts = Array.from({ length: 13 }, (_, index) => {
    const node = document.createElement('span');
    node.className = `cursor-snake-part${index === 0 ? ' cursor-snake-head' : ''}`;
    node.setAttribute('aria-hidden', 'true');
    document.body.append(node);
    return { node, x: 0, y: 0, speed: index === 0 ? 0.38 : Math.max(0.19, 0.36 - index * 0.012), size: Math.max(5, 15 - index * 0.78) };
  });
  let targetX = 0;
  let targetY = 0;
  let snakeFrame = 0;
  let snakeVisible = false;
  let initialized = false;
  const positionPart = (part, angle = 0) => {
    part.node.style.width = `${part.size}px`;
    part.node.style.height = `${Math.max(5, part.size * 0.72)}px`;
    part.node.style.transform = `translate3d(${part.x}px, ${part.y}px, 0) rotate(${angle}rad)`;
  };
  const animateSnake = () => {
    snakeFrame = 0;
    let moving = false;
    snakeParts.forEach((part, index) => {
      const leader = index === 0 ? null : snakeParts[index - 1];
      const nextX = leader ? leader.x : targetX + 13;
      const nextY = leader ? leader.y : targetY + 13;
      const dx = nextX - part.x;
      const dy = nextY - part.y;
      part.x += dx * part.speed;
      part.y += dy * part.speed;
      const angle = leader ? Math.atan2(leader.y - part.y, leader.x - part.x) : 0;
      positionPart(part, angle);
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) moving = true;
    });
    if (moving) snakeFrame = window.requestAnimationFrame(animateSnake);
  };
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!initialized) {
      snakeParts.forEach((part, index) => {
        part.x = targetX + 13 - index * 3;
        part.y = targetY + 13 + index * 1.2;
        positionPart(part);
      });
      initialized = true;
    }
    if (!snakeVisible) {
      snakeVisible = true;
      snakeParts.forEach(({ node }) => node.classList.add('is-visible'));
    }
    if (!snakeFrame) snakeFrame = window.requestAnimationFrame(animateSnake);
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    snakeVisible = false;
    snakeParts.forEach(({ node }) => node.classList.remove('is-visible'));
  });
}

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { setMenu(false); menuButton.focus(); } });
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

const sectionLinks = [...document.querySelectorAll('.nav-link')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) sectionLinks.forEach((link) => {
        const active = link.hash === `#${entry.target.id}`;
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        link.classList.toggle('active', active);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

document.querySelector('.back-top').addEventListener('click', () => document.querySelector('#home').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

const toast = document.querySelector('#toast');
let toastTimer;
const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
};

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const fields = [...form.querySelectorAll('input, textarea')];
const errorFor = (field) => form.querySelector(`[data-error-for="${field.name}"]`);
const validate = (field) => {
  const value = field.value.trim();
  let message = '';
  if (!value) message = 'Please complete this field.';
  else if (field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Enter a valid email address.';
  else if (field.minLength > 0 && value.length < field.minLength) message = `Please enter at least ${field.minLength} characters.`;
  if (message) { field.setAttribute('aria-invalid', 'true'); errorFor(field).textContent = message; }
  else { field.removeAttribute('aria-invalid'); errorFor(field).textContent = ''; }
  return !message;
};
fields.forEach((field) => field.addEventListener('blur', () => validate(field)));
form.addEventListener('input', (event) => {
  if (event.target.matches('input, textarea') && event.target.hasAttribute('aria-invalid')) validate(event.target);
  status.textContent = '';
  status.classList.remove('error');
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = fields.filter((field) => !validate(field));
  if (invalid.length) {
    status.textContent = 'Please check the highlighted fields.';
    status.classList.add('error');
    invalid[0].focus();
    return;
  }
  status.textContent = 'Validation passed. Demo mode only: nothing was sent. Replace the sample email address or connect an email service to receive messages.';
  status.classList.remove('error');
  showToast('Demo mode — your message was not sent.');
});
