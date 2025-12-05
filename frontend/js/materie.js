// ========== DISABILITA BACK BUTTON ==========
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ========== HAMBURGER MENU ==========
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

  // Chiudi menu al click overlay
  sidebarOverlay.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });

  // Chiudi menu al click su item
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", () => {
      hamburgerBtn.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  // Chiudi menu con ESC
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

// ========== MAIN APP ==========
document.addEventListener("DOMContentLoaded", async function () {
  // Verifica token
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Controlla token se pagina ritorna visibile
  window.addEventListener("pageshow", (event) => {
    const checkToken = localStorage.getItem("token");
    if (!checkToken) {
      window.location.href = "/";
    }
  });

  // ========== DOM ELEMENTS ==========
  const addBtn = document.getElementById("addMateriaBtn");
  const addMateriaModal = document.getElementById("addMateriaModal");
  const closeAddMateria = document.getElementById("closeAddMateria");
  const annullaAddMateria = document.getElementById("annullaAddMateria");
  const addMateriaForm = document.getElementById("addMateriaForm");
  const materiaNomeInput = document.getElementById("materiaNome");
  const addMateriaErrors = document.getElementById("addMateriaErrors");
  const materieList = document.getElementById("materieList");

  const editMateriaModal = document.getElementById("editMateriaModal");
  const closeEditMateria = document.getElementById("closeEditMateria");
  const annullaEditMateria = document.getElementById("annullaEditMateria");
  const editMateriaForm = document.getElementById("editMateriaForm");
  const materiaNomeEditInput = document.getElementById("materiaNomeEdit");
  const editMateriaErrors = document.getElementById("editMateriaErrors");

  const deleteMateriaModal = document.getElementById("deleteMateriaModal");
  const closeDeleteMateria = document.getElementById("closeDeleteMateria");
  const cancelDeleteMateria = document.getElementById("cancelDeleteMateria");
  const confirmDeleteMateria = document.getElementById("confirmDeleteMateria");
  const materiaNomeDelete = document.getElementById("materiaNomeDelete");

  const deleteProfileModal = document.getElementById("deleteProfileModal");
  const closeDeleteProfile = document.getElementById("closeDeleteProfile");
  const cancelDeleteProfile = document.getElementById("cancelDeleteProfile");
  const confirmDeleteProfile = document.getElementById("confirmDeleteProfile");

  // ========== STATE ==========
  let materieAttuali = [];
  let materiaInModifica = null;
  let materiaInEliminazione = null;

  // ========== CARICA DATI HEADER ==========
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

  // ========== FETCH MATERIE ==========
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

  // ========== RENDERIZZA MATERIE ==========
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

    // Aggiungi event listeners ai bottoni
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

  // ========== MODALE MODIFICA - APRI ==========
  function apriBtnModificaModal(materia) {
    materiaInModifica = materia;
    materiaNomeEditInput.value = materia.nome;
    editMateriaErrors.innerHTML = "";
    materiaNomeEditInput.classList.remove("input-error");
    editMateriaModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  // ========== MODALE ELIMINA - APRI ==========
  function apriMaterialeEliminaModal(materia) {
    materiaInEliminazione = materia;
    materiaNomeDelete.textContent = materia.nome;
    deleteMateriaModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  // ========== MODALE AGGIUNGI - APRI ==========
  addBtn.addEventListener("click", () => {
    resetAddMateriaForm();
    addMateriaModal.classList.add("show");
    document.body.classList.add("modal-open");
  });

  // ========== MODALE AGGIUNGI - CHIUDI ==========
  const closeAddMateriaModal = () => {
    addMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    resetAddMateriaForm();
  };

  closeAddMateria.addEventListener("click", closeAddMateriaModal);
  annullaAddMateria.addEventListener("click", closeAddMateriaModal);
  window.addEventListener("click", (event) => {
    if (event.target === addMateriaModal) {
      closeAddMateriaModal();
    }
  });

  // ========== MODALE MODIFICA - CHIUDI ==========
  const closeEditMateriaModal = () => {
    editMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    resetEditMateriaForm();
  };

  closeEditMateria.addEventListener("click", closeEditMateriaModal);
  annullaEditMateria.addEventListener("click", closeEditMateriaModal);
  window.addEventListener("click", (event) => {
    if (event.target === editMateriaModal) {
      closeEditMateriaModal();
    }
  });

  // ========== MODALE ELIMINA - CHIUDI ==========
  const closeDeleteMateriaModal = () => {
    deleteMateriaModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    materiaInEliminazione = null;
  };

  closeDeleteMateria.addEventListener("click", closeDeleteMateriaModal);
  cancelDeleteMateria.addEventListener("click", closeDeleteMateriaModal);
  window.addEventListener("click", (event) => {
    if (event.target === deleteMateriaModal) {
      closeDeleteMateriaModal();
    }
  });

  // ========== RESET FORM ==========
  function resetAddMateriaForm() {
    addMateriaForm.reset();
    addMateriaErrors.innerHTML = "";
    materiaNomeInput.classList.remove("input-error");
  }

  function resetEditMateriaForm() {
    if (materiaInModifica) {
      materiaNomeEditInput.value = materiaInModifica.nome;
    }
    editMateriaErrors.innerHTML = "";
    materiaNomeEditInput.classList.remove("input-error");
  }

  // ========== FUNZIONE ERRORI ==========
  function mostraErrori(container, errors) {
    container.innerHTML = "";
    errors.forEach((err) => {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "⚠️ " + err;
      container.appendChild(errorDiv);
    });
  }

  // ========== SUBMIT AGGIUNGI MATERIA ==========
  addMateriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = materiaNomeInput.value.trim();
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
      mostraErrori(addMateriaErrors, errors);
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
        closeAddMateriaModal();
        await fetchMaterie();
      } else {
        mostraErrori(addMateriaErrors, [
          data.message || "Errore nell'aggiunta",
        ]);
      }
    } catch (error) {
      console.error("Errore aggiunta materia:", error);
      mostraErrori(addMateriaErrors, ["Errore di connessione"]);
    }
  });

  // ========== SUBMIT MODIFICA MATERIA ==========
  editMateriaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!materiaInModifica) return;

    const nome = materiaNomeEditInput.value.trim();
    const materiaId = materiaInModifica._id;
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
      mostraErrori(editMateriaErrors, errors);
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
        closeEditMateriaModal();
        await fetchMaterie();
      } else {
        mostraErrori(editMateriaErrors, [
          data.message || "Errore nella modifica",
        ]);
      }
    } catch (error) {
      console.error("Errore modifica materia:", error);
      mostraErrori(editMateriaErrors, ["Errore di connessione"]);
    }
  });

  // ========== ELIMINA MATERIA ==========
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

      if (res.ok) {
        closeDeleteMateriaModal();
        await fetchMaterie();
      }
    } catch (error) {
      console.error("Errore eliminazione materia:", error);
    }
  });

  // ========== LOGOUT ==========
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

  // ========== MODALE ELIMINA PROFILO ==========
  const closeDeleteProfileModal = () => {
    deleteProfileModal.style.display = "none";
    document.body.classList.remove("modal-open");
  };

  document.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  closeDeleteProfile.addEventListener("click", closeDeleteProfileModal);
  cancelDeleteProfile.addEventListener("click", closeDeleteProfileModal);

  window.addEventListener("click", (event) => {
    if (event.target === deleteProfileModal) {
      closeDeleteProfileModal();
    }
  });

  confirmDeleteProfile.addEventListener("click", async () => {
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

  // ========== RELOAD AL RESIZE ==========
  window.addEventListener("resize", () => {
    if (materieAttuali.length > 0) {
      renderMaterie(materieAttuali);
    }
  });

  // ========== CARICA MATERIE INIZIALI ==========
  fetchMaterie();
});
