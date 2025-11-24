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
            <button class="btn-edit" title="Modifica" data-id="${tutor._id}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-assign-student" title="Assegna Studente" data-id="${tutor._id}">
              <i class="fas fa-link"></i>
            </button>
            <button class="btn-delete" title="Elimina" data-id="${tutor._id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;

        // ✅ EVENT LISTENERS (per ora vuoti, li aggiungeremo dopo)
        row.querySelector(".btn-edit").addEventListener("click", () => {
          console.log("Modifica tutor:", tutor._id);
          // TODO: Implementare modifica
        });

        row
          .querySelector(".btn-assign-student")
          .addEventListener("click", () => {
            console.log("Assegna studente a tutor:", tutor._id);
            // TODO: Implementare assegnazione
          });

        row.querySelector(".btn-delete").addEventListener("click", () => {
          console.log("Elimina tutor:", tutor._id);
          // TODO: Implementare eliminazione
        });

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
    createTutorModal.classList.add("show");
    document.body.classList.add("modal-open");
  });

  // Chiudi modal
  closeCreateTutorBtn.addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  cancelCreateTutorBtn.addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  // Chiudi cliccando fuori
  window.addEventListener("click", (e) => {
    if (e.target === createTutorModal) {
      createTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
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
        showToast("✅ Tutor creato con successo", "success");
        createTutorModal.classList.remove("show");
        document.body.classList.remove("modal-open");
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

  return true;
}
