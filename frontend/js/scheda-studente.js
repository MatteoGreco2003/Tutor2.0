// ==========================================
// SCHEDA STUDENTE - JavaScript
// ==========================================

// ===== GLOBAL VARIABLES =====
let studenteID = null;
let token = null;
let currentStudenteData = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ===== CHECK AUTENTICAZIONE =====
  token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // ===== LOAD TUTOR NAME =====
  loadTutorInfo();

  // ===== ESTRAI STUDENT ID FROM QUERY PARAMETER =====
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

  // ===== SETUP EVENT LISTENERS =====
  setupEventListeners();
});

// ==========================================
// LOAD FUNCTIONS
// ==========================================

async function loadTutorInfo() {
  try {
    const response = await fetch("/tutor/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok && data.data) {
      const tutorName = `${data.data.nome || "Tutor"} ${data.data.cognome || ""}`.trim();
      document.getElementById("tutorName").textContent = tutorName;
      
      const userAvatar = document.getElementById("userAvatar");
      userAvatar.textContent = data.data.nome?.charAt(0).toUpperCase() || "T";
    }
  } catch (error) {
    console.error("Errore caricamento info tutor:", error);
  }
}

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
      renderMaterie(currentStudenteData.materie || []);
      renderVerifiche(currentStudenteData);
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
    const response = await fetch(`/tutor/annotazioni/${studenteID}`, {
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

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderStudenteInfo(studente) {
  document.getElementById("studenteName").textContent = `${studente.nome} ${studente.cognome}`;
  document.getElementById("studenteEmail").textContent = studente.email || "-";
  document.getElementById("studenteScuola").textContent = studente.scuola || "-";
  document.getElementById("studenteTelefono").textContent = studente.telefono || "-";
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
    .map(
      (materia) => `
    <div class="materia-item">
      <div class="materia-header">
        <div class="materia-name">${escapeHtml(materia.nome)}</div>
        <div class="materia-media">${materia.media || "0"}</div>
      </div>
      <div class="materia-actions">
        <button class="btn-small" onclick="editMateria('${materia._id}', '${escapeHtml(materia.nome)}', ${materia.media})" title="Modifica materia">
          <i class="fas fa-edit"></i> Modifica
        </button>
        <button class="btn-small btn-small-danger" onclick="deleteMateria('${materia._id}')" title="Elimina materia">
          <i class="fas fa-trash"></i> Elimina
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function renderVerifiche(studente) {
  // TODO: Implementare logica verifiche passate e future
  // Per ora mostriamo empty state

  const storicoContent = document.getElementById("storicoContent");
  const futureContent = document.getElementById("futureContent");

  storicoContent.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-check-circle"></i>
      <p>Nessuna verifica nel passato</p>
    </div>
  `;

  futureContent.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-calendar"></i>
      <p>Nessuna verifica pianificata</p>
    </div>
  `;
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
          <button class="btn-action btn-action-danger" onclick="deleteAnnotazione('${ann._id}')" title="Elimina annotazione">
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
  document.getElementById("annotazioneText").focus();
}

function closeAddAnnotazioneModal() {
  document.getElementById("addAnnotazioneModal").classList.remove("show");
  document.getElementById("annotazioneText").value = "";
  document.getElementById("charCount").textContent = "0";
}

function openAddMateriaModal() {
  document.getElementById("addMateriaModal").classList.add("show");
  document.getElementById("materiaName").focus();
}

function closeAddMateriaModal() {
  document.getElementById("addMateriaModal").classList.remove("show");
  document.getElementById("materiaName").value = "";
  document.getElementById("materiaMedio").value = "";
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
    btn.textContent = "Salvataggio...";

    const response = await fetch("/tutor/annotazioni", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        studenteID: studenteID,
        testo: testo,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess("Annotazione salvata con successo");
      closeAddAnnotazioneModal();
      await loadAnnotazioni();
    } else {
      showError(data.message || "Errore nel salvataggio");
    }

    btn.disabled = false;
    btn.textContent = "Salva Annotazione";
  } catch (error) {
    console.error("Errore salvataggio annotazione:", error);
    showError("Errore di connessione al server");
  }
}

async function saveMateria(event) {
  event.preventDefault();

  const nome = document.getElementById("materiaName").value.trim();
  const media = parseFloat(document.getElementById("materiaMedio").value);

  if (!nome || isNaN(media)) {
    showError("Inserisci dati validi");
    return;
  }

  if (media < 0 || media > 10) {
    showError("La media deve essere tra 0 e 10");
    return;
  }

  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Aggiunta in corso...";

    // TODO: Implementare endpoint backend per salvare materia
    // const response = await fetch("/tutor/materie", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     studenteID: studenteID,
    //     nome: nome,
    //     media: media,
    //   }),
    // });

    showSuccess("Materia aggiunta con successo");
    closeAddMateriaModal();
    // await loadStudenteData();

    btn.disabled = false;
    btn.textContent = "Aggiungi Materia";
  } catch (error) {
    console.error("Errore aggiunta materia:", error);
    showError("Errore di connessione al server");
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
    const response = await fetch(`/tutor/annotazioni/${annotazioneID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      showSuccess("Annotazione eliminata");
      await loadAnnotazioni();
    } else {
      showError("Errore nell'eliminazione");
    }
  } catch (error) {
    console.error("Errore eliminazione annotazione:", error);
    showError("Errore di connessione");
  }
}

function deleteMateria(materiaID) {
  if (!confirm("Sei sicuro di voler eliminare questa materia?")) {
    return;
  }

  try {
    // TODO: Implementare endpoint backend per eliminare materia
    showSuccess("Materia eliminata");
    // await loadStudenteData();
  } catch (error) {
    console.error("Errore eliminazione materia:", error);
    showError("Errore di connessione");
  }
}

function editMateria(materiaID, nome, media) {
  // TODO: Implementare modale di modifica materia
  console.log("Edit materia:", materiaID, nome, media);
  showInfo("Funzionalità di modifica in sviluppo");
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================

function setupEventListeners() {
  // ===== TEXTAREA CHARACTER COUNT =====
  const annotazioneText = document.getElementById("annotazioneText");
  const charCount = document.getElementById("charCount");

  if (annotazioneText) {
    annotazioneText.addEventListener("input", function () {
      charCount.textContent = this.value.length;
    });
  }

  // ===== MODAL CLOSE ON OUTSIDE CLICK =====
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

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAddAnnotazioneModal();
      closeAddMateriaModal();
    }
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function goBack() {
  window.history.back();
}

function logoutUser() {
  if (!confirm("Sei sicuro di voler uscire?")) {
    return;
  }

  try {
    const response = fetch("/auth/logout", {
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
  console.log("✅ SUCCESS:", message);
  // TODO: Implementare toast notification
  alert(message);
}

function showError(message) {
  console.error("❌ ERROR:", message);
  // TODO: Implementare toast notification
  alert(message);
}

function showInfo(message) {
  console.info("ℹ️ INFO:", message);
  // TODO: Implementare toast notification
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

// ==========================================
// PREVENT BACK NAVIGATION (OPTIONAL)
// ==========================================

// Uncomment to prevent browser back button
// window.history.pushState(null, null, window.location.href);
// window.addEventListener("popstate", function () {
//   window.history.pushState(null, null, window.location.href);
// });
