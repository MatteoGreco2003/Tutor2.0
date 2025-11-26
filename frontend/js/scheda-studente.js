// ==========================================
// SCHEDA STUDENTE - JavaScript
// ==========================================

// ======= BLOCCA BACK BUTTON =======
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ===== GLOBAL VARIABLES =====
let studenteID = null;
let token = null;
let currentStudenteData = null;

// ==========================================
// SETUP ON LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  window.addEventListener("pageshow", () => {
    if (!localStorage.getItem("token")) window.location.href = "/";
  });

  const urlParams = new URLSearchParams(window.location.search);
  studenteID = urlParams.get("studenteID");

  if (!studenteID) {
    showError("ID studente non valido");
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  // ===== LOAD DATA =====
  await loadStudenteData();
  await loadAnnotazioni();
  await loadVerificheStorico();
  await loadVerificheFuture();

  // ===== SETUP LISTENERS =====
  setupEventListeners();
  setupLogout();
  setupModalListeners();
});

// ==========================================
// LOGOUT HANDLER
// ==========================================

function setupLogout() {
  document
    .querySelector(".logout-btn")
    ?.addEventListener("click", async function () {
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
        } else {
          alert("Errore durante il logout");
        }
      } catch (error) {
        console.error("Errore logout:", error);
        alert("Errore durante il logout");
      }
    });
}

// ==========================================
// LOAD FUNCTIONS
// ==========================================

