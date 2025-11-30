// ==========================================
// ADMIN PANEL - GESTIONE TUTOR
// ==========================================

let allTutor = [];

// ===== CARICA TUTOR =====
async function loadTutor() {
  try {
    const response = await fetch("/admin/tutor", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok && Array.isArray(data.tutor)) {
      // ✅ FILTRA ADMIN
      allTutor = data.tutor.filter((t) => t.email !== "toptutor.it@gmail.com");

      const tbody = document.getElementById("tutorTableBody");
      tbody.innerHTML = "";

      if (allTutor.length === 0) {
        tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px">
            <i class="fas fa-inbox"></i> Nessun tutor registrato
          </td>
        </tr>
      `;
        return;
      }

      allTutor.forEach((tutor) => {
        const dataIscrizione = new Date(tutor.createdAt).toLocaleDateString(
          "it-IT"
        );
        const studentiCount = tutor.studentiAssociati?.length || 0;

        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${tutor.nome}</td>
        <td>${tutor.cognome}</td>
        <td>${tutor.email}</td>
        <td>${studentiCount}</td>
        <td>${dataIscrizione}</td>
        <td>
          <div class="table-actions">
            <button class="btn-view" title="Visualizza" data-id="${tutor._id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-assign-student" title="Assegna Studente" data-id="${tutor._id}">
              <i class="fas fa-link"></i>
            </button>
            <button class="btn-remove-student" title="Rimuovi Studente" data-id="${tutor._id}">
              <i class="fas fa-chain-broken"></i>
            </button>
            <button class="btn-delete" title="Elimina" data-id="${tutor._id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;

        row.querySelector(".btn-view").addEventListener("click", (e) => {
          e.preventDefault();
          // La funzione setupViewTutorModal gestisce tutto dal event listener globale
        });
        row.querySelector(".btn-view").setAttribute("data-id", tutor._id);

        row
          .querySelector(".btn-assign-student")
          .addEventListener("click", (e) => {
            e.preventDefault();
            // La funzione setupAssegnaStudenteModal gestisce tutto dal event listener globale
          });
        row
          .querySelector(".btn-assign-student")
          .setAttribute("data-id", tutor._id);

        row.querySelector(".btn-delete").addEventListener("click", (e) => {
          e.preventDefault();
          // La funzione setupDeleteTutorModal gestisce tutto dal event listener globale
        });
        row.querySelector(".btn-delete").setAttribute("data-id", tutor._id);

        tbody.appendChild(row);
      });

      // ✅ SETUP FILTRO RICERCA
      setupTutorSearch();
    }
  } catch (error) {
    console.error("Errore caricamento tutor:", error);
  }
}

// ===== SETUP RICERCA TUTOR =====
function setupTutorSearch() {
  const searchInput = document.getElementById("searchTutor");

  function filterTable() {
    const searchValue = searchInput.value.toLowerCase();
    const tbody = document.getElementById("tutorTableBody");
    const rows = tbody.querySelectorAll("tr:not(.empty-state-row)");

    let visibleCount = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const nome = cells[0]?.textContent.toLowerCase() || "";
      const cognome = cells[1]?.textContent.toLowerCase() || "";
      const email = cells[2]?.textContent.toLowerCase() || "";

      const searchMatch =
        searchValue === "" ||
        nome.includes(searchValue) ||
        cognome.includes(searchValue) ||
        email.includes(searchValue);

      row.style.display = searchMatch ? "" : "none";
      if (searchMatch) visibleCount++;
    });

    // ✅ Empty state se nessun risultato
    if (visibleCount === 0) {
      const oldEmpty = tbody.querySelector(".empty-state-row");
      if (oldEmpty) oldEmpty.remove();

      const emptyRow = document.createElement("tr");
      emptyRow.className = "empty-state-row";
      emptyRow.innerHTML = `
      <td colspan="6">
        <div class="empty-state-message">Nessun tutor trovato</div>
        <div class="empty-state-submessage">Prova a cambiare la ricerca</div>
      </td>
    `;
      tbody.appendChild(emptyRow);
    } else {
      const oldEmpty = tbody.querySelector(".empty-state-row");
      if (oldEmpty) oldEmpty.remove();
    }
  }

  searchInput.addEventListener("keyup", filterTable);
}

// ===== MODAL: CREA TUTOR CON VALIDAZIONE =====
function setupCreateTutorModal() {
  const createTutorModal = document.getElementById("createTutorModal");
  const createTutorForm = document.getElementById("createTutorForm");
  const closeCreateTutorBtn = document.getElementById("closeCreateTutor");
  const cancelCreateTutorBtn = document.getElementById("cancelCreateTutor");
  const submitCreateTutorBtn = document.getElementById("submitCreateTutor");

  // Apri modal
  document.getElementById("createTutorBtn").addEventListener("click", () => {
    createTutorForm.reset();
    clearTutorErrors();
    resetTutorPasswordIcons();
    createTutorModal.classList.add("show");
    document.body.classList.add("modal-open");
  });

  // Chiudi modal
  closeCreateTutorBtn.addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    createTutorForm.reset();
    resetTutorPasswordIcons();
  });

  cancelCreateTutorBtn.addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    createTutorForm.reset();
    resetTutorPasswordIcons();
  });

  // Chiudi cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === createTutorModal) {
      createTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      createTutorForm.reset();
      resetTutorPasswordIcons();
    }
  });

  // Submit form
  createTutorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearTutorErrors();

    if (!validateTutorForm()) {
      return;
    }

    const formData = {
      nome: document.getElementById("tutorNome").value.trim(),
      cognome: document.getElementById("tutorCognome").value.trim(),
      email: document.getElementById("tutorEmail").value.trim(),
      password: document.getElementById("tutorPassword").value.trim(),
    };

    try {
      submitCreateTutorBtn.disabled = true;
      submitCreateTutorBtn.textContent = "Creazione in corso...";

      const response = await fetch("/admin/tutor/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        createTutorModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        createTutorForm.reset();
        resetTutorPasswordIcons();
        await loadTutor();
      } else {
        showTutorError(data.message || "Errore nella creazione del tutor");
      }
    } catch (error) {
      console.error("Errore:", error);
      showTutorError("Errore di connessione al server");
    } finally {
      submitCreateTutorBtn.disabled = false;
      submitCreateTutorBtn.textContent = "Crea Tutor";
    }
  });
}

// ===== TOGGLE PASSWORD VISIBILITY =====
function setupTutorPasswordToggle() {
  document
    .querySelectorAll("#createTutorModal .password-input-box")
    .forEach((box) => {
      const icon = box.querySelector(".toggle-password");
      const input = box.querySelector("input");

      if (!icon || !input) return;

      const inputId = icon.getAttribute("data-input");
      const actualInput = document.getElementById(inputId);

      if (!actualInput) return;

      function updateIcon() {
        if (actualInput.value.length > 0) {
          icon.classList.remove("fa-lock");
          icon.classList.add("fa-eye");
          icon.style.cursor = "pointer";
          icon.style.pointerEvents = "auto";
        } else {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-lock");
          actualInput.type = "password";
          icon.style.cursor = "default";
          icon.style.pointerEvents = "none";
        }
      }

      actualInput.addEventListener("input", updateIcon);

      // ✅ Toggle senza preventDefault
      icon.addEventListener("click", (e) => {
        e.stopPropagation();

        if (actualInput.type === "password") {
          actualInput.type = "text";
        } else {
          actualInput.type = "password";
        }
      });

      updateIcon();
    });
}

// ===== RESET PASSWORD ICONS =====
function resetTutorPasswordIcons() {
  document
    .querySelectorAll("#createTutorModal .toggle-password")
    .forEach((icon) => {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-lock");
      const inputId = icon.getAttribute("data-input");
      const input = document.getElementById(inputId);
      if (input) input.type = "password";
    });
}

// ===== MODAL: VISUALIZZA PROFILO TUTOR =====
function setupViewTutorModal() {
  const viewTutorModal = document.getElementById("viewTutorModal");
  const closeViewTutorBtn = document.getElementById("closeViewTutor");
  const closeViewTutorBtnFooter = document.getElementById("closeViewTutorBtn");

  let currentTutorId = null;

  // Apri modal quando clicchi bottone view ← CAMBIA DA .btn-edit A .btn-view
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-view"); // ← CAMBIA QUA
    if (btn) {
      currentTutorId = btn.getAttribute("data-id");

      // Trova il tutor nella array
      const tutor = allTutor.find((t) => t._id === currentTutorId);

      if (tutor) {
        // Popola i campi
        document.getElementById("profile-tutor-nome").textContent =
          tutor.nome || "-";
        document.getElementById("profile-tutor-cognome").textContent =
          tutor.cognome || "-";
        document.getElementById("profile-tutor-email").textContent =
          tutor.email || "-";

        // Studenti associati
        const studentiContainer = document.getElementById(
          "profile-tutor-studenti"
        );
        if (tutor.studentiAssociati && tutor.studentiAssociati.length > 0) {
          studentiContainer.innerHTML = tutor.studentiAssociati
            .map((studente) => {
              // Se è un oggetto completo, estrai nome e cognome
              if (typeof studente === "object" && studente !== null) {
                const nomeStudente = `${studente.nome || ""} ${
                  studente.cognome || ""
                }`.trim();
                return `<div class="studente-item">
          <i class="fas fa-graduation-cap"></i> ${nomeStudente || "Studente"}
        </div>`;
              }
              // Se è solo un ID
              return `<div class="studente-item">
        <i class="fas fa-graduation-cap"></i> ${studente}
      </div>`;
            })
            .join("");
        } else {
          studentiContainer.innerHTML =
            '<p class="empty-state-small">Nessuno studente associato</p>';
        }

        // Apri modal
        viewTutorModal.classList.add("show");
        document.body.classList.add("modal-open");
      }
    }
  });

  // Chiudi modal (X)
  closeViewTutorBtn?.addEventListener("click", () => {
    viewTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
  });

  // Chiudi modal (bottone chiudi)
  closeViewTutorBtnFooter?.addEventListener("click", () => {
    viewTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
  });

  // Chiudi modal cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === viewTutorModal) {
      viewTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      currentTutorId = null;
    }
  });
}

// ===== MODAL: ELIMINA TUTOR =====
function setupDeleteTutorModal() {
  const deleteModal = document.getElementById("deleteTutorModal");
  const deleteConfirmBtn = document.getElementById("confirmDeleteTutor");
  const deleteCancelBtn = document.getElementById("cancelDeleteTutor");

  let tutorToDelete = null;

  // Apri modal quando clicchi bottone delete (su una riga)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete"); // ← IMPORTANTE: .closest()
    if (btn) {
      tutorToDelete = btn.getAttribute("data-id");

      // Trova il tutor nella array
      const tutor = allTutor.find((t) => t._id === tutorToDelete);

      if (tutor) {
        // Mostra nome e cognome nel modal
        document.getElementById(
          "deleteName"
        ).textContent = `${tutor.nome} ${tutor.cognome}`;
        deleteModal.classList.add("show");
        document.body.classList.add("modal-open");
      }
    }
  });

  // Chiudi modal (tasto X)
  document.getElementById("closeDeleteTutor")?.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    tutorToDelete = null;
  });

  // Chiudi modal (cancella)
  deleteCancelBtn?.addEventListener("click", () => {
    deleteModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    tutorToDelete = null;
  });

  // Chiudi modal cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      tutorToDelete = null;
    }
  });

  // Conferma eliminazione
  deleteConfirmBtn?.addEventListener("click", async () => {
    if (!tutorToDelete) return;

    try {
      deleteConfirmBtn.disabled = true;
      deleteConfirmBtn.textContent = "Eliminazione in corso...";

      const response = await fetch(`/admin/tutor/${tutorToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        deleteModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor();
        tutorToDelete = null;
      } else {
        const data = await response.json();
      }
    } catch (error) {
      console.error("Errore eliminazione:", error);
    } finally {
      deleteConfirmBtn.disabled = false;
      deleteConfirmBtn.textContent = "Elimina";
    }
  });
}

