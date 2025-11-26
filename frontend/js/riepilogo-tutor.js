// ==========================================
// RIEPILOGO TUTOR - JS
// ==========================================

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
        } else {
          alert("Errore durante il logout");
        }
      } catch (error) {
        console.error("Errore logout:", error);
        alert("Errore durante il logout");
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
        } else {
          alert(data.message || "Errore nell'eliminazione del profilo");
        }
      } catch (error) {
        console.error("Errore eliminazione profilo:", error);
        alert("Errore di connessione al server");
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
              insufficienti: checkData.hasInsufficenze || false,
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
          const sufficienza = studente.insufficienti ? "INS" : "SUF";
          const sufficienzaClass = studente.insufficienti
            ? "insufficiente"
            : "sufficiente";

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
        document.getElementById("editNome").value =
          document.getElementById("personalNome").textContent;
        document.getElementById("editCognome").value =
          document.getElementById("personalCognome").textContent;
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

      if (!nome || !cognome) {
        errorDiv.textContent = "⚠️ Nome e cognome sono obbligatori";
        errorDiv.style.display = "block";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvataggio...";
        errorDiv.style.display = "none";

        // TODO: Implementare endpoint di modifica dati tutor
        console.log("Salvataggio:", { nome, cognome });

        document.getElementById("personalNome").textContent = nome;
        document.getElementById("personalCognome").textContent = cognome;
        document.querySelector(
          ".header-title"
        ).textContent = `${nome} ${cognome}`;

        editPersonalModal.style.display = "none";
        document.body.classList.remove("modal-open");
        editPersonalForm.reset();
      } catch (error) {
        console.error("Errore:", error);
        errorDiv.textContent = "❌ Errore nel salvataggio";
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

    // validazione password lato client
    function isValidPassword(pwd) {
      const hasMinLength = pwd.length >= 8;
      const hasUpperCase = /[A-Z]/.test(pwd);
      const hasLowerCase = /[a-z]/.test(pwd);
      const hasNumber = /\d/.test(pwd);
      return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    }

    editPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const oldPwd = document.getElementById("oldPassword").value;
      const newPwd = document.getElementById("newPassword").value;
      const confirmPwd = document.getElementById("confirmNewPassword").value;

      // VALIDAZIONI - MOSTRA SOLO IL PRIMO ERRORE
      if (!oldPwd) {
        return showError(
          editPasswordErrors,
          oldPasswordInput,
          "Inserisci la password attuale"
        );
      }
      if (!newPwd) {
        return showError(
          editPasswordErrors,
          newPasswordInput,
          "Inserisci una nuova password"
        );
      }
      if (!isValidPassword(newPwd)) {
        return showError(
          editPasswordErrors,
          newPasswordInput,
          "Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)"
        );
      }
      if (!confirmPwd) {
        return showError(
          editPasswordErrors,
          confirmNewPasswordInput,
          "Conferma la nuova password"
        );
      }
      if (newPwd !== confirmPwd) {
        return showError(
          editPasswordErrors,
          confirmNewPasswordInput,
          "Le nuove password non coincidono"
        );
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvataggio...";
        errorDiv.style.display = "none";

        // TODO: Implementare endpoint di modifica password
        console.log("Modifica password");

        editPasswordModal.style.display = "none";
        document.body.classList.remove("modal-open");
        editPasswordForm.reset();
        resetPasswordIcons();
      } catch (error) {
        console.error("Errore:", error);
        errorDiv.textContent = "❌ Errore nel salvataggio";
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
