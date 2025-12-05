// ==========================================
// MEDIE MATERIE - TUTOR 2.0
// ==========================================

// ===== HAMBURGER MENU (inizializzazione fuori da DOMContentLoaded) =====
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (!hamburgerBtn || !sidebar || !sidebarOverlay) return;

  // Toggle menu
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hamburgerBtn.classList.toggle("active");
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });

  // Chiudi cliccando su overlay
  sidebarOverlay.addEventListener("click", closeSidebar);

  // Chiudi cliccando su item sidebar
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", closeSidebar);
  });

  // Chiudi con tasto Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  function closeSidebar() {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }
}

// Inizializza menu al caricamento
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}

// ==========================================
// LOGICA PRINCIPALE
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  // Recupera token da localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // Verifica token quando la pagina diventa visibile (es. dopo tab switch)
  window.addEventListener("pageshow", () => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  });

  // ===== ELEMENTI DOM =====
  const mediaList = document.getElementById("mediaList");
  const deleteProfileModal = document.getElementById("deleteProfileModal");
  const visualizzaVerificheModal = document.getElementById(
    "visualizzaVerificheModal"
  );
  const verificheListModal = document.getElementById("verificheListModal");
  const modalVerificheTitle = document.getElementById("modalVerificheTitle");

  let allMaterieData = [];
  let materiaSelezionata = null;

  // ===== CARICA DATI STUDENTE E AGGIORNA HEADER =====
  async function caricaDatiStudente() {
    try {
      const response = await fetch("/student/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok && data.data) {
        const { nome, cognome } = data.data;
        document.querySelector(
          ".header-title"
        ).textContent = `${nome} ${cognome}`;

        const userIcon = document.querySelector(".user-icon");
        userIcon.textContent = nome.charAt(0).toUpperCase();
      }
    } catch (error) {
      console.error("❌ Errore caricamento dati studente:", error);
    }
  }

  // ===== CARICA MATERIE CON MEDIA =====
  async function fetchMaterieConMedia() {
    try {
      const res = await fetch("/test/materie-media", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.materieConMedia)) {
        allMaterieData = data.materieConMedia;
        renderMaterieMedia(data.materieConMedia);
        updateStats(data.materieConMedia);
      } else {
        console.error("❌ Errore nella risposta:", data);
        mostraEmptyState("Errore nel caricamento materie");
      }
    } catch (error) {
      console.error("❌ Errore fetch materie:", error);
      mostraEmptyState("Errore nel caricamento");
    }
  }

  // ===== RENDERIZZA LISTA MATERIE =====
  function renderMaterieMedia(materie) {
    mediaList.innerHTML = "";

    if (!materie || materie.length === 0) {
      mostraEmptyState("Nessuna materia registrata");
      return;
    }

    materie.forEach((materia) => {
      const mediaValore = materia.media || 0;
      const numeroVerifiche = materia.numeroVerifiche || 0;

      // Determina come visualizzare la media
      const mediaDisplay =
        numeroVerifiche === 0 ? "SV" : mediaValore.toFixed(2);

      // Determina stato sufficienza
      let sufficenzaClass = "no-voti";
      let sufficenzaTesto = "Nessun voto";

      if (numeroVerifiche > 0) {
        sufficenzaClass =
          materia.sufficienza === "Sufficiente"
            ? "sufficiente"
            : "insufficiente";
        sufficenzaTesto = materia.sufficienza;
      }

      // Crea elemento card
      const item = document.createElement("div");
      item.className = "media-item";
      item.innerHTML = `
        <div class="media-info">
          <div class="media-icon">${mediaDisplay}</div>
          <div class="media-details">
            <div class="media-materia">${materia.nome}</div>
            <div class="media-verifiche">
              <i class="fas fa-file-alt"></i> ${numeroVerifiche} 
              ${numeroVerifiche === 1 ? "verifica" : "verifiche"}
            </div>
          </div>
        </div>

        <div class="media-stats">
          <div class="sufficienza-badge ${sufficenzaClass}">
            ${sufficenzaTesto}
          </div>
          <button 
            class="btn-visualizza-verifiche" 
            title="Visualizza verifiche" 
            data-materia-id="${materia.id}"
            ${numeroVerifiche === 0 ? "disabled" : ""}
          >
            Visualizza Verifiche
          </button>
        </div>
      `;

      mediaList.appendChild(item);
    });
  }

  // ===== MOSTRA EMPTY STATE =====
  function mostraEmptyState(messaggio) {
    mediaList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${messaggio}</p>
      </div>
    `;
  }

  // ===== AGGIORNA STATISTICHE GENERALI =====
  function updateStats(materie) {
    let mediaGenerale = 0;
    let materieSufficienti = 0;
    let materieInsufficenti = 0;

    let totalMedia = 0;
    let conVoti = 0;

    materie.forEach((materia) => {
      if (materia.numeroVerifiche > 0) {
        totalMedia += materia.media;
        conVoti++;

        if (materia.sufficienza === "Sufficiente") {
          materieSufficienti++;
        } else {
          materieInsufficenti++;
        }
      }
    });

    if (conVoti > 0) {
      mediaGenerale = (totalMedia / conVoti).toFixed(2);
    }

    // Aggiorna DOM
    document.getElementById("mediaGenerale").textContent = mediaGenerale;
    document.getElementById("materieSufficienti").textContent =
      materieSufficienti;
    document.getElementById("materieInsufficenti").textContent =
      materieInsufficenti;
  }

  // ===== LOGOUT =====
  document.querySelector(".logout-btn").addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("❌ Errore logout:", error);
    }
  });

  // ========== MODALE ELIMINA PROFILO ==========

  // Apri modale
  document.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProfileModal.classList.add("show");
    document.body.classList.add("modal-open");
  });

  // Chiudi con X
  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", chiudiDeleteModal);

  // Chiudi con Annulla
  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", chiudiDeleteModal);

  // Chiudi cliccando fuori
  window.addEventListener("click", (event) => {
    if (event.target === deleteProfileModal) {
      chiudiDeleteModal();
    }
  });

  function chiudiDeleteModal() {
    deleteProfileModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  // Conferma eliminazione profilo
  document
    .getElementById("confirmDeleteProfile")
    .addEventListener("click", async () => {
      try {
        const response = await fetch("/student/profile", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (response.ok) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("❌ Errore eliminazione profilo:", error);
      }
    });

  // ========== MODALE VISUALIZZA VERIFICHE ==========

  // Apri modale verifiche
  function apriVisualizzaVerificheModal(materiaId, materiaNome) {
    materiaSelezionata = materiaId;
    modalVerificheTitle.textContent = `Verifiche di ${materiaNome}`;

    fetchVerifichePerMateria(materiaId);

    visualizzaVerificheModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  // Chiudi modale verifiche
  function chiudiVisualizzaVerificheModal() {
    visualizzaVerificheModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    verificheListModal.innerHTML = "";
    materiaSelezionata = null;
  }

  // Event listener chiusura
  document
    .getElementById("closeVisualizzaVerifiche")
    .addEventListener("click", chiudiVisualizzaVerificheModal);

  document
    .getElementById("chiudiVisualizzaVerifiche")
    .addEventListener("click", chiudiVisualizzaVerificheModal);

  window.addEventListener("click", (event) => {
    if (event.target === visualizzaVerificheModal) {
      chiudiVisualizzaVerificheModal();
    }
  });

  // ===== CARICA VERIFICHE PER MATERIA =====
  async function fetchVerifichePerMateria(materiaId) {
    try {
      const res = await fetch(`/test/materia/${materiaId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.verifiche)) {
        renderVerifichePerMateria(data.verifiche);
      } else {
        console.error("❌ Errore nella risposta:", data);
        mostraEmptyStateModal("Nessuna verifica trovata");
      }
    } catch (error) {
      console.error("❌ Errore caricamento verifiche:", error);
      mostraEmptyStateModal("Errore nel caricamento");
    }
  }

  // ===== RENDERIZZA VERIFICHE NEL MODALE =====
  function renderVerifichePerMateria(verifiche) {
    verificheListModal.innerHTML = "";

    if (!verifiche || !Array.isArray(verifiche) || verifiche.length === 0) {
      mostraEmptyStateModal("Nessuna verifica trovata");
      return;
    }

    verifiche.forEach((verifica) => {
      try {
        // Formatta data: "20 novembre 2025"
        const data = new Date(verifica.data);
        const giorno = data.getDate();
        const mesi = [
          "gennaio",
          "febbraio",
          "marzo",
          "aprile",
          "maggio",
          "giugno",
          "luglio",
          "agosto",
          "settembre",
          "ottobre",
          "novembre",
          "dicembre",
        ];
        const mese = mesi[data.getMonth()];
        const anno = data.getFullYear();

        // Formatta voto
        const voto =
          verifica.voto !== null && verifica.voto !== undefined
            ? verifica.voto
            : "Non ancora";
        const votoClass = verifica.voto !== null ? "" : "no-voto";

        // Argomento
        const argomento = verifica.argomento || "Argomento non disponibile";

        // Crea card verifica
        const item = document.createElement("div");
        item.className = "verifica-item-modal";
        item.innerHTML = `
          <div class="verifica-header">
            <div class="verifica-data-section">
              <div class="verifica-data-giorno">${giorno}</div>
              <div class="verifica-data-mese">${mese} ${anno}</div>
            </div>
            <div class="verifica-voto-section">
              <div class="verifica-voto-label">Voto</div>
              <div class="verifica-voto-value ${votoClass}">${voto}</div>
            </div>
          </div>

          <div class="verifica-argomento-modal">${argomento}</div>
        `;

        verificheListModal.appendChild(item);
      } catch (errore) {
        console.error("❌ Errore rendering verifica:", errore);
      }
    });
  }

  // ===== MOSTRA EMPTY STATE NEL MODALE =====
  function mostraEmptyStateModal(messaggio) {
    verificheListModal.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>${messaggio}</p>
      </div>
    `;
  }

  // ===== EVENT LISTENER PULSANTI VISUALIZZA VERIFICHE =====
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-visualizza-verifiche:not(:disabled)")) {
      const btn = e.target.closest(".btn-visualizza-verifiche");
      const materiaId = btn.getAttribute("data-materia-id");

      // Recupera nome materia dal DOM
      const materiaItem = btn.closest(".media-item");
      const materiaNome =
        materiaItem.querySelector(".media-materia").textContent;

      apriVisualizzaVerificheModal(materiaId, materiaNome);
    }
  });

  // ===== CARICA DATI ALL'AVVIO =====
  caricaDatiStudente();
  fetchMaterieConMedia();
});
