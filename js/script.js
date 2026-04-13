/**
 * ============================================================
 * PORTFOLIO — MOTEUR PRINCIPAL
 * Direction D "Ops" · Patrice COTCHO
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('./data/data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Render all sections in new order
    renderStats(data);
    renderProjects(data.realisations_techniques);
    renderSkills(data.competences);
    renderExperiences(data.experiences_pro, data.autres_experiences);
    renderEducation(data.formations);
    renderCertifs(data.certifications);
    renderPassions(data.passions);

    // UI interactions
    initScrollReveal();
    initProjectStagger();
    initScrollSpy();
    initMobileNav();
    initContactForm();

  } catch (err) {
    console.error('[Portfolio] Échec du chargement :', err);
  }
});

/* ============================================================
   RENDER — STATS HERO (dynamiques depuis le JSON)
   ============================================================ */
function renderStats(data) {
  const expCount  = (data.experiences_pro?.length ?? 0)
                  + (data.autres_experiences?.length ?? 0);
  const projCount = data.realisations_techniques?.length ?? 0;

  const pad = n => String(n).padStart(2, '0');

  const elExp  = document.getElementById('stat-exp');
  const elProj = document.getElementById('stat-proj');
  if (elExp)  elExp.textContent  = pad(expCount);
  if (elProj) elProj.textContent = pad(projCount);
}

/* ============================================================
   RENDER — PROJETS
   ============================================================ */
