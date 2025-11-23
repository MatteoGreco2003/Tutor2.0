// ==========================================
// MEDIE MATERIE - TUTOR 2.0
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ===== VERIFICA TOKEN =====
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // ===== CONTROLLA TOKEN QUANDO PAGINA RITORNA VISIBILE =====
  window.addEventListener("pageshow", (event) => {
    const checkToken = localStorage.getItem("token");

    if (!checkToken) {
      window.location.href = "/";
      return;
    }
  });

  const mediaList = document.getElementById("mediaList");
  const deleteProfileModal = document.getElementById("deleteProfileModal");

  let allMaterieData = [];

  // ===== CARICA NOME & COGNOME NELL'HEADER =====
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
      document.querySelector(
        ".header-title"
      ).textContent = `${data.data.nome} ${data.data.cognome}`;
      const userIcon = document.querySelector(".user-icon");
      userIcon.textContent = data.data.nome.charAt(0).toUpperCase();
      userIcon.style.backgroundColor = "#9e3ffd";
    }
  } catch (error) {
    console.error("Errore caricamento dati studente:", error);
  }

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
        mediaList.innerHTML = `<div class="empty-state">...`;
      }
    } catch (error) {
      console.error("❌ Errore fetch:", error);
    }
  }

  function renderMaterieMedia(materie) {
    mediaList.innerHTML = "";

    if (materie.length === 0) {
      mediaList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nessuna materia registrata</p>
      </div>
    `;
      return;
    }

    materie.forEach((materia) => {
      const mediaValore = materia.media || 0;
      const sufficienza = materia.sufficienza;
      const numeroVerifiche = materia.numeroVerifiche || 0;

      // Mostra "S.V." se non ci sono voti, altrimenti mostra la media
      const mediaDisplay =
        numeroVerifiche === 0 ? "SV" : mediaValore.toFixed(2);

      // Determina il colore della sufficienza
      let sufficenzaClass = "no-voti";
      let sufficenzaTesto = "Nessun voto";

      if (numeroVerifiche > 0) {
        sufficenzaClass =
          sufficienza === "Sufficiente" ? "sufficiente" : "insufficiente";
        sufficenzaTesto = sufficienza;
      }

      const item = document.createElement("div");
      item.className = "media-item";
      item.innerHTML = `
      <div class="media-info">
        <div class="media-icon">${mediaDisplay}</div>
        <div class="media-details">
          <div class="media-materia">${materia.nome}</div>
          <div class="media-verifiche">
            <i class="fas fa-file-alt"></i> ${numeroVerifiche} ${
        numeroVerifiche === 1 ? "verifica" : "verifiche"
      }
          </div>
        </div>
      </div>

      <div class="media-stats">
        
        <div class="sufficienza-badge ${sufficenzaClass}">
          ${sufficenzaTesto}
        </div>
        <button class="btn-visualizza-verifiche" title="Visualizza verifiche" data-materia-id="${
          materia.id
        }" ${numeroVerifiche === 0 ? "disabled" : ""}>
          Visualizza Verifiche
        </button>
      </div>
    `;

      mediaList.appendChild(item);
    });
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

  // ===== LOGOUT / DISCONNETTITI =====
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
      console.error("Errore durante il logout:", error);
      alert("Errore durante il logout");
    }
  });

  // ===== MODALE ELIMINA PROFILO - APRI =====
  document.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProfileModal.classList.add("show");
    document.body.classList.add("modal-open");
  });

  // ===== MODALE ELIMINA PROFILO - CHIUDI (X) =====
  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  // ===== MODALE ELIMINA PROFILO - CHIUDI (Annulla) =====
  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  // ===== MODALE ELIMINA PROFILO - CHIUDI (click fuori) =====
  window.addEventListener("click", (event) => {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
  });

  // ===== CONFERMA ELIMINA PROFILO =====
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
          alert("Profilo eliminato con successo");
          window.location.href = "/";
        } else {
          alert(data.message || "Errore nell'eliminazione del profilo");
        }
      } catch (error) {
        console.error("Errore eliminazione profilo:", error);
        alert("Errore di connessione al server");
      }
    });

  // ===== MODALE VISUALIZZA VERIFICHE =====
  const visualizzaVerificheModal = document.getElementById(
    "visualizzaVerificheModal"
  );
  const closeVisualizzaVerifiche = document.getElementById(
    "closeVisualizzaVerifiche"
  );
  const chiudiVisualizzaVerifiche = document.getElementById(
    "chiudiVisualizzaVerifiche"
  );
  const verificheListModal = document.getElementById("verificheListModal");
  const modalVerificheTitle = document.getElementById("modalVerificheTitle");

  let materiaSelezionata = null;

  // ===== APRI MODALE VISUALIZZA VERIFICHE =====
  function apriVisualizzaVerificheModal(materiaId, materiaNome) {
    materiaSelezionata = materiaId;
    modalVerificheTitle.textContent = `Verifiche di ${materiaNome}`;

    fetchVerifichePerMateria(materiaId);

    visualizzaVerificheModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  // ===== CHIUDI MODALE VISUALIZZA VERIFICHE =====
  function chiudiVisualizzaVerificheModal() {
    visualizzaVerificheModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    verificheListModal.innerHTML = "";
    materiaSelezionata = null;
  }

  closeVisualizzaVerifiche.addEventListener(
    "click",
    chiudiVisualizzaVerificheModal
  );
  chiudiVisualizzaVerifiche.addEventListener(
    "click",
    chiudiVisualizzaVerificheModal
  );

  window.addEventListener("click", (event) => {
    if (event.target === visualizzaVerificheModal) {
      chiudiVisualizzaVerificheModal();
    }
  });

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
        verificheListModal.innerHTML = `
        <div class="empty-state-modal">
          <i class="fas fa-inbox"></i>
          <p>Nessuna verifica trovata</p>
        </div>
      `;
      }
    } catch (error) {
      console.error("❌ Errore caricamento verifiche:", error);
      verificheListModal.innerHTML = `
      <div class="empty-state-modal">
        <i class="fas fa-exclamation-circle"></i>
        <p>Errore nel caricamento</p>
      </div>
    `;
    }
  }

  // ===== RENDERIZZA VERIFICHE PER MATERIA =====
  function renderVerifichePerMateria(verifiche) {
    verificheListModal.innerHTML = "";

    if (!verifiche || !Array.isArray(verifiche) || verifiche.length === 0) {
      verificheListModal.innerHTML = `
      <div class="empty-state-modal">
        <i class="fas fa-inbox"></i>
        <p>Nessuna verifica trovata</p>
      </div>
    `;
      return;
    }

    verifiche.forEach((verifica) => {
      try {
        // Formatta la data: "20 novembre 2025"
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

        // Voto formattato
        const voto =
          verifica.voto !== null && verifica.voto !== undefined
            ? verifica.voto
            : "Non ancora";
        const votoClass = verifica.voto !== null ? "" : "no-voto";

        // Argomento
        const argomento = verifica.argomento || "Argomento non disponibile";

        const item = document.createElement("div");
        item.className = "verifica-item-modal";
        item.innerHTML = `
        <!-- INTESTAZIONE: Data e Voto -->
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

        <!-- ARGOMENTO SOTTO -->
        <div class="verifica-argomento-modal">${argomento}</div>
      `;

        verificheListModal.appendChild(item);
      } catch (errore) {
        console.error("❌ Errore rendering verifica:", errore);
      }
    });
  }

  // ===== AGGIUNGI EVENT LISTENER AI PULSANTI VISUALIZZA =====
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-visualizza-verifiche:not(:disabled)")) {
      const btn = e.target.closest(".btn-visualizza-verifiche");
      const materiaId = btn.getAttribute("data-materia-id");

      // Trova il nome della materia dal DOM
      const materiaItem = btn.closest(".media-item");
      const materiaNome =
        materiaItem.querySelector(".media-materia").textContent;

      apriVisualizzaVerificheModal(materiaId, materiaNome);
    }
  });

  // ===== CARICA DATI ALL'AVVIO =====
  fetchMaterieConMedia();
});
