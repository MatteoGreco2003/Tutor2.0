// ==========================================
// SCHEDA STUDENTE - JavaScript
// ==========================================

// ======= BLOCCA BACK BUTTON =======
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ===== FUNZIONE BACK AL PORTFOLIO =====
function goBack() {
  window.location.href = "/home-tutor";
}

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
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  // ===== LOAD DATA =====
  await loadStudenteData();
  await loadAnnotazioni();
  await loadVerificheStorico();
  await loadVerificheFuture();

  // ===== SETUP LISTENERS =====
  setupLogout();
  setupAnnotazioneModal();
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
        }
      } catch (error) {
        console.error("Errore logout:", error);
      }
    });
}

// ==========================================
// SETUP ANNOTAZIONE MODAL
// ==========================================

function setupAnnotazioneModal() {
  const addAnnotazioneModal = document.getElementById("addAnnotazioneModal");
  const addAnnotazioneForm = document.getElementById("addAnnotazioneForm");
  const annotazioneText = document.getElementById("annotazioneText");
  const submitBtn = addAnnotazioneForm.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById("cancelAddAnnotazione");
  const closeBtn = document.getElementById("closeAddAnnotazione");
  const errorDiv = document.getElementById("addAnnotazioneError");

  // Apri modal quando clicchi bottone add-annotazione
  document
    .getElementById("addAnnotazioneBtn")
    ?.addEventListener("click", () => {
      resetAnnotazioneForm();
      addAnnotazioneModal.classList.add("show");
      document.body.classList.add("modal-open");
      errorDiv.style.display = "none";
      annotazioneText.focus();
    });

  // Chiudi modal (X)
  closeBtn?.addEventListener("click", () => {
    addAnnotazioneModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    errorDiv.style.display = "none";
    resetAnnotazioneForm();
  });

  // Chiudi modal (Annulla)
  cancelBtn?.addEventListener("click", () => {
    addAnnotazioneModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    errorDiv.style.display = "none";
    resetAnnotazioneForm();
  });

  // Chiudi modal cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === addAnnotazioneModal) {
      addAnnotazioneModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      errorDiv.style.display = "none";
      resetAnnotazioneForm();
    }
  });

  // Submit form - Salva annotazione
  addAnnotazioneForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const testo = annotazioneText.value.trim();

    if (!testo) {
      showErrorModal(errorDiv, "Inserisci il testo dell'annotazione");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Salvataggio...";
      errorDiv.style.display = "none";

      const response = await fetch(
        `/tutor/studenti/${studenteID}/annotazioni`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            testo: testo,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        addAnnotazioneModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        resetAnnotazioneForm();
        await loadAnnotazioni();
      } else {
        showErrorModal(errorDiv, data.message || "Errore nel salvataggio");
      }
    } catch (error) {
      console.error("Errore salvataggio annotazione:", error);
      showErrorModal(errorDiv, "Errore di connessione al server");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Salva Annotazione";
    }
  });

  // Reset form
  function resetAnnotazioneForm() {
    addAnnotazioneForm.reset();
    annotazioneText.value = "";
    annotazioneText.style.height = "120px";
    errorDiv.style.display = "none";
  }
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
    }
  } catch (error) {
    console.error("Errore caricamento dati:", error);
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
      let colorMedia = "#a0a0a0";
      let mediaDisplay = materia.media || "SV";

      if (mediaDisplay !== "SV") {
        const media = parseFloat(mediaDisplay);
        if (media < 6) {
          colorMedia = "#ff4444";
        } else if (media < 8) {
          colorMedia = "#f59e0b";
        } else {
          colorMedia = "#10b981";
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
          <div class="annotation-row">
            <div class="annotation-date-inline">
              <i class="fas fa-calendar-alt"></i>
              <span>${formattedDate}</span>
            </div>
            <div class="annotation-inline-actions">
              <button 
                class="btn-action" 
                title="Visualizza annotazione"
                onclick="openViewAnnotazioneModal('${ann._id}', '${escapeHtml(
        ann.testo
      )}', '${formattedDate}')"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                class="btn-action btn-action-danger" 
                title="Elimina annotazione"
                onclick="openConfirmDeleteAnnotazioneModal('${ann._id}')"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// ==========================================
// DELETE FUNCTIONS
// ==========================================

async function deleteAnnotazione(annotazioneID) {
  try {
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
      await loadAnnotazioni();
    }
  } catch (error) {
    console.error("Errore eliminazione annotazione:", error);
  }
}

// ==========================================
// GLOBAL MODAL FUNCTIONS
// ==========================================

function openAddAnnotazioneModal() {
  const addAnnotazioneModal = document.getElementById("addAnnotazioneModal");
  const annotazioneText = document.getElementById("annotazioneText");
  const errorDiv = document.getElementById("addAnnotazioneError");

  addAnnotazioneModal.classList.add("show");
  document.body.classList.add("modal-open");
  errorDiv.style.display = "none";
  annotazioneText.value = "";
  annotazioneText.focus();
}

function closeAddAnnotazioneModal() {
  const addAnnotazioneModal = document.getElementById("addAnnotazioneModal");
  const annotazioneText = document.getElementById("annotazioneText");
  const errorDiv = document.getElementById("addAnnotazioneError");

  addAnnotazioneModal.classList.remove("show");
  document.body.classList.remove("modal-open");
  annotazioneText.value = "";
  errorDiv.style.display = "none";
}

// ===== MODAL VIEW ANNOTAZIONE =====
function openViewAnnotazioneModal(id, testo, dataFormattata) {
  const modal = document.getElementById("viewAnnotazioneModal");
  const textEl = document.getElementById("viewAnnotazioneText");
  const dateEl = document.getElementById("viewAnnotazioneDate");

  textEl.textContent = testo;
  dateEl.textContent = dataFormattata;

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeViewAnnotazioneModal() {
  const modal = document.getElementById("viewAnnotazioneModal");
  const textEl = document.getElementById("viewAnnotazioneText");
  const dateEl = document.getElementById("viewAnnotazioneDate");

  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
  textEl.textContent = "";
  dateEl.textContent = "";
}

// ===== MODAL CONFERMA ELIMINAZIONE =====
let annotazioneToDeleteId = null;

function openConfirmDeleteAnnotazioneModal(annotazioneID) {
  annotazioneToDeleteId = annotazioneID;
  const modal = document.getElementById("confirmDeleteAnnotazioneModal");
  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeConfirmDeleteAnnotazioneModal() {
  annotazioneToDeleteId = null;
  const modal = document.getElementById("confirmDeleteAnnotazioneModal");
  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
}

// Usa la stessa deleteAnnotazione ma passando l'ID salvato
async function confirmDeleteAnnotazione() {
  if (!annotazioneToDeleteId) return;
  await deleteAnnotazione(annotazioneToDeleteId);
  closeConfirmDeleteAnnotazioneModal();
}

// ==========================================
// CHIUSURA MODAL CLICCANDO FUORI
// ==========================================

window.addEventListener("click", function (e) {
  const viewAnnotazioneModal = document.getElementById("viewAnnotazioneModal");
  const confirmDeleteAnnotazioneModal = document.getElementById(
    "confirmDeleteAnnotazioneModal"
  );

  if (e.target === viewAnnotazioneModal) {
    closeViewAnnotazioneModal();
  }
  if (e.target === confirmDeleteAnnotazioneModal) {
    closeConfirmDeleteAnnotazioneModal();
  }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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

function showErrorModal(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

window.addEventListener("pageshow", function () {
  if (!localStorage.getItem("token")) {
    window.location.href = "/";
  }
});
