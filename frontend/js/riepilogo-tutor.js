// ==========================================
// RIEPILOGO TUTOR - JS
// ==========================================

// ===== HAMBURGER MENU =====
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

// Initialize immediately, don't wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}

document.addEventListener("DOMContentLoaded", async function () {
  // ===== AUTENTICAZIONE =====
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Ricontrolla token quando si ritorna sulla pagina
  window.addEventListener("pageshow", () => {
    if (!localStorage.getItem("token")) window.location.href = "/";
  });

  // ============ LOGOUT ============
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

  // ============ ELIMINA PROFILO ============
  const deleteProfileModal = document.getElementById("deleteProfileModal");
  document.querySelector(".delete-btn")?.addEventListener("click", function () {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open");
  });
  document
    .getElementById("closeDeleteProfile")
    ?.addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });
  document
    .getElementById("cancelDeleteProfile")
    ?.addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });
  window.addEventListener("click", function (event) {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });
  document
    .getElementById("confirmDeleteProfile")
    ?.addEventListener("click", async function () {
      try {
        const response = await fetch("/tutor/profile", {
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
        console.error("Errore eliminazione profilo:", error);
      }
    });

  // ============ HEADER DINAMICO ============
  try {
    const res = await fetch("/tutor/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (res.ok && data.data) {
      const headerTitle = document.querySelector(".header-title");
      headerTitle.textContent = `${data.data.nome || "Tutor"} ${
        data.data.cognome || ""
      }`;
      const userIcon = document.querySelector(".user-icon");
      userIcon.textContent = data.data.nome?.charAt(0).toUpperCase() || "T";

      // Popola dati personali
      document.getElementById("personalNome").textContent =
        data.data.nome || "-";
      document.getElementById("personalCognome").textContent =
        data.data.cognome || "-";
      document.getElementById("personalEmail").textContent =
        data.data.email || "-";
    }
  } catch (err) {
    console.error("Errore caricamento dati tutor:", err);
  }

  // ============ CARICA STUDENTI ASSOCIATI ===========
  async function loadStudentiAssociati() {
    try {
      const response = await fetch("/tutor/studenti", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // ===== PER OGNI STUDENTE, CONTROLLA INSUFFICIENZE =====
      const studentiConInsufficenze = await Promise.all(
        (data.studenti || []).map(async (studente) => {
          try {
            const checkResponse = await fetch(
              `/tutor/studenti/${studente.id}/materie/check`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            const checkData = await checkResponse.json();

            return {
              ...studente,
              hasInsufficenze: checkData.hasInsufficenze || false,
              totaleInsufficenze: checkData.totaleInsufficenze || 0,
              totaleMaterie: checkData.materieInsufficenti?.length || 0,
            };
          } catch (error) {
            console.error(
              `Errore controllo insufficienze per ${studente.nome}:`,
              error
            );
            return {
              ...studente,
              insufficienti: false,
            };
          }
        })
      );

      const container = document.getElementById("studentiContainer");
      const countElement = document.getElementById("studentCount");

      if (studentiConInsufficenze && studentiConInsufficenze.length > 0) {
        countElement.textContent = studentiConInsufficenze.length;

        let html = '<div class="studenti-grid">';
        studentiConInsufficenze.forEach((studente) => {
          let sufficienza = "SUF";
          let sufficienzaClass = "sufficiente";

          if (studente.totaleInsufficenze > 0) {
            sufficienza = "INS";
            sufficienzaClass = "insufficiente";
          } else if (studente.totaleMaterie === 0) {
            sufficienza = "SV";
            sufficienzaClass = "senza-valutazione";
          }

          html += `
            <div class="studente-card">
              <div class="studente-header">
                <h3 class="studente-nome">${studente.nome} ${
            studente.cognome
          }</h3>
                <span class="badge badge-${sufficienzaClass}">
                  ${sufficienza}
                </span>
              </div>
              <div class="studente-info">
                <p><strong>Email:</strong> ${studente.email}</p>
                <p><strong>Scuola:</strong> ${studente.scuola || "-"}</p>
              </div>
            </div>
          `;
        });
        html += "</div>";
        container.innerHTML = html;
      } else {
        countElement.textContent = "0";
        container.innerHTML = `
          <div class="empty-state">
            <p class="empty-state-message">Nessuno studente associato</p>
            <p class="empty-state-submessage">
              Aggiungi studenti dalla pagina Home
            </p>
          </div>
        `;
      }
    } catch (error) {
      console.error("Errore caricamento studenti:", error);
      document.getElementById("studentiContainer").innerHTML = `
        <div class="empty-state">
          <p class="empty-state-message">Errore nel caricamento</p>
        </div>
      `;
    }
  }

  // ========== SETUP MODIFICA DATI PERSONALI ==========
  function setupEditPersonalModal() {
    const editPersonalModal = document.getElementById("editPersonalModal");
    const editPersonalForm = document.getElementById("editPersonalForm");
    const closeBtn = document.getElementById("closeEditPersonal");
    const cancelBtn = document.getElementById("cancelEditPersonal");
    const submitBtn = editPersonalForm.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById("editPersonalErrors");

    document
      .getElementById("editPersonalBtn")
      ?.addEventListener("click", () => {
        // Popola i campi con i dati attuali
        document.getElementById("editNome").value =
          document.getElementById("personalNome").textContent;
        document.getElementById("editCognome").value =
          document.getElementById("personalCognome").textContent;

        // Resetta errori
        errorDiv.textContent = "";
        errorDiv.style.display = "none";

        editPersonalModal.style.display = "flex";
        document.body.classList.add("modal-open");
      });

    closeBtn?.addEventListener("click", () => {
      editPersonalModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

    cancelBtn?.addEventListener("click", () => {
      editPersonalModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

    window.addEventListener("click", (e) => {
      if (e.target === editPersonalModal) {
        editPersonalModal.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });

    editPersonalForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("editNome").value.trim();
      const cognome = document.getElementById("editCognome").value.trim();

      // VALIDAZIONI
      if (nome.length < 2) {
        errorDiv.textContent = "⚠️ Nome deve contenere almeno 2 caratteri";
        errorDiv.style.display = "block";
        return;
      }

      if (cognome.length < 2) {
        errorDiv.textContent = "⚠️ Cognome deve contenere almeno 2 caratteri";
        errorDiv.style.display = "block";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvataggio...";
        errorDiv.style.display = "none";

        // INVIA AL SERVER
        const response = await fetch("/tutor/personal-data", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome: nome,
            cognome: cognome,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Successo - Aggiorna il DOM
          document.getElementById("personalNome").textContent = nome;
          document.getElementById("personalCognome").textContent = cognome;
          document.querySelector(
            ".header-title"
          ).textContent = `${nome} ${cognome}`;

          // Chiudi modal
          editPersonalModal.style.display = "none";
          document.body.classList.remove("modal-open");
          editPersonalForm.reset();
        } else {
          // ❌ Errore dal server
          errorDiv.textContent = `⚠️ ${
            data.message || "Errore nel salvataggio"
          }`;
          errorDiv.style.display = "block";
        }
      } catch (error) {
        console.error("Errore:", error);
        errorDiv.textContent = "❌ Errore di connessione al server";
        errorDiv.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Salva modifiche";
      }
    });
  }

  // ========== SETUP MODIFICA PASSWORD ==========
  function setupEditPasswordModal() {
    const editPasswordModal = document.getElementById("editPasswordModal");
    const editPasswordForm = document.getElementById("editPasswordForm");
    const closeBtn = document.getElementById("closeEditPassword");
    const cancelBtn = document.getElementById("cancelEditPassword");
    const submitBtn = editPasswordForm.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById("editPasswordErrors");

    document
      .getElementById("editPasswordBtn")
      ?.addEventListener("click", () => {
        editPasswordForm.reset();
        errorDiv.textContent = "";
        errorDiv.style.display = "none";

        editPasswordModal.style.display = "flex";
        document.body.classList.add("modal-open");
        resetPasswordIcons();
      });

    closeBtn?.addEventListener("click", () => {
      editPasswordModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

    cancelBtn?.addEventListener("click", () => {
      editPasswordModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

    window.addEventListener("click", (e) => {
      if (e.target === editPasswordModal) {
        editPasswordModal.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });

    editPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const oldPwd = document.getElementById("oldPassword").value;
      const newPwd = document.getElementById("newPassword").value;
      const confirmPwd = document.getElementById("confirmNewPassword").value;

      // VALIDAZIONI
      if (!oldPwd) {
        errorDiv.textContent = "⚠️ Inserisci la password attuale";
        errorDiv.style.display = "block";
        return;
      }
      if (!newPwd) {
        errorDiv.textContent = "⚠️ Inserisci una nuova password";
        errorDiv.style.display = "block";
        return;
      }

      // Validazione password lato client
      const hasMinLength = newPwd.length >= 8;
      const hasUpperCase = /[A-Z]/.test(newPwd);
      const hasLowerCase = /[a-z]/.test(newPwd);
      const hasNumber = /\d/.test(newPwd);

      if (!(hasMinLength && hasUpperCase && hasLowerCase && hasNumber)) {
        errorDiv.textContent =
          "⚠️ Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)";
        errorDiv.style.display = "block";
        return;
      }

      if (!confirmPwd) {
        errorDiv.textContent = "⚠️ Conferma la nuova password";
        errorDiv.style.display = "block";
        return;
      }

      if (newPwd !== confirmPwd) {
        errorDiv.textContent = "⚠️ Le nuove password non coincidono";
        errorDiv.style.display = "block";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvataggio...";
        errorDiv.style.display = "none";

        const response = await fetch("/tutor/password", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPwd,
            newPassword: newPwd,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // ✅ Successo
          editPasswordModal.style.display = "none";
          document.body.classList.remove("modal-open");
          editPasswordForm.reset();
          resetPasswordIcons();
        } else {
          // ❌ Errore dal server
          errorDiv.textContent = `⚠️ ${
            data.message || "Errore nel salvataggio"
          }`;
          errorDiv.style.display = "block";
        }
      } catch (error) {
        console.error("Errore:", error);
        errorDiv.textContent = "❌ Errore di connessione al server";
        errorDiv.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Salva nuova password";
      }
    });

    setupPasswordToggle();
  }

  function setupPasswordToggle() {
    document
      .querySelectorAll("#editPasswordModal .toggle-password")
      .forEach((icon) => {
        const inputId = icon.getAttribute("data-input");
        const input = document.getElementById(inputId);

        function updateIcon() {
          if (input.value.length > 0) {
            icon.classList.remove("fa-lock");
            icon.classList.add("fa-eye");
            icon.style.cursor = "pointer";
            icon.style.pointerEvents = "auto";
          } else {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-lock");
            input.type = "password";
            icon.style.cursor = "default";
            icon.style.pointerEvents = "none";
          }
        }

        input.addEventListener("input", updateIcon);

        icon.addEventListener("click", (e) => {
          e.stopPropagation();
          if (input.value.length > 0) {
            input.type = input.type === "password" ? "text" : "password";
          }
        });

        updateIcon();
      });
  }

  function resetPasswordIcons() {
    document
      .querySelectorAll("#editPasswordModal .toggle-password")
      .forEach((icon) => {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-lock");
        const inputId = icon.getAttribute("data-input");
        const input = document.getElementById(inputId);
        if (input) input.type = "password";
      });
  }

  // Inizializzazione
  setupEditPersonalModal();
  setupEditPasswordModal();
  loadStudentiAssociati();
});