// ===== MODAL: ASSEGNA STUDENTE A TUTOR =====
function setupAssegnaStudenteModal() {
  const assegnaModal = document.getElementById("assegnaStudenteModal");
  const assegnaForm = document.getElementById("assegnaStudenteForm");
  const selectStudente = document.getElementById("selectStudente");
  const submitBtn = assegnaForm.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById("cancelAssegnaStudente");
  const closeBtn = document.getElementById("closeAssegnaStudente");
  const errorDiv = document.getElementById("assegnaStudenteError");

  let currentTutorId = null;
  let allStudenti = [];

  // Apri modal quando clicchi bottone assign-student
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-assign-student");
    if (btn) {
      currentTutorId = btn.getAttribute("data-id");
      const tutor = allTutor.find((t) => t._id === currentTutorId);

      if (tutor) {
        loadStudentiForAssignment(tutor);
        assegnaModal.classList.add("show");
        document.body.classList.add("modal-open");
        errorDiv.style.display = "none";
        assegnaForm.reset();
      }
    }
  });

  // Carica lista studenti disponibili (escluso quelli già associati)
  async function loadStudentiForAssignment(tutor) {
    // RESET - Pulisci la select prima di popolarla
    selectStudente.innerHTML =
      '<option value="" disabled selected>Seleziona Studente</option>';

    try {
      const response = await fetch("/admin/student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.studenti)) {
        allStudenti = data.studenti;

        // ✅ LOGICA CORRETTA - Estrai gli ID degli studenti già associati
        let studenteAssociatiIds = [];

        if (tutor.studentiAssociati && Array.isArray(tutor.studentiAssociati)) {
          studenteAssociatiIds = tutor.studentiAssociati
            .map((s) => (typeof s === "object" && s !== null ? s._id : s))
            .filter(Boolean);
        }

        // Filtra i studenti (escludi quelli già associati)
        const studentiDisponibili = allStudenti.filter(
          (s) => !studenteAssociatiIds.includes(s._id)
        );

        if (studentiDisponibili.length === 0) {
          selectStudente.innerHTML =
            '<option value="" disabled selected>ℹ️ Tutti gli studenti sono già associati a questo tutor</option>';
          selectStudente.disabled = false;
          submitBtn.disabled = true;
        } else {
          studentiDisponibili.forEach((studente) => {
            const option = document.createElement("option");
            option.value = studente._id;
            option.textContent = `${studente.nome} ${studente.cognome} (${studente.email})`;
            selectStudente.appendChild(option);
          });
          selectStudente.disabled = false;
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
    assegnaModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
    errorDiv.style.display = "none";
  });

  // Chiudi modal (Annulla)
  cancelBtn?.addEventListener("click", () => {
    assegnaModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
    errorDiv.style.display = "none";
  });

  // Chiudi modal cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === assegnaModal) {
      assegnaModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      currentTutorId = null;
      errorDiv.style.display = "none";
    }
  });

  // Submit form - Assegna studente
  assegnaForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studenteId = selectStudente.value;

    if (!studenteId) {
      errorDiv.textContent = "⚠️ Seleziona uno studente";
      errorDiv.style.display = "block";
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Assegnazione in corso...";
      errorDiv.style.display = "none";

      const response = await fetch(
        `/admin/tutor/${currentTutorId}/assegna-studente`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studenteID: studenteId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        assegnaModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor(); // Ricarica tabella

        // AGGIUNGI QUESTA LINEA - Aggiorna la select per prossima apertura
        currentTutorId = null;

        assegnaForm.reset();
      } else {
        errorDiv.textContent = `❌ ${
          data.message || "Errore nell'assegnazione"
        }`;
        errorDiv.style.display = "block";
      }
    } catch (error) {
      console.error("Errore assegnazione:", error);
      errorDiv.textContent = "❌ Errore di connessione al server";
      errorDiv.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Assegna";
    }
  });
}

