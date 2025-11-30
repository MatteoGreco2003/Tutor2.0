// ==========================================
// HOME TUTOR 2.0 - JS BASE
// ==========================================

// ======= BLOCCA BACK BUTTON =======
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ===== HAMBURGER MENU =====
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn?.addEventListener("click", () => {
  hamburgerBtn.classList.toggle("active");
  sidebar.classList.toggle("active");
});

// Chiudi sidebar quando clicchi su un link
document.querySelectorAll(".sidebar-item").forEach((item) => {
  item.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
  });
});

// Chiudi sidebar quando clicchi fuori
document.addEventListener("click", (e) => {
  if (!e.target.closest(".sidebar") && !e.target.closest(".hamburger-btn")) {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
  }
});

// ========== SETUP ON LOAD ==========
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

  // ============ HEADER DINAMICO (Nome/Cognome) ============
  // (tipico: chiamata GET ai dati del tutor)
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
      // Potresti salvare window._tutorData = data.data; // utile per altre funzioni
    }
  } catch (err) {
    console.error("Errore caricamento dati tutor:", err);
    // Se vuoi, redirect al login se errore di autenticazione
  }

  // ============ TABELLA STUDENTI ASSOCIATI (ES.) ===========
  // Funzione demo: puoi rimpiazzare con fetch da backend!
  renderStudentTable([]);

  // ========== SETUP AGGIUNGI STUDENTE ==========
  function setupAddStudentModal() {
    const addStudentModal = document.getElementById("addStudentModal");
    const addStudentForm = document.getElementById("addStudentForm");
    const selectStudenteToAdd = document.getElementById("selectStudenteToAdd");
    const submitBtn = addStudentForm.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById("cancelAddStudent");
    const closeBtn = document.getElementById("closeAddStudent");
    const errorDiv = document.getElementById("addStudentError");

    let allStudenti = [];
    let currentStudentiAssociati = [];

    // Apri modal quando clicchi bottone add-student
    document.getElementById("addStudentBtn")?.addEventListener("click", () => {
      loadStudentiForAddition();
      addStudentModal.classList.add("show");
      document.body.classList.add("modal-open");
      errorDiv.style.display = "none";
      addStudentForm.reset();
    });

    // Carica lista studenti disponibili (escluso quelli già associati)
    async function loadStudentiForAddition() {
      // RESET - Pulisci la select prima di popolarla
      selectStudenteToAdd.innerHTML =
        '<option value="" disabled selected>Seleziona Studente</option>';

      try {
        // Chiamata 1: Ottieni TUTTI gli studenti
        const allResponse = await fetch("/admin/student", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Chiamata 2: Ottieni SOLO gli studenti già associati
        const associatiResponse = await fetch("/tutor/studenti", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allData = await allResponse.json();
        const associatiData = await associatiResponse.json();

        if (allResponse.ok && Array.isArray(allData.studenti)) {
          allStudenti = allData.studenti;
          const studentiAssociati =
            associatiResponse.ok && Array.isArray(associatiData.studenti)
              ? associatiData.studenti
              : [];

          // Ottieni gli ID degli studenti associati
          currentStudentiAssociati = studentiAssociati.map((s) => s.id);

          // Filtra: mostra solo studenti NON associati
          const studentiDisponibili = allStudenti.filter(
            (s) => !currentStudentiAssociati.includes(s._id)
          );

          if (studentiDisponibili.length === 0) {
            selectStudenteToAdd.innerHTML =
              '<option value="" disabled selected>ℹ️ Tutti gli studenti sono già associati</option>';
            submitBtn.disabled = true;
          } else {
            studentiDisponibili.forEach((studente) => {
              const option = document.createElement("option");
              option.value = studente._id;
              option.textContent = `${studente.nome} ${studente.cognome} (${studente.email})`;
              selectStudenteToAdd.appendChild(option);
            });
            submitBtn.disabled = false;
          }
        }
      } catch (error) {
        console.error("Errore caricamento studenti:", error);
        errorDiv.textContent = "❌ Errore nel caricamento degli studenti";
        errorDiv.style.display = "block";
      }
    }

    // Chiudi modal (X)
    closeBtn?.addEventListener("click", () => {
      addStudentModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      errorDiv.style.display = "none";
    });

    // Chiudi modal (Annulla)
    cancelBtn?.addEventListener("click", () => {
      addStudentModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      errorDiv.style.display = "none";
    });

    // Chiudi modal cliccando fuori
    window.addEventListener("click", (e) => {
      if (e.target === addStudentModal) {
        addStudentModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        errorDiv.style.display = "none";
      }
    });

    // Submit form - Aggiungi studente
    addStudentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const studenteId = selectStudenteToAdd.value;

      if (!studenteId) {
        errorDiv.textContent = "⚠️ Seleziona uno studente";
        errorDiv.style.display = "block";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Aggiunta in corso...";
        errorDiv.style.display = "none";

        const response = await fetch("/tutor/studenti/associa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studenteID: studenteId }),
        });

        const data = await response.json();

        if (response.ok) {
          addStudentModal.classList.remove("show");
          document.body.classList.remove("modal-open");
          await loadStudenti(); // Ricarica tabella

          // AGGIUNGI QUESTA LINEA - Aggiorna la select per prossima apertura
          await loadStudentiForAddition();

          addStudentForm.reset();
        } else {
          errorDiv.textContent = `❌ ${data.message || "Errore nell'aggiunta"}`;
          errorDiv.style.display = "block";
        }
      } catch (error) {
        console.error("Errore aggiunta:", error);
        errorDiv.textContent = "❌ Errore di connessione al server";
        errorDiv.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Aggiungi Studente";
      }
    });
  }

  // ========== SETUP RIMUOVI STUDENTE ==========
  function setupRemoveStudentModal() {
    const removeStudentModal = document.getElementById("removeStudentModal");
    const removeStudentForm = document.getElementById("removeStudentForm");
    const selectStudenteToRemove = document.getElementById(
      "selectStudenteToRemove"
    );
    const submitBtn = removeStudentForm.querySelector('button[type="submit"]');
    const cancelBtn = document.getElementById("cancelRemoveStudent");
    const closeBtn = document.getElementById("closeRemoveStudent");
    const errorDiv = document.getElementById("removeStudentError");

    // Apri modal quando clicchi bottone remove-student
    document
      .getElementById("removeStudentBtn")
      ?.addEventListener("click", () => {
        loadStudentiForRemoval();
        removeStudentModal.classList.add("show");
        document.body.classList.add("modal-open");
        errorDiv.style.display = "none";
        removeStudentForm.reset();
      });

    // Carica lista studenti associati (solo quelli da rimuovere)
    async function loadStudentiForRemoval() {
      // RESET - Pulisci la select prima di popolarla
      selectStudenteToRemove.innerHTML =
        '<option value="" disabled selected>Seleziona Studente</option>';

      try {
        const response = await fetch("/tutor/studenti", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok || !data.studenti || data.studenti.length === 0) {
          selectStudenteToRemove.innerHTML =
            '<option value="" disabled selected>ℹ️ Nessuno studente associato</option>';
          submitBtn.disabled = true;
          return;
        }

        // Popola la select con gli studenti associati
        data.studenti.forEach((studente) => {
          const option = document.createElement("option");
          option.value = studente.id;
          option.textContent = `${studente.nome} ${studente.cognome} (${studente.email})`;
          selectStudenteToRemove.appendChild(option);
        });

        submitBtn.disabled = false;
      } catch (error) {
        console.error("Errore caricamento studenti:", error);
        errorDiv.textContent = "❌ Errore nel caricamento degli studenti";
        errorDiv.style.display = "block";
      }
    }

    // Chiudi modal (X)
    closeBtn?.addEventListener("click", () => {
      removeStudentModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      errorDiv.style.display = "none";
    });

    // Chiudi modal (Annulla)
    cancelBtn?.addEventListener("click", () => {
      removeStudentModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      errorDiv.style.display = "none";
    });

    // Chiudi modal cliccando fuori
    window.addEventListener("click", (e) => {
      if (e.target === removeStudentModal) {
        removeStudentModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        errorDiv.style.display = "none";
      }
    });

    // Submit form - Rimuovi studente
    removeStudentForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const studenteId = selectStudenteToRemove.value;

      if (!studenteId) {
        errorDiv.textContent = "⚠️ Seleziona uno studente";
        errorDiv.style.display = "block";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Rimozione in corso...";
        errorDiv.style.display = "none";

        const response = await fetch("/tutor/studenti/rimuovi", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studenteID: studenteId }),
        });

        const data = await response.json();

        if (response.ok) {
          removeStudentModal.classList.remove("show");
          document.body.classList.remove("modal-open");
          await loadStudenti(); // Ricarica tabella

          // AGGIUNGI QUESTA LINEA - Aggiorna la select per prossima apertura
          await loadStudentiForRemoval();

          removeStudentForm.reset();
        } else {
          errorDiv.textContent = `❌ ${
            data.message || "Errore nella rimozione"
          }`;
          errorDiv.style.display = "block";
        }
      } catch (error) {
        console.error("Errore rimozione:", error);
        errorDiv.textContent = "❌ Errore di connessione al server";
        errorDiv.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Rimuovi Studente";
      }
    });
  }

  // Chiama le funzioni di setup
  setupAddStudentModal();
  setupRemoveStudentModal();
  setupViewStudenteModal();

  // ============ CARICA STUDENTI ASSOCIATI ===========
  async function loadStudenti() {
    try {
      const response = await fetch("/tutor/studenti", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.studenti) {
        // Per ogni studente, recupera il check delle insufficienze
        const studentiConInsufficenze = await Promise.all(
          data.studenti.map(async (studente) => {
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
              // Se errore, considera senza insufficienze
              return {
                ...studente,
                insufficienti: false,
              };
            }
          })
        );

        renderStudentTable(studentiConInsufficenze);
      } else {
        renderStudentTable([]);
      }
    } catch (error) {
      console.error("Errore caricamento studenti:", error);
      renderStudentTable([]);
    }
  }

  // Carica studenti all'avvio
  loadStudenti();

  // ========== SETUP VISUALIZZA PROFILO STUDENTE ==========
  function setupViewStudenteModal() {
    const viewStudenteModal = document.getElementById("viewStudenteModal");
    const closeViewStudenteBtn = document.getElementById("closeViewStudente");
    const closeViewStudenteBtnFooter = document.getElementById(
      "closeViewStudenteBtn"
    );

    let currentStudenteId = null;

    // Apri modal quando clicchi bottone view (occhio)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-view");
      if (btn) {
        currentStudenteId = btn.getAttribute("data-student-id");
        loadStudenteProfile(currentStudenteId);
        viewStudenteModal.classList.add("show");
        document.body.classList.add("modal-open");
      }
    });

    // Carica dati profilo studente
    async function loadStudenteProfile(studenteId) {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/tutor/studenti/${studenteId}/riepilogo`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.studente) {
          const studente = data.studente;

          // ===== SEZIONE 1: DATI PERSONALI =====
          document.getElementById("profile-nome").textContent =
            studente.nome || "-";
          document.getElementById("profile-cognome").textContent =
            studente.cognome || "-";
          document.getElementById("profile-telefono").textContent =
            studente.telefono || "-";
          document.getElementById("profile-grado-scolastico").textContent =
            studente.scuola || "-";
          document.getElementById("profile-indirizzo-scolastico").textContent =
            studente.indirizzo || "-";

          // ===== SEZIONE 2: DATI FAMIGLIA =====
          // Genitore 1
          if (studente.genitore1) {
            const g1 = studente.genitore1;
            document.getElementById("profile-genitore1-nome").textContent =
              g1.nome || "-";
            document.getElementById("profile-genitore1-cognome").textContent =
              g1.cognome || "-";
            document.getElementById("profile-genitore1-telefono").textContent =
              g1.telefono || "-";
          } else {
            document.getElementById("profile-genitore1-nome").textContent = "-";
            document.getElementById("profile-genitore1-cognome").textContent =
              "-";
            document.getElementById("profile-genitore1-telefono").textContent =
              "-";
          }

          // Genitore 2
          if (studente.genitore2) {
            const g2 = studente.genitore2;
            document.getElementById("profile-genitore2-nome").textContent =
              g2.nome || "-";
            document.getElementById("profile-genitore2-cognome").textContent =
              g2.cognome || "-";
            document.getElementById("profile-genitore2-telefono").textContent =
              g2.telefono || "-";
          } else {
            document.getElementById("profile-genitore2-nome").textContent = "-";
            document.getElementById("profile-genitore2-cognome").textContent =
              "-";
            document.getElementById("profile-genitore2-telefono").textContent =
              "-";
          }

          // Email Famiglia
          document.getElementById("profile-email-famiglia").textContent =
            studente.emailFamiglia || "-";

          // ===== SEZIONE 3: DATI SCUOLA =====
          const emailProfessoriContainer = document.getElementById(
            "profile-email-professori"
          );
          emailProfessoriContainer.innerHTML = "";

          const emailArray = studente.emailInsegnanti || [];

          if (
            emailArray &&
            Array.isArray(emailArray) &&
            emailArray.length > 0
          ) {
            emailArray.forEach((email) => {
              const p = document.createElement("p");
              p.textContent = email;
              emailProfessoriContainer.appendChild(p);
            });
          } else {
            const p = document.createElement("p");
            p.textContent = "-";
            emailProfessoriContainer.appendChild(p);
          }
        }
      } catch (error) {
        console.error("Errore caricamento profilo:", error);
      }
    }

    // Chiudi modal (X)
    closeViewStudenteBtn?.addEventListener("click", () => {
      viewStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      currentStudenteId = null;
    });

    // Chiudi modal (bottone chiudi)
    closeViewStudenteBtnFooter?.addEventListener("click", () => {
      viewStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      currentStudenteId = null;
    });

    // Chiudi modal cliccando fuori
    window.addEventListener("click", (e) => {
      if (e.target === viewStudenteModal) {
        viewStudenteModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        currentStudenteId = null;
      }
    });
  }

  // Chiama il setup
  setupViewStudenteModal();
});

// =========== RENDER TABELLA STUDENTI ASSOCIATI ===========
function renderStudentTable(studenti) {
  const tableBody = document.getElementById("tutorStudentTableBody");
  const totalCount = document.getElementById("totalStudentiCount");

  // Aggiorna il contatore
  totalCount.textContent = studenti && studenti.length ? studenti.length : 0;

  tableBody.innerHTML =
    studenti && studenti.length
      ? studenti
          .map(
            (stud) => `
        <tr>
          <td>${stud.nome} ${stud.cognome || ""}</td>
            <td>${stud.email}</td>
          <td>${stud.scuola}</td>
          <td>${stud.insufficienti ? "SI" : "NO"}</td>
          <td>
            <div class="table-actions">
              <button class="btn-view" title="Visualizza Profilo" data-student-id="${
                stud.id
              }"><i class="fas fa-eye"></i></button>
              <button class="btn-scheda" title="Visualizza Scheda" data-student-id="${
                stud.id
              }">
                <i class="fas fa-file-alt"></i>
              </button>
            </div>
          </td>
        </tr>`
          )
          .join("")
      : `<tr class="empty-state-row">
          <td colspan="5">
            <p class="empty-state-message">Nessuno studente associato</p>
            <p class="empty-state-submessage">Aggiungi il tuo primo studente per iniziare</p>
          </td>
        </tr>`;

  setupStudentTableButtons();
}

function setupStudentTableButtons() {
  // Click su pulsante SCHEDA
  document.querySelectorAll(".btn-scheda").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const studentId = btn.getAttribute("data-student-id");
      // Passa l'ID dello studente come query parameter
      window.location.href = `/scheda-studente?studenteID=${studentId}`;
    });
  });
}
