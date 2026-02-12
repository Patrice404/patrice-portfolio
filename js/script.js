/**
 * GESTIONNAIRE D'ANIMATION (Réutilisable)
 */
const observeElements = () => {
    const observerOptions = {
        threshold: 0.1 // L'animation se déclenche quand 10% de l'élément est visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Une fois visible, on peut arrêter d'observer l'élément
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // On cible TOUS les éléments qui ont la classe fade-in
    const targets = document.querySelectorAll('.fade-in');
    targets.forEach(el => observer.observe(el));
};

/**
 * CHARGEMENT DES DONNÉES PORTFOLIO
 */
async function loadPortfolioData() {
    const expContainer = document.getElementById('experience-grid');
    const projectContainer = document.getElementById('project-grid');
    
    // On ne s'exécute que si on est sur la page Portfolio
    if (!expContainer && !projectContainer) return;

    try {
        const response = await fetch('./data/data.json');
        if (!response.ok) throw new Error("Erreur JSON");
        const data = await response.json();

        if (expContainer) {
            expContainer.innerHTML = data.experiences_pro.map(exp => `
                <div class="experience-card">
                    <div class="exp-info">
                        <h3>${exp.poste}</h3>
                        <span class="company">${exp.entreprise} | ${exp.lieu}</span>
                        <p class="period">${exp.periode || ""}</p>
                        <ul>${exp.missions.map(m => `<li>${m}</li>`).join('')}</ul>
                    </div>
                </div>
            `).join('');
        }

        if (projectContainer) {
            projectContainer.innerHTML = data.realisations_techniques.map(pro => {
                const linkHTML = pro.lien && pro.lien !== "#" 
                    ? `<a href="${pro.lien}" target="_blank" class="btn-project">Voir sur ${pro.source} ↗</a>` 
                    : `<span class="btn-project disabled">Lien bientôt disponible</span>`;

                return `
                    <div class="project-card fade-in">
                        <div class="project-image">
                            <img src="${pro.image || 'assets/img/placeholder.jpg'}" alt="${pro.titre}">
                        </div>
                        <div class="project-content">
                            <div class="tags">${pro.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
                            <h3>${pro.titre}</h3>
                            <p>${pro.description}</p>
                            ${linkHTML}
                        </div>
                    </div>`;
            }).join('');
        }
                observeElements(); // On lance l'animation après l'injection
    } catch (e) { console.error("Erreur Portfolio:", e); }
}

/**
 * CHARGEMENT DES DONNÉES À PROPOS
 */
async function loadAboutData() {
    const bioContainer = document.getElementById('detailed-bio');
    // On vérifie si on est sur la page "À Propos" pour éviter les erreurs console
    if (!bioContainer) return; 

    try {
        const response = await fetch('./data/data.json');
        if (!response.ok) throw new Error("Erreur lors du chargement du JSON");
        const data = await response.json();

        // 1. Bio détaillée (Parcours INSA et profil)
        bioContainer.innerText = data.parcours_detaille;

        // 2. Compétences (Systèmes, Sécurité, Réseaux)
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) {
            skillsContainer.innerHTML = Object.entries(data.competences).map(([cat, list]) => `
                <div class="skill-category">
                    <h3>${cat.toUpperCase()}</h3>
                    <div class="skill-tags">${list.map(s => `<span class="skill-pill">${s}</span>`).join('')}</div>
                </div>
            `).join('');
        }

        // 3. Formations (Génération dynamique de ton cursus académique)
        const formationContainer = document.querySelector('.education-list');
        if (formationContainer && data.formations) {
            formationContainer.innerHTML = data.formations.map(f => `
                <div class="edu-item">
                    <span class="year">${f.periode}</span>
                    <h3>${f.diplome}</h3>
                    <p>${f.etablissement} — ${f.lieu}</p>
                </div>
            `).join('');
        }

        // 4. Certifications (SecNumAcadémie, etc.)
        const certList = document.getElementById('certifications-list');
        if (certList && data.certifications) {
            certList.innerHTML = data.certifications.map(c => `
                <div class="cert-item fade-in">
                    <strong>${c.nom}</strong>
                    <span class="cert-issuer"> — ${c.entreprise}</span>
                    <span style="float:right; font-weight:bold; color:var(--primary-color)">${c.date}</span>
                </div>
            `).join('');
        }

       
        // 5. Passions
        const passionList = document.getElementById('passions-list');
        if (passionList) {
            passionList.innerHTML = data.passions.map(p => `
                <div class="passion-item"><strong>${p.nom} :</strong> ${p.detail}</div>
            `).join('');
        }

        // Relancer les animations sur les nouveaux éléments injectés
        if (typeof observeElements === "function") {
            observeElements();
        }

    } catch (e) { 
        console.error("Erreur lors du chargement de la page About:", e); 
    }
}



const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Vérification visuelle (UX)
        const recaptchaResponse = grecaptcha.getResponse();
        if (recaptchaResponse.length === 0) {
            formStatus.innerHTML = "⚠️ Merci de cocher la case 'Je ne suis pas un robot'.";
            formStatus.style.color = "#ff4d4d";
            return; 
        }


        const data = new FormData(contactForm);
        const btn = contactForm.querySelector('button');
        
        btn.innerText = "Envoi en cours...";
        btn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.innerHTML = "Merci ! Votre message a bien été reçu.";
                formStatus.style.color = "#00d4ff";
                contactForm.reset();
                grecaptcha.reset();
            } else {
                // Si Formspree rejette (souvent à cause du captcha ou spam)
                const jsonData = await response.json();
                if (jsonData.errors) {
                    formStatus.innerHTML = "❌ Erreur : " + jsonData.errors.map(err => err.message).join(", ");
                } else {
                    formStatus.innerHTML = "❌ Erreur lors de l'envoi.";
                }
                formStatus.style.color = "#ff4d4d";
            }
        } catch (error) {
            formStatus.innerHTML = "Erreur de connexion au service d'envoi.";
            formStatus.style.color = "#ff4d4d";
        } finally {
            btn.innerText = "Envoyer le message";
            btn.disabled = false;
        }
    });
}




/**
 * INITIALISATION GÉNÉRALE
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- GESTION MENU ACTIF ---

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPath = link.getAttribute('href');

        // Si le nom du fichier correspond, on ajoute la classe 'active'
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Lancement des chargements
    loadPortfolioData();
    loadAboutData();
    observeElements(); // Pour les éléments déjà présents dans le HTML (Hero)
});

window.addEventListener('load', observeElements);