// ===== MODAL: RIMUOVI STUDENTE DA TUTOR =====
function setupRimuoviStudenteModal() {
  const rimuoviModal = document.getElementById("rimuoviStudenteModal");
  const rimuoviForm = document.getElementById("rimuoviStudenteForm");
  const selectStudenteRimuovi = document.getElementById(
    "selectStudenteRimuovi"
  );
  const submitBtn = rimuoviForm.querySelector('button[type="submit"]');
  const cancelBtn = document.getElementById("cancelRimuoviStudente");
  const closeBtn = document.getElementById("closeRimuoviStudente");
  const errorDiv = document.getElementById("rimuoviStudenteError");

  let currentTutorId = null;

  // Apri modal quando clicchi bottone remove-student
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove-student");
    if (btn) {
      currentTutorId = btn.getAttribute("data-id");
      const tutor = allTutor.find((t) => t._id === currentTutorId);

      if (tutor) {
        loadStudentiPerRimozione(tutor);
        rimuoviModal.classList.add("show");
        document.body.classList.add("modal-open");
        errorDiv.style.display = "none";
        rimuoviForm.reset();
      }
    }
  });

  // Carica lista studenti associati (solo quelli da rimuovere)
  function loadStudentiPerRimozione(tutor) {
    // RESET - Pulisci la select prima di popolarla
    selectStudenteRimuovi.innerHTML =
      '<option value="" disabled selected>Seleziona Studente</option>';

    if (!tutor.studentiAssociati || tutor.studentiAssociati.length === 0) {
      selectStudenteRimuovi.innerHTML =
        '<option value="" disabled selected>ℹ️ Nessuno studente associato</option>';
      selectStudenteRimuovi.disabled = false;
      submitBtn.disabled = true;
      return;
    }

    // Popola la select con gli studenti associati
    tutor.studentiAssociati.forEach((studente) => {
      const option = document.createElement("option");

      // Se è un oggetto completo
      if (typeof studente === "object" && studente !== null) {
        option.value = studente._id;
        option.textContent = `${studente.nome} ${studente.cognome} (${studente.email})`;
      } else {
        // Se è solo un ID
        option.value = studente;
        option.textContent = `Studente ID: ${studente}`;
      }

      selectStudenteRimuovi.appendChild(option);
    });

    selectStudenteRimuovi.disabled = false;
    submitBtn.disabled = false;
  }

  // Chiudi modal (X)
  closeBtn?.addEventListener("click", () => {
    rimuoviModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
    errorDiv.style.display = "none";
  });

  // Chiudi modal (Annulla)
  cancelBtn?.addEventListener("click", () => {
    rimuoviModal.classList.remove("show");
    document.body.classList.remove("modal-open");
    currentTutorId = null;
    errorDiv.style.display = "none";
  });

  // Chiudi modal cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === rimuoviModal) {
      rimuoviModal.classList.remove("show");
      document.body.classList.remove("modal-open");
      currentTutorId = null;
      errorDiv.style.display = "none";
    }
  });

  // Submit form - Rimuovi studente
  rimuoviForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studenteId = selectStudenteRimuovi.value;

    if (!studenteId) {
      errorDiv.textContent = "⚠️ Seleziona uno studente";
      errorDiv.style.display = "block";
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Rimozione in corso...";
      errorDiv.style.display = "none";

      const response = await fetch(
        `/admin/tutor/${currentTutorId}/rimuovi-studente`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studenteID: studenteId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        rimuoviModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor(); // Ricarica tabella
        currentTutorId = null;
        rimuoviForm.reset();
      } else {
        errorDiv.textContent = `❌ ${data.message || "Errore nella rimozione"}`;
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

// ===== UTILITY FUNCTIONS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function clearTutorErrors() {
  document.getElementById("tutorErrors").innerHTML = "";
  document.querySelectorAll("#createTutorForm input").forEach((input) => {
    input.classList.remove("input-error");
  });
}

function showTutorError(message) {
  const errorContainer = document.getElementById("tutorErrors");
  errorContainer.innerHTML = `
  <div class="error-message">
    ${message}
  </div>
`;
  errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
}

function addInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("input-error");
  }
}