function renderProjects(projects) {
  const el = document.getElementById('projects-grid');
  if (!el || !projects) return;

  el.innerHTML = projects.map((p, i) => {
    const isGH = p.source?.toLowerCase() === 'github';
    const sourceClass = isGH ? 'source--github' : 'source--linkedin';
    const sourceIcon  = isGH ? 'fa-github' : 'fa-linkedin';
    const linkLabel   = isGH ? 'Voir le code' : 'Voir la publication';

    return `
      <div class="proj-card" style="transition-delay:${i * 60}ms">
        <div class="proj-img-wrap">
          <img
            src="${p.image || 'assets/img/placeholder.jpg'}"
            alt="${p.titre}"
            class="proj-img"
            loading="lazy"
            onerror="this.style.opacity='0'"
          >
          <span class="proj-source-badge ${sourceClass}">
            <i class="fab ${sourceIcon}"></i>${p.source}
          </span>
        </div>
        <div class="proj-body">
          <h3 class="proj-title">${p.titre}</h3>
          <div class="proj-tags">
            ${p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}
          </div>
          <p class="proj-desc">${p.description}</p>
          ${p.lien && p.lien !== '#' ? `
            <a href="${p.lien}" target="_blank" rel="noopener noreferrer" class="proj-link">
              <i class="fab ${sourceIcon}"></i>${linkLabel}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   RENDER — COMPÉTENCES
   ============================================================ */
function renderSkills(competences) {
  const el = document.getElementById('skills-grid');
  if (!el || !competences) return;

  const meta = {
    infrastructures_reseaux:  { icon: 'fa-network-wired', title: 'réseaux & infrastructure' },
    cybersecurite:            { icon: 'fa-shield-halved',  title: 'cybersécurité' },
    systemes_virtualisation:  { icon: 'fa-server',         title: 'systèmes & virtualisation' },
    developpement_scripting:  { icon: 'fa-terminal',       title: 'développement & scripting' }
  };

  el.innerHTML = Object.entries(competences)
    .filter(([k]) => meta[k])
    .map(([k, list]) => {
      const m = meta[k];
      return `
        <div class="skill-card">
          <div class="skill-header">
            <div class="skill-header-dots">
              <div class="skill-dot"></div>
              <div class="skill-dot"></div>
              <div class="skill-dot"></div>
            </div>
            <span class="skill-header-title">${m.title}</span>
            <i class="fas ${m.icon} skill-header-icon"></i>
          </div>
          <div class="skill-body">
            ${list.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
}

/* ============================================================
   RENDER — EXPÉRIENCES (deux sous-sections)
   ============================================================ */
function renderExperiences(exps, autres) {
  const el = document.getElementById('exp-list');
  if (!el) return;

  // Le container parent ne doit pas porter la bordure timeline lui-même
  el.classList.remove('timeline-wrap');
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.gap = '56px';

  const buildItems = arr => arr.map(e => `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <span class="tl-period">${e.periode}</span>
      <h3 class="tl-title">${e.poste}</h3>
      <p class="tl-sub">${e.entreprise} · ${e.lieu}</p>
      ${e.missions?.length ? `
        <ul class="tl-missions">
          ${e.missions.map(m => `<li>${m}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');

  // Bloc 1 — expériences techniques
  const techBlock = exps?.length ? `
    <div>
      <div class="col-label mono" style="margin-bottom:24px;">Expériences techniques</div>
      <div class="timeline-wrap">${buildItems(exps)}</div>
    </div>
  ` : '';

  // Bloc 2 — expérience complémentaire
  const autreBlock = autres?.length ? `
    <div>
      <div class="col-label mono" style="margin-bottom:24px;">Expérience complémentaire</div>
      <div class="timeline-wrap">${buildItems(autres)}</div>
    </div>
  ` : '';

  el.innerHTML = techBlock + autreBlock;
}

/* ============================================================
   RENDER — FORMATIONS (timeline)
   ============================================================ */
function renderEducation(formations) {
  const el = document.getElementById('edu-list');
  if (!el || !formations) return;

  el.innerHTML = formations.map(f => `
    <div class="tl-item">
      <div class="tl-dot"></div>
      <span class="tl-period">${f.periode}</span>
      <h3 class="tl-title">${f.diplome}</h3>
      <p class="tl-sub">${f.etablissement} · ${f.lieu}</p>
    </div>
  `).join('');
}

/* ============================================================
   RENDER — CERTIFICATIONS
   ============================================================ */
function renderCertifs(certifs) {
  const el = document.getElementById('certif-list');
  if (!el || !certifs) return;

  el.innerHTML = certifs.map(c => `
    <div class="certif-item">
      <div>
        <div class="certif-name">${c.nom}</div>
        <div class="certif-org">${c.entreprise}</div>
      </div>
      <span class="certif-year">${c.date}</span>
    </div>
  `).join('');
}

/* ============================================================
   RENDER — PASSIONS
   ============================================================ */
function renderPassions(passions) {
  const el = document.getElementById('passions-list');
  if (!el || !passions) return;

  el.innerHTML = passions.map(p => `
    <div class="passion-item">
      <div class="passion-name">${p.nom}</div>
      <div class="passion-detail">${p.detail}</div>
    </div>
  `).join('');
}

/* ============================================================
   UI — SCROLL REVEAL (sections standard)
   ============================================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ============================================================
   UI — PROJECT CARDS STAGGER (separate observer)
   ============================================================ */
function initProjectStagger() {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );

  // Run after a tick so renderProjects() has injected the DOM
  requestAnimationFrame(() => {
    document.querySelectorAll('.proj-card').forEach(card => obs.observe(card));
  });
}

/* ============================================================
   UI — SCROLL SPY (highlight active nav link)
   ============================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    let current = '';
    const y = window.pageYOffset;

    sections.forEach(s => {
      if (y >= s.offsetTop - 130) current = s.id;
    });

    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ============================================================
   UI — MOBILE NAV (burger menu)
   ============================================================ */
function initMobileNav() {
  const burger  = document.getElementById('nav-burger');
  const navList = document.getElementById('nav-links');
  if (!burger || !navList) return;

  const toggle = () => {
    const isOpen = navList.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(isOpen));
  };

  burger.addEventListener('click', toggle);

  // Close on link click
  navList.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', () => {
      navList.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ============================================================
   UI — CONTACT FORM (Formspree async)
   ============================================================ */
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const btn    = document.getElementById('submit-btn');
  if (!form || !status || !btn) return;

  const origLabel = btn.innerHTML;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours…';
    btn.disabled  = true;
    status.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        status.textContent = '✓ Message envoyé — je vous réponds rapidement.';
        status.style.color = 'var(--success)';
        form.reset();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      status.textContent = '✕ Erreur lors de l\'envoi. Veuillez réessayer.';
      status.style.color = 'var(--danger)';
    } finally {
      btn.innerHTML = origLabel;
      btn.disabled  = false;
    }
  });
}
