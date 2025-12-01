// ==========================================
// MATERIE - TUTOR 2.0
// ==========================================

// ===== DISABILITA BACK BUTTON ALL'INIZIO =====
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ===== HAMBURGER MENU TOGGLE (FUORI da DOMContentLoaded) =====
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn"); // oppure .menu-toggle
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay"); // oppure .sidebar-overlay

  if (!hamburgerBtn || !sidebar || !sidebarOverlay) return;

  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hamburgerBtn.classList.toggle("active");
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    if (sidebar.classList.contains("active")) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  });

  sidebarOverlay.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });

  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", () => {
      hamburgerBtn.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hamburgerBtn.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}

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

    // Se il token non esiste, torna a login
    if (!checkToken) {
      window.location.href = "/";
      return;
    }
  });

  const addBtn = document.getElementById("addMateriaBtn");
  const addMateriaModal = document.getElementById("addMateriaModal");
  const closeAddMateria = document.getElementById("closeAddMateria");
  const annullaAddMateria = document.getElementById("annullaAddMateria");
  const addMateriaForm = document.getElementById("addMateriaForm");
  const materiaNomeInput = document.getElementById("materiaNome");
  const addMateriaErrors = document.getElementById("addMateriaErrors");
  const materieList = document.getElementById("materieList");

  // MODALE MODIFICA
  const editMateriaModal = document.getElementById("editMateriaModal");
  const closeEditMateria = document.getElementById("closeEditMateria");
  const annullaEditMateria = document.getElementById("annullaEditMateria");
  const editMateriaForm = document.getElementById("editMateriaForm");
  const materiaNomeEditInput = document.getElementById("materiaNomeEdit");
  const editMateriaErrors = document.getElementById("editMateriaErrors");

  // MODALE ELIMINA
  const deleteMateriaModal = document.getElementById("deleteMateriaModal");
  const closeDeleteMateria = document.getElementById("closeDeleteMateria");
  const cancelDeleteMateria = document.getElementById("cancelDeleteMateria");
  const confirmDeleteMateria = document.getElementById("confirmDeleteMateria");
  const materiaNomeDelete = document.getElementById("materiaNomeDelete");

  let materieAttuali = [];
  let materiaInModifica = null;
  let materiaInEliminazione = null;

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
    window.location.href = "/";
  }

  // ===== CARICA MATERIE DAL BACKEND =====
  async function fetchMaterie() {
    try {
      const res = await fetch("/subject/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.materie)) {
        materieAttuali = data.materie;
        renderMaterie(data.materie);
        addBtn.disabled = data.materie.length >= 15;
      }
    } catch (error) {
      console.error("Errore caricamento materie:", error);
    }
  }

  // ===== RENDERIZZA LE MATERIE =====
  function renderMaterie(materie) {
    materieList.innerHTML = "";
    if (materie.length === 0) {
      materieList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>Nessuna materia registrata</p>
      </div>
    `;
      return;
    }
    materie.forEach((materia) => {
      const item = document.createElement("div");
      item.className = "materia-item";

      // Determina se mostrare testo nei bottoni
      const isMobile = window.innerWidth <= 576;
      const modificaText = isMobile ? "" : " Modifica";
      const eliminaText = isMobile ? "" : " Elimina";

      item.innerHTML = `
      <input type="text" class="materia-input" value="${materia.nome}" disabled>
      <div class="btn-materia">
        <button class="btn-modifica" data-id="${materia._id}" title="Modifica">
          <i class="fas fa-pencil"></i>${modificaText}
        </button>
        <button class="btn-rimuovi" data-id="${materia._id}" title="Elimina">
          <i class="fas fa-trash"></i>${eliminaText}
        </button>
      </div>
    `;
      materieList.appendChild(item);
    });

    // Event listeners...
    document.querySelectorAll(".btn-modifica").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const materiaId = btn.getAttribute("data-id");
        const materia = materieAttuali.find((m) => m._id === materiaId);
        if (materia) {
          apriBtnModificaModal(materia);
        }
      });
    });

    document.querySelectorAll(".btn-rimuovi").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const materiaId = btn.getAttribute("data-id");
        const materia = materieAttuali.find((m) => m._id === materiaId);
        if (materia) {
          apriMaterialeEliminaModal(materia);
        }
      });
    });
  }

  // ===== APRI MODALE MODIFICA =====
  function apriBtnModificaModal(materia) {
    materiaInModifica = materia;
    materiaNomeEditInput.value = materia.nome;
    editMateriaErrors.innerHTML = "";
    materiaNomeEditInput.classList.remove("input-error");
    editMateriaModal.classList.add("show");
    document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
  }

  // ===== APRI MODALE ELIMINA =====
  function apriMaterialeEliminaModal(materia) {
    materiaInEliminazione = materia;
    materiaNomeDelete.textContent = materia.nome;
    deleteMateriaModal.classList.add("show");
    document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
  }

  // ===== MODALE AGGIUNGI: APRI =====
  addBtn.addEventListener("click", () => {
    resetAddMateriaForm();
    addMateriaModal.classList.add("show");
    document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
  });

  // ===== MODALE AGGIUNGI: CHIUDI (X) =====
  closeAddMateria.addEventListener("click", () => {
    addMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    resetAddMateriaForm();
  });

  // ===== MODALE AGGIUNGI: CHIUDI (Annulla) =====
  annullaAddMateria.addEventListener("click", () => {
    addMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    resetAddMateriaForm();
  });

  // ===== MODALE AGGIUNGI: CHIUDI (click fuori) =====
  window.addEventListener("click", (event) => {
    if (event.target === addMateriaModal) {
      addMateriaModal.classList.remove("show");
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      resetAddMateriaForm();
    }
  });

  // ===== MODALE MODIFICA: CHIUDI (X) =====
  closeEditMateria.addEventListener("click", () => {
    editMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    resetEditMateriaForm();
  });

  // ===== MODALE MODIFICA: CHIUDI (Annulla) =====
  annullaEditMateria.addEventListener("click", () => {
    editMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    resetEditMateriaForm();
  });

  // ===== MODALE MODIFICA: CHIUDI (click fuori) =====
  window.addEventListener("click", (event) => {
    if (event.target === editMateriaModal) {
      editMateriaModal.classList.remove("show");
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      resetEditMateriaForm();
    }
  });

  // ===== MODALE ELIMINA: CHIUDI (X) =====
  closeDeleteMateria.addEventListener("click", () => {
    deleteMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    materiaInEliminazione = null;
  });

  // ===== MODALE ELIMINA: CHIUDI (Annulla) =====
  cancelDeleteMateria.addEventListener("click", () => {
    deleteMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    materiaInEliminazione = null;
  });

  // ===== MODALE ELIMINA: CHIUDI (click fuori) =====
  window.addEventListener("click", (event) => {
    if (event.target === deleteMateriaModal) {
      deleteMateriaModal.classList.remove("show");
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      materiaInEliminazione = null;
    }
  });

  // ===== RESETTA FORM AGGIUNGI =====
  function resetAddMateriaForm() {
    addMateriaForm.reset();
    addMateriaErrors.innerHTML = "";
    materiaNomeInput.classList.remove("input-error");
  }

  // ===== RESETTA FORM MODIFICA =====
  function resetEditMateriaForm() {
    if (materiaInModifica) {
      materiaNomeEditInput.value = materiaInModifica.nome;
    }
    editMateriaErrors.innerHTML = "";
    materiaNomeEditInput.classList.remove("input-error");
  }

  // ===== SUBMIT FORM AGGIUNGI MATERIA =====
  addMateriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = materiaNomeInput.value.trim();

    addMateriaErrors.innerHTML = "";
    materiaNomeInput.classList.remove("input-error");

    const errors = [];

    if (nome.length < 2) {
      errors.push("Il nome deve contenere almeno 2 caratteri");
      materiaNomeInput.classList.add("input-error");
    }

    if (
      materieAttuali.some((m) => m.nome.toLowerCase() === nome.toLowerCase())
    ) {
      errors.push("Materia già presente");
      materiaNomeInput.classList.add("input-error");
    }

    if (errors.length > 0) {
      addMateriaErrors.innerHTML = "";
      errors.forEach((err) => {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "⚠️ " + err;
        addMateriaErrors.appendChild(errorDiv);
      });
      return;
    }

    try {
      const res = await fetch("/subject", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: nome }),
      });

      const data = await res.json();

      if (res.ok) {
        addMateriaModal.classList.remove("show");
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
        resetAddMateriaForm();
        await fetchMaterie();
      } else {
        addMateriaErrors.innerHTML = "";
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "⚠️ " + (data.message || "Errore nell'aggiunta");
        addMateriaErrors.appendChild(errorDiv);
      }
    } catch (error) {
      console.error("Errore aggiunta materia:", error);
      addMateriaErrors.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "⚠️ Errore di connessione";
      addMateriaErrors.appendChild(errorDiv);
    }
  });

  // ===== SUBMIT FORM MODIFICA MATERIA =====
  editMateriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!materiaInModifica) return;

    const nome = materiaNomeEditInput.value.trim();
    const materiaId = materiaInModifica._id;

    editMateriaErrors.innerHTML = "";
    materiaNomeEditInput.classList.remove("input-error");

    const errors = [];

    if (nome.length < 2) {
      errors.push("Il nome deve contenere almeno 2 caratteri");
      materiaNomeEditInput.classList.add("input-error");
    }

    if (
      materieAttuali.some(
        (m) =>
          m.nome.toLowerCase() === nome.toLowerCase() && m._id !== materiaId
      )
    ) {
      errors.push("Questa materia è già presente");
      materiaNomeEditInput.classList.add("input-error");
    }

    if (errors.length > 0) {
      editMateriaErrors.innerHTML = "";
      errors.forEach((err) => {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = "⚠️ " + err;
        editMateriaErrors.appendChild(errorDiv);
      });
      return;
    }

    try {
      const res = await fetch(`/subject/${materiaId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: nome }),
      });

      const data = await res.json();

      if (res.ok) {
        editMateriaModal.classList.remove("show");
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
        resetEditMateriaForm();
        await fetchMaterie();
      } else {
        editMateriaErrors.innerHTML = "";
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent =
          "⚠️ " + (data.message || "Errore nella modifica");
        editMateriaErrors.appendChild(errorDiv);
      }
    } catch (error) {
      console.error("Errore modifica materia:", error);
      editMateriaErrors.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "⚠️ Errore di connessione";
      editMateriaErrors.appendChild(errorDiv);
    }
  });

  // ===== CONFERMA ELIMINA MATERIA =====
  confirmDeleteMateria.addEventListener("click", async () => {
    if (!materiaInEliminazione) return;

    const materiaId = materiaInEliminazione._id;

    try {
      const res = await fetch(`/subject/${materiaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        deleteMateriaModal.classList.remove("show");
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
        materiaInEliminazione = null;
        await fetchMaterie();
      }
    } catch (error) {
      console.error("Errore eliminazione materia:", error);
    }
  });

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
      console.error("Errore durante il logout");
    }
  });

  // ===== MODALE ELIMINA PROFILO =====
  const deleteProfileModal = document.getElementById("deleteProfileModal");
  document.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
  });
  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });
  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });
  window.addEventListener("click", (event) => {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    }
  });
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
        console.error("Errore di connessione");
      }
    });

  // ===== RELOAD MATERIE AL RESIZE =====
  window.addEventListener("resize", () => {
    if (materieAttuali.length > 0) {
      renderMaterie(materieAttuali);
    }
  });
  // ===== CARICA MATERIE ALL'AVVIO =====
  fetchMaterie();
});