async function loadStudenteData() {
  try {
    const response = await fetch(`/tutor/studenti/${studenteID}/riepilogo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && data.studente) {
      currentStudenteData = data.studente;
      renderStudenteInfo(currentStudenteData);
      renderMaterie(data.materie?.lista || []);
    } else {
      showError(data.message || "Errore nel caricamento dei dati");
    }
  } catch (error) {
    console.error("Errore caricamento dati:", error);
    showError("Errore di connessione al server");
  }
}

async function loadAnnotazioni() {
  try {
    const response = await fetch(`/tutor/studenti/${studenteID}/annotazioni`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data.annotazioni)) {
      renderAnnotazioni(data.annotazioni);
    } else {
      renderAnnotazioni([]);
    }
  } catch (error) {
    console.error("Errore caricamento annotazioni:", error);
    renderAnnotazioni([]);
  }
}

async function loadVerificheStorico() {
  try {
    const response = await fetch(
      `/tutor/studenti/${studenteID}/verifiche/storico`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data.verifiche)) {
      renderVerificheStorico(data.verifiche);
    } else {
      renderVerificheStorico([]);
    }
  } catch (error) {
    console.error("Errore caricamento verifiche storico:", error);
    renderVerificheStorico([]);
  }
}

async function loadVerificheFuture() {
  try {
    const response = await fetch(
      `/tutor/studenti/${studenteID}/verifiche/future`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok && Array.isArray(data.verifiche)) {
      renderVerificheFuture(data.verifiche);
    } else {
      renderVerificheFuture([]);
    }
  } catch (error) {
    console.error("Errore caricamento verifiche future:", error);
    renderVerificheFuture([]);
  }
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderStudenteInfo(studente) {
  document.getElementById(
    "studenteName"
  ).textContent = `${studente.nome} ${studente.cognome}`;
  document.getElementById("studenteEmail").textContent = studente.email || "-";
  document.getElementById("studenteScuola").textContent =
    studente.scuola || "-";
  document.getElementById("studenteIndirizzo").textContent =
    studente.indirizzo || "-";

  const studenteAvatar = document.getElementById("studenteAvatar");
  studenteAvatar.textContent = studente.nome?.charAt(0).toUpperCase() || "S";
}

function renderMaterie(materie) {
  const container = document.getElementById("materieContent");

  if (!materie || materie.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <p>Nessuna materia associata</p>
      </div>
    `;
    return;
  }

  container.innerHTML = materie
    .map((materia) => {
      // ✅ LOGICA DEI COLORI
      let colorMedia = "#a0a0a0"; // grigino (default SV)
      let mediaDisplay = materia.media || "SV";

      if (mediaDisplay !== "SV") {
        const media = parseFloat(mediaDisplay);
        if (media < 6) {
          colorMedia = "#ff4444"; // rosso
        } else if (media < 8) {
          colorMedia = "#f59e0b"; // giallino
        } else {
          colorMedia = "#10b981"; // verde
        }
      }

      return `
        <div class="materia-item">
          <div class="materia-header">
            <div class="materia-name">${escapeHtml(materia.nome)}</div>
            <div class="materia-media" style="background-color: ${colorMedia}; color: white;">
              ${mediaDisplay}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderVerificheStorico(verifiche) {
  const container = document.getElementById("storicoContent");
  document.getElementById("countStorico").textContent = verifiche
    ? verifiche.length
    : 0;

  if (!verifiche || verifiche.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>Nessuna verifica nel passato</p>
      </div>
    `;
    return;
  }

  container.innerHTML = verifiche
    .map((verifica) => {
      const data = new Date(verifica.data);
      const formattedDate = data.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let colorVoto = "#10b981";
      if (verifica.voto < 6) {
        colorVoto = "#ff4444";
      } else if (verifica.voto < 8) {
        colorVoto = "#f59e0b";
      }

      return `
        <div class="verifica-item">
          <div class="verifica-header">
            <div class="verifica-info">
              <div class="verifica-materia">${escapeHtml(
                verifica.materialID?.nome || "Materia sconosciuta"
              )}</div>
              <div class="verifica-data">
              <i class="fas fa-calendar"></i>
              ${formattedDate}
            </div>
            </div>
            <div class="verifica-voto" style="background-color: ${colorVoto};">
              ${verifica.voto}
            </div>
          </div>
          <div class="verifica-footer">
           
            <div class="verifica-argomento">${escapeHtml(
              verifica.argomento
            )}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderVerificheFuture(verifiche) {
  const container = document.getElementById("futureContent");
  document.getElementById("countFuture").textContent = verifiche
    ? verifiche.length
    : 0;

  if (!verifiche || verifiche.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar"></i>
        <p>Nessuna verifica pianificata</p>
      </div>
    `;
    return;
  }

  container.innerHTML = verifiche
    .map((verifica) => {
      const data = new Date(verifica.data);
      const formattedDate = data.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return `
        <div class="verifica-item">
          <div class="verifica-header">
            <div class="verifica-info">
              <div class="verifica-materia">${escapeHtml(
                verifica.materialID?.nome || "Materia sconosciuta"
              )}</div>
              <div class="verifica-data">
              <i class="fas fa-calendar"></i>
              ${formattedDate}
            </div>
             
            </div>
            <div class="verifica-voto" style="background-color: #a0a0a0;">
              DA FARE
            </div>
          </div>
          <div class="verifica-footer">
            <div class="verifica-argomento">${escapeHtml(
              verifica.argomento
            )}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAnnotazioni(annotazioni) {
  const container = document.getElementById("annotazioniContent");

  if (!annotazioni || annotazioni.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-sticky-note"></i>
        <p>Nessuna annotazione</p>
      </div>
    `;
    return;
  }

  container.innerHTML = annotazioni
    .map((ann) => {
      const data = new Date(ann.data);
      const formattedDate = data.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return `
      <div class="annotation-item">
        <div class="annotation-header">
          <div class="annotation-text">${escapeHtml(ann.testo)}</div>
        </div>
        <div class="annotation-date">
          <i class="fas fa-calendar-alt"></i>
          ${formattedDate}
        </div>
        <div class="annotation-actions">
          <button class="btn-action btn-action-danger" onclick="deleteAnnotazione('${
            ann._id
          }')" title="Elimina annotazione">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function openAddAnnotazioneModal() {
  document.getElementById("addAnnotazioneModal").classList.add("show");
  document.body.classList.add("modal-open");
  document.getElementById("annotazioneText").focus();
}

function closeAddAnnotazioneModal() {
  document.getElementById("addAnnotazioneModal").classList.remove("show");
  document.body.classList.remove("modal-open");
  document.getElementById("annotazioneText").value = "";
  document.getElementById("charCount").textContent = "0";
}

function openAddMateriaModal() {
  document.getElementById("addMateriaModal").classList.add("show");
  document.body.classList.add("modal-open");
  document.getElementById("materiaName").focus();
}

function closeAddMateriaModal() {
  document.getElementById("addMateriaModal").classList.remove("show");
  document.body.classList.remove("modal-open");
  document.getElementById("materiaName").value = "";
  document.getElementById("materiaMedio").value = "";
}

// ==========================================
// MODAL EVENT LISTENERS
// ==========================================

function setupModalListeners() {
  window.addEventListener("click", function (event) {
    const addAnnotazioneModal = document.getElementById("addAnnotazioneModal");
    const addMateriaModal = document.getElementById("addMateriaModal");

    if (event.target === addAnnotazioneModal) {
      closeAddAnnotazioneModal();
    }
    if (event.target === addMateriaModal) {
      closeAddMateriaModal();
    }
  });

  document.querySelectorAll(".btn-secondary").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (this.closest("#addAnnotazioneModal")) {
        closeAddAnnotazioneModal();
      }
      if (this.closest("#addMateriaModal")) {
        closeAddMateriaModal();
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAddAnnotazioneModal();
      closeAddMateriaModal();
    }
  });
}

// ==========================================
// FORM SUBMISSION FUNCTIONS
// ==========================================

async function saveAnnotazione(event) {
  event.preventDefault();

  const testo = document.getElementById("annotazioneText").value.trim();

  if (!testo) {
    showError("Inserisci il testo dell'annotazione");
    return;
  }

  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Salvataggio...";

    // ✅ ROUTE CORRETTA
    const response = await fetch(`/tutor/studenti/${studenteID}/annotazioni`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        testo: testo,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("✅ Annotazione salvata con successo");
      closeAddAnnotazioneModal();
      await loadAnnotazioni();
    } else {
      showError("❌ " + (data.message || "Errore nel salvataggio"));
    }

    btn.disabled = false;
    btn.textContent = originalText;
  } catch (error) {
    console.error("Errore salvataggio annotazione:", error);
    showError("❌ Errore di connessione al server");
  }
}

// ==========================================
// DELETE FUNCTIONS
// ==========================================

async function deleteAnnotazione(annotazioneID) {
  if (!confirm("Sei sicuro di voler eliminare questa annotazione?")) {
    return;
  }

  try {
    // ✅ ROUTE CORRETTA
    const response = await fetch(
      `/tutor/studenti/${studenteID}/annotazioni/${annotazioneID}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      showSuccess("✅ Annotazione eliminata");
      await loadAnnotazioni();
    } else {
      showError("❌ Errore nell'eliminazione");
    }
  } catch (error) {
    console.error("Errore eliminazione annotazione:", error);
    showError("❌ Errore di connessione");
  }
}

function deleteMateria(materiaID) {
  if (!confirm("Sei sicuro di voler eliminare questa materia?")) {
    return;
  }

  try {
    showSuccess("✅ Materia eliminata");
  } catch (error) {
    console.error("Errore eliminazione materia:", error);
    showError("❌ Errore di connessione");
  }
}

function editMateria(materiaID, nome, media) {
  console.log("Edit materia:", materiaID, nome, media);
  showInfo("ℹ️ Funzionalità di modifica in sviluppo");
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================

function setupEventListeners() {
  document.querySelector(".btn-back")?.addEventListener("click", function () {
    window.history.back();
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function goBack() {
  window.history.back();
}

function logoutUser() {
  try {
    fetch("/auth/logout", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    localStorage.removeItem("token");
    window.location.href = "/";
  } catch (error) {
    console.error("Errore logout:", error);
    localStorage.removeItem("token");
    window.location.href = "/";
  }
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================

function showSuccess(message) {
  console.log(message);
  alert(message);
}

function showError(message) {
  console.error(message);
  alert(message);
}

function showInfo(message) {
  console.info(message);
  alert(message);
}

// ==========================================
// PAGE UNLOAD HANDLER
// ==========================================

window.addEventListener("pageshow", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "/";
  }
});