function validateTutorForm() {
  const nome = document.getElementById("tutorNome").value.trim();
  const cognome = document.getElementById("tutorCognome").value.trim();
  const email = document.getElementById("tutorEmail").value.trim();
  const password = document.getElementById("tutorPassword").value.trim();
  const confirmPassword = document
    .getElementById("tutorConfirmPassword")
    .value.trim();

  // Nome
  if (!nome || nome.length < 2) {
    showTutorError("⚠️ Nome deve contenere almeno 2 caratteri");
    addInputError("tutorNome");
    return false;
  }

  // Cognome
  if (!cognome || cognome.length < 2) {
    showTutorError("⚠️ Cognome deve contenere almeno 2 caratteri");
    addInputError("tutorCognome");
    return false;
  }

  // Email
  if (!isValidEmail(email)) {
    showTutorError("⚠️ Email non valida (es: tutor@example.com)");
    addInputError("tutorEmail");
    return false;
  }

  // Password
  if (!password || password.length < 8) {
    showTutorError(
      "⚠️ Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)"
    );
    addInputError("tutorPassword");
    return false;
  }

  // Conferma Password
  if (password !== confirmPassword) {
    showTutorError("⚠️ Le password non corrispondono");
    addInputError("tutorConfirmPassword");
    return false;
  }

  return true;
}

// ===== INITIALIZATION =====
loadTutor();
setupCreateTutorModal();
setupTutorPasswordToggle();
setupViewTutorModal();
setupDeleteTutorModal();
setupAssegnaStudenteModal();
setupRimuoviStudenteModal(); // ← AGGIUNGI QUESTA
setupTutorSearch();
