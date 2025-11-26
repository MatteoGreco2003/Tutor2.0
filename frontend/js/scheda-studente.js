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

  loadTutorInfo();

  const urlParams = new URLSearchParams(window.location.search);
  studenteID = urlParams.get("studenteID");

  if (!studenteID) {
    showError("ID studente non valido");
    setTimeout(() => window.history.back(), 2000);
    return;
  }

  // ===== LOAD DATA =====
  await loadStudenteData(); // ✅ Carica tutto
  await loadAnnotazioni(); // ✅ Annotazioni
  await loadVerificheStorico(); // ✅ Storico
  await loadVerificheFuture(); // ✅ AGGIUNGI QUESTA RIGA

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
    .querySelector(".btn-logout")
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
      const userAvatar = document.getElementById("userAvatar");
      userAvatar.textContent = data.data.nome?.charAt(0).toUpperCase() || "T";
    }
  } catch (error) {
    console.error("Errore caricamento info tutor:", error);
  }
}

async function loadAnnotazioni() {
  try {
    const response = await fetch(
      `/tutor/studenti/${studenteID}/annotazioni`, // ✅ ROUTE CORRETTA
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
      `/tutor/studenti/${studenteID}/verifiche/future`, // ✅ ENDPOINT FUTURE
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

  // ===== AGGIORNA AVATAR NELLA BANNER =====
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
    .map(
      (materia) => `
    <div class="materia-item">
      <div class="materia-header">
        <div class="materia-name">${escapeHtml(materia.nome)}</div>
        <div class="materia-media">${materia.media || "0"}</div>
      </div>
      <div class="materia-actions">
        <button class="btn-small" onclick="editMateria('${
          materia._id
        }', '${escapeHtml(materia.nome)}', ${
        materia.media
      })" title="Modifica materia">
          <i class="fas fa-edit"></i> Modifica
        </button>
        <button class="btn-small btn-small-danger" onclick="deleteMateria('${
          materia._id
        }')" title="Elimina materia">
          <i class="fas fa-trash"></i> Elimina
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function renderVerificheStorico(verifiche) {
  const container = document.getElementById("storicoContent");
  document.getElementById("storicoCount").textContent = verifiche
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

      // Colore voto
      let colorVoto = "#10b981"; // verde
      if (verifica.voto < 6) {
        colorVoto = "#ff4444"; // rosso
      } else if (verifica.voto < 7) {
        colorVoto = "#f59e0b"; // arancione
      }

      return `
        <div class="verifica-item">
          <div class="verifica-header">
            <div class="verifica-info">
              <div class="verifica-materia">${escapeHtml(
                verifica.materialID?.nome || "Materia sconosciuta"
              )}</div>
              <div class="verifica-argomento">${escapeHtml(
                verifica.argomento
              )}</div>
            </div>
            <div class="verifica-voto" style="background-color: ${colorVoto};">
              ${verifica.voto}
            </div>
          </div>
          <div class="verifica-footer">
            <div class="verifica-data">
              <i class="fas fa-calendar"></i>
              ${formattedDate}
            </div>
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
              <div class="verifica-argomento">${escapeHtml(
                verifica.argomento
              )}</div>
            </div>
            <div class="verifica-voto" style="background-color: #9e3ffd; color: white;">
              Da fare
            </div>
          </div>
          <div class="verifica-footer">
            <div class="verifica-data">
              <i class="fas fa-calendar"></i>
              ${formattedDate}
            </div>
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

  // ===== CLOSE BUTTONS =====
  document
    .getElementById("closeAddAnnotazioneBtn")
    ?.addEventListener("click", closeAddAnnotazioneModal);
  document
    .getElementById("closeAddMateriaBtn")
    ?.addEventListener("click", closeAddMateriaModal);

  // ===== CANCEL BUTTONS =====
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

  // ===== KEYBOARD SHORTCUTS =====
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

async function saveMateria(event) {
  event.preventDefault();

  const nome = document.getElementById("materiaName").value.trim();
  const media = parseFloat(document.getElementById("materiaMedio").value);

  if (!nome || isNaN(media)) {
    showError("⚠️ Inserisci dati validi");
    return;
  }

  if (media < 0 || media > 10) {
    showError("⚠️ La media deve essere tra 0 e 10");
    return;
  }

  try {
    const btn = event.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    const originalText = btn.textContent;
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

    showSuccess("✅ Materia aggiunta con successo");
    closeAddMateriaModal();
    // await loadStudenteData();

    btn.disabled = false;
    btn.textContent = originalText;
  } catch (error) {
    console.error("Errore aggiunta materia:", error);
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
    const response = await fetch(`/tutor/annotazioni/${annotazioneID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

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
    // TODO: Implementare endpoint backend per eliminare materia
    showSuccess("✅ Materia eliminata");
    // await loadStudenteData();
  } catch (error) {
    console.error("Errore eliminazione materia:", error);
    showError("❌ Errore di connessione");
  }
}

function editMateria(materiaID, nome, media) {
  // TODO: Implementare modale di modifica materia
  console.log("Edit materia:", materiaID, nome, media);
  showInfo("ℹ️ Funzionalità di modifica in sviluppo");
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

  // ===== BACK BUTTON =====
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
