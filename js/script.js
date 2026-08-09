/* ====================================================================
   BÉNINSTAY — script.js
   Étape 2 : interactions frontend uniquement (aucun appel serveur).
   - Menu hamburger (mobile)
   - Navbar qui devient opaque au défilement
   - Recherche simulée (redirige vers appartements.html avec des
     paramètres dans l'URL, sans backend)
   - Petites interactions UI (boutons "Réserver" avec état de
     chargement, apparition douce des sections au scroll)
   ==================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------ */
  /* 1. MENU HAMBURGER (mobile)                                   */
  /* ------------------------------------------------------------ */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("is-open");
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // empêche le scroll du body quand le menu mobile est ouvert
      document.body.classList.toggle("no-scroll", isOpen);
    });

    // referme le menu automatiquement quand on clique sur un lien
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  /* ------------------------------------------------------------ */
  /* 2. NAVBAR OPAQUE AU DÉFILEMENT                                */
  /* ------------------------------------------------------------ */
  const navbar = document.getElementById("navbar");

  function updateNavbarOnScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
  }
  updateNavbarOnScroll(); // vérifie l'état au chargement (ex: retour en haut de page)
  window.addEventListener("scroll", updateNavbarOnScroll);

  /* ------------------------------------------------------------ */
  /* 3. RECHERCHE SIMULÉE                                          */
  /* ------------------------------------------------------------ */
  // Pour le moment il n'y a pas de backend : on redirige simplement
  // vers appartements.html en passant les critères dans l'URL.
  // La page appartements.html pourra lire ces paramètres plus tard
  // pour pré-remplir les filtres.
  const searchForm = document.getElementById("searchForm");

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const params = new URLSearchParams({
        localisation: document.getElementById("searchLocation").value,
        arrivee: document.getElementById("searchCheckin").value,
        depart: document.getElementById("searchCheckout").value,
        voyageurs: document.getElementById("searchGuests").value
      });

      window.location.href = "appartements.html?" + params.toString();
    });
  }

  /* ------------------------------------------------------------ */
  /* 4. APPARITION DOUCE DES SECTIONS AU SCROLL                    */
  /* ------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(
    ".apt-card, .dest-card, .feature, .gallery__item, .testimonial"
  );

  if ("IntersectionObserver" in window && revealTargets.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // ne joue l'animation qu'une fois
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------ */
  /* 5. FEEDBACK VISUEL SUR LES BOUTONS "RÉSERVER"                 */
  /* ------------------------------------------------------------ */
  // Petite interaction UI : au clic, le bouton affiche un court état
  // "chargement" avant de suivre le lien, pour un rendu plus premium.
  document.querySelectorAll('a.btn--gold[href="reservation.html"]').forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      if (btn.classList.contains("is-loading")) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      btn.classList.add("is-loading");
      btn.textContent = "Chargement…";

      setTimeout(function () {
        window.location.href = btn.getAttribute("href");
      }, 350);
    });
  });

  /* ------------------------------------------------------------ */
  /* 6. ESPACE UTILISATEUR — simulation via localStorage           */
  /*    (aucun backend : les comptes sont stockés dans le          */
  /*    navigateur de la personne, à titre de démonstration)       */
  /* ------------------------------------------------------------ */

  const USERS_KEY = "beninstay_users";
  const SESSION_KEY = "beninstay_session";

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ nom: user.nom, email: user.email }));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  // --- Onglets Connexion / Inscription ---
  const authTabs = document.querySelectorAll(".auth__tab");
  const authForms = document.querySelectorAll(".auth__form");

  function activateAuthTab(target) {
    authTabs.forEach(function (tab) {
      tab.classList.toggle("is-active", tab.dataset.target === target);
    });
    authForms.forEach(function (form) {
      form.classList.toggle("is-active", form.id === target);
    });
  }

  authTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateAuthTab(tab.dataset.target);
    });
  });

  // ouvre directement l'onglet Inscription si l'URL contient ?onglet=inscription
  const urlAuthTab = new URLSearchParams(window.location.search).get("onglet");
  if (urlAuthTab === "inscription") activateAuthTab("formInscription");

  function showAuthMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "auth__message is-visible auth__message--" + type;
  }

  // --- Formulaire d'inscription ---
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const nom = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const phone = document.getElementById("regPhone").value.trim();
      const password = document.getElementById("regPassword").value;
      const messageEl = document.getElementById("registerMessage");

      const users = getUsers();
      const exists = users.some(function (u) { return u.email === email; });

      if (exists) {
        showAuthMessage(messageEl, "Un compte existe déjà avec cet e-mail. Essayez de vous connecter.", "error");
        return;
      }
      if (password.length < 6) {
        showAuthMessage(messageEl, "Le mot de passe doit contenir au moins 6 caractères.", "error");
        return;
      }

      users.push({ nom: nom, email: email, telephone: phone, password: password });
      saveUsers(users);
      setSession({ nom: nom, email: email });

      showAuthMessage(messageEl, "Compte créé avec succès. Bienvenue " + nom + " !", "success");
      updateAuthNav();

      setTimeout(function () { window.location.href = "index.html"; }, 900);
    });
  }

  // --- Formulaire de connexion ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;
      const messageEl = document.getElementById("loginMessage");

      const users = getUsers();
      const user = users.find(function (u) { return u.email === email && u.password === password; });

      if (!user) {
        showAuthMessage(messageEl, "E-mail ou mot de passe incorrect.", "error");
        return;
      }

      setSession(user);
      showAuthMessage(messageEl, "Connexion réussie. À bientôt " + user.nom + " !", "success");
      updateAuthNav();

      setTimeout(function () { window.location.href = "index.html"; }, 700);
    });
  }

  // --- Zone "compte" dans la navbar, sur toutes les pages ---
  function updateAuthNav() {
    const slot = document.getElementById("navAuthSlot");
    if (!slot) return;
    const session = getSession();

    if (session) {
      slot.innerHTML =
        '<span class="navbar__user"><a href="mon-compte.html">Bonjour, ' + session.nom.split(" ")[0] +
        '</a> <button type="button" id="logoutBtn">Déconnexion</button></span>';

      document.getElementById("logoutBtn").addEventListener("click", function () {
        clearSession();
        updateAuthNav();
        window.location.href = "index.html";
      });
    } else {
      slot.innerHTML = '<a href="compte.html" class="navbar__login">Connexion</a>';
    }
  }

  updateAuthNav();

  /* ------------------------------------------------------------ */
  /* 7. LIGHTBOX — galerie photo (detail.html)                     */
  /* ------------------------------------------------------------ */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const galleryButtons = document.querySelectorAll("#detailGallery [data-full]");

  if (lightbox && lightboxImage && galleryButtons.length) {
    galleryButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        lightboxImage.src = btn.getAttribute("data-full");
        lightboxImage.alt = btn.querySelector("img") ? btn.querySelector("img").alt : "";
        lightbox.hidden = false;
        document.body.classList.add("no-scroll");
      });
    });

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImage.src = "";
      document.body.classList.remove("no-scroll");
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ------------------------------------------------------------ */
  /* 8. FORMULAIRE DE CONTACT (contact.html)                       */
  /*    Simulation frontend : aucun serveur pour l'instant.        */
  /* ------------------------------------------------------------ */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const successEl = document.getElementById("contactSuccess");

      contactForm.hidden = true;
      if (successEl) successEl.hidden = false;
    });
  }

  /* ------------------------------------------------------------ */
  /* 9. RÉSERVATION — récapitulatif + historique (reservation.html)*/
  /* ------------------------------------------------------------ */
  const RESERVATIONS_KEY = "beninstay_reservations";

  function getReservations() {
    try {
      return JSON.parse(localStorage.getItem(RESERVATIONS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveReservation(res) {
    const all = getReservations();
    all.push(res);
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(all));
  }

  function nightsBetween(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  const reservationForm = document.getElementById("reservationForm");
  if (reservationForm) {
    const PRICE_PER_NIGHT = 35000;
    const APARTMENT_NAME = "Résidence Aïda";
    const APARTMENT_LOCATION = "Fidjrossè, Cotonou";

    reservationForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const nom = document.getElementById("resName").value.trim();
      const telephone = document.getElementById("resPhone").value.trim();
      const checkin = document.getElementById("resCheckin").value;
      const checkout = document.getElementById("resCheckout").value;
      const guests = document.getElementById("resGuests").value;
      const message = document.getElementById("resMessage").value.trim();

      const nights = nightsBetween(checkin, checkout);
      const total = nights * PRICE_PER_NIGHT;

      document.getElementById("summaryName").textContent = nom;
      document.getElementById("summaryPhone").textContent = telephone;
      document.getElementById("summaryCheckin").textContent = checkin;
      document.getElementById("summaryCheckout").textContent = checkout;
      document.getElementById("summaryGuests").textContent = guests + (guests === "1" ? " voyageur" : " voyageurs");
      document.getElementById("summaryNights").textContent = nights + (nights === 1 ? " nuit" : " nuits");
      document.getElementById("summaryTotal").textContent = total.toLocaleString("fr-FR") + " FCFA";

      const waText = encodeURIComponent(
        "Bonjour, je souhaite réserver " + APARTMENT_NAME + " (" + APARTMENT_LOCATION + ")\n" +
        "Nom : " + nom + "\nTéléphone : " + telephone + "\n" +
        "Arrivée : " + checkin + "\nDépart : " + checkout + "\n" +
        "Voyageurs : " + guests + "\nTotal estimé : " + total.toLocaleString("fr-FR") + " FCFA" +
        (message ? "\nMessage : " + message : "")
      );
      const whatsappBtn = document.getElementById("whatsappConfirm");
      if (whatsappBtn) whatsappBtn.href = "https://wa.me/2290163076934?text=" + waText;

      // sauvegarde dans l'historique, rattachée au compte connecté le cas échéant
      const session = getSession();
      saveReservation({
        appartement: APARTMENT_NAME,
        localisation: APARTMENT_LOCATION,
        nom: nom,
        telephone: telephone,
        checkin: checkin,
        checkout: checkout,
        guests: guests,
        nights: nights,
        total: total,
        email: session ? session.email : null,
        date: new Date().toISOString()
      });

      document.getElementById("reservationStep").hidden = true;
      document.getElementById("reservationSummary").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const summaryEdit = document.getElementById("summaryEdit");
    if (summaryEdit) {
      summaryEdit.addEventListener("click", function () {
        document.getElementById("reservationSummary").hidden = true;
        document.getElementById("reservationStep").hidden = false;
      });
    }
  }

  /* ------------------------------------------------------------ */
  /* 10. HISTORIQUE DES RÉSERVATIONS (mon-compte.html)              */
  /* ------------------------------------------------------------ */
  const historyList = document.getElementById("historyList");
  if (historyList) {
    const session = getSession();

    if (!session) {
      window.location.href = "compte.html";
    } else {
      const myReservations = getReservations()
        .filter(function (r) { return r.email === session.email; })
        .reverse();

      const emptyState = document.getElementById("historyEmpty");
      const greeting = document.getElementById("accountGreeting");
      if (greeting) greeting.textContent = session.nom.split(" ")[0];

      if (!myReservations.length) {
        if (emptyState) emptyState.hidden = false;
      } else {
        historyList.innerHTML = myReservations.map(function (r) {
          return (
            '<article class="history-card">' +
              '<div class="history-card__main">' +
                '<h3>' + r.appartement + '</h3>' +
                '<p class="history-card__loc">📍 ' + r.localisation + '</p>' +
                '<div class="history-card__dates">' +
                  '<span>' + r.checkin + ' → ' + r.checkout + '</span>' +
                  '<span>' + r.nights + (r.nights === 1 ? ' nuit' : ' nuits') + '</span>' +
                  '<span>' + r.guests + (r.guests === "1" ? ' voyageur' : ' voyageurs') + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="history-card__side">' +
                '<strong>' + r.total.toLocaleString("fr-FR") + ' FCFA</strong>' +
                '<span class="history-card__status">En attente de confirmation</span>' +
              '</div>' +
            '</article>'
          );
        }).join("");
      }

      const logoutAccountBtn = document.getElementById("accountLogout");
      if (logoutAccountBtn) {
        logoutAccountBtn.addEventListener("click", function () {
          clearSession();
          window.location.href = "index.html";
        });
      }
    }
  }

});