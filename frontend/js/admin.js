// ==========================================
// ADMIN PANEL - TUTOR 2.0
// ==========================================

// ===== DISABILITA BACK DOPO LOGOUT E CONTROLLA TOKEN =====
window.addEventListener("pageshow", (event) => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }
});

window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function (event) {
  window.history.pushState(null, null, window.location.href);
});

// ==========================================
// CARICAMENTO PAGINA
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");
  console.log("Admin Token:", token);

  if (!token) {
    window.location.href = "/";
    return;
  }

  // ===== VARIABILI GLOBALI =====
  let currentTutorEditID = null;
  let currentTutorDeleteID = null;
  let currentStudenteDeleteID = null;
  let currentTutorAssegnaID = null;
  let allStudenti = [];
  let allTutor = [];

  // ===== MODALI =====
  const createTutorModal = document.getElementById("createTutorModal");
  const editTutorModal = document.getElementById("editTutorModal");
  const deleteTutorModal = document.getElementById("deleteTutorModal");
  const deleteStudenteModal = document.getElementById("deleteStudenteModal");
  const assegnaStudenteModal = document.getElementById("assegnaStudenteModal");

  // ===== FORMS =====
  const createTutorForm = document.getElementById("createTutorForm");
  const editTutorForm = document.getElementById("editTutorForm");
  const assegnaStudenteForm = document.getElementById("assegnaStudenteForm");

  // ===== NAVIGAZIONE PAGINE =====
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const pages = document.querySelectorAll(".page");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // Rimuovi active da tutti
      sidebarItems.forEach((i) => i.classList.remove("active"));
      pages.forEach((p) => (p.style.display = "none"));

      // Aggiungi active al cliccato
      item.classList.add("active");

      // Mostra la pagina corrispondente
      const pageName = item.getAttribute("data-page");
      const pageElement = document.getElementById(`page-${pageName}`);
      if (pageElement) {
        pageElement.style.display = "block";

        // Carica dati se necessario
        if (pageName === "studenti") {
          loadStudenti();
        } else if (pageName === "tutor") {
          loadTutor();
        } else if (pageName === "home") {
          loadStatistiche();
        }
      }
    });
  });

  // ===== CARICA STATISTICHE =====
  async function loadStatistiche() {
    try {
      const [tutorRes, studentiRes] = await Promise.all([
        fetch("/admin/tutor", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/admin/student", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const tutorData = await tutorRes.json();
      const studentiData = await studentiRes.json();

      document.getElementById("totalTutor").textContent = tutorData.count || 0;
      document.getElementById("totalStudenti").textContent =
        studentiData.count || 0;
    } catch (error) {
      console.error("Errore caricamento statistiche:", error);
    }
  }

  // ===== CARICA STUDENTI =====
  async function loadStudenti() {
    try {
      const response = await fetch("/admin/student", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.studenti)) {
        allStudenti = data.studenti;

        const tbody = document.getElementById("studenteTableBody");
        tbody.innerHTML = "";

        if (data.studenti.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 40px">
                <i class="fas fa-inbox"></i> Nessuno studente registrato
              </td>
            </tr>
          `;
          return;
        }

        data.studenti.forEach((studente) => {
          const dataIscrizione = new Date(
            studente.createdAt
          ).toLocaleDateString("it-IT");

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${studente.nome}</td>
            <td>${studente.cognome}</td>
            <td>${studente.email}</td>
            <td>${studente.gradoScolastico || "-"}</td>
            <td>${dataIscrizione}</td>
            <td>
              <div class="table-actions">
                <button class="btn-delete" title="Elimina" data-id="${
                  studente._id
                }">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          `;

          row.querySelector(".btn-delete").addEventListener("click", () => {
            currentStudenteDeleteID = studente._id;
            deleteStudenteModal.classList.add("show");
            document.body.classList.add("modal-open");
          });

          tbody.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Errore caricamento studenti:", error);
    }
  }

  // ===== CARICA TUTOR =====
  async function loadTutor() {
    try {
      const response = await fetch("/admin/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.tutor)) {
        allTutor = data.tutor;

        const tbody = document.getElementById("tutorTableBody");
        tbody.innerHTML = "";

        if (data.tutor.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 40px">
                <i class="fas fa-inbox"></i> Nessun tutor registrato
              </td>
            </tr>
          `;
          return;
        }

        data.tutor.forEach((tutor) => {
          const dataIscrizione = new Date(tutor.createdAt).toLocaleDateString(
            "it-IT"
          );

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${tutor.nome}</td>
            <td>${tutor.cognome}</td>
            <td>${tutor.email}</td>
            <td>
              <span class="badge-count">${
                tutor.studentiAssociati?.length || 0
              }</span>
            </td>
            <td>${dataIscrizione}</td>
            <td>
              <div class="table-actions">
                <button class="btn-edit" title="Modifica" data-id="${
                  tutor._id
                }">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="btn-assign" title="Assegna Studente" data-id="${
                  tutor._id
                }">
                  <i class="fas fa-link"></i>
                </button>
                <button class="btn-delete" title="Elimina" data-id="${
                  tutor._id
                }">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          `;

          row.querySelector(".btn-edit").addEventListener("click", () => {
            openEditTutorModal(tutor);
          });

          row.querySelector(".btn-assign").addEventListener("click", () => {
            openAssegnaStudenteModal(tutor._id);
          });

          row.querySelector(".btn-delete").addEventListener("click", () => {
            currentTutorDeleteID = tutor._id;
            deleteTutorModal.classList.add("show");
            document.body.classList.add("modal-open");
          });

          tbody.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Errore caricamento tutor:", error);
    }
  }

  // ===== LOGOUT =====
  document.querySelector(".logout-btn").addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Errore logout:", error);
    }
  });

  // ===== AZIONI RAPIDE =====
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");

      if (action === "create-tutor") {
        openCreateTutorModal();
      } else if (action === "view-studenti") {
        sidebarItems[1].click();
      } else if (action === "view-tutor") {
        sidebarItems[2].click();
      }
    });
  });

  // ===== MODAL: CREA TUTOR =====
  document.getElementById("addTutorBtn").addEventListener("click", () => {
    openCreateTutorModal();
  });

  function openCreateTutorModal() {
    createTutorForm.reset();
    document.getElementById("createTutorError").style.display = "none";
    createTutorModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  document.getElementById("closeCreateTutor").addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  document.getElementById("cancelCreateTutor").addEventListener("click", () => {
    createTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  createTutorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("tutorNome").value.trim();
    const cognome = document.getElementById("tutorCognome").value.trim();
    const email = document.getElementById("tutorEmail").value.trim();
    const password = document.getElementById("tutorPassword").value.trim();
    const errorDiv = document.getElementById("createTutorError");

    // Validazione
    if (!nome || !cognome || !email || !password) {
      errorDiv.textContent = "⚠️ Tutti i campi sono obbligatori";
      errorDiv.style.display = "block";
      return;
    }

    if (password.length < 8) {
      errorDiv.textContent = "⚠️ Password minimo 8 caratteri";
      errorDiv.style.display = "block";
      return;
    }

    try {
      const response = await fetch("/admin/tutor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, cognome, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        createTutorModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor();
      } else {
        errorDiv.textContent = `⚠️ ${data.message}`;
        errorDiv.style.display = "block";
      }
    } catch (error) {
      errorDiv.textContent = "⚠️ Errore di connessione";
      errorDiv.style.display = "block";
    }
  });

  // ===== MODAL: MODIFICA TUTOR =====
  function openEditTutorModal(tutor) {
    currentTutorEditID = tutor._id;
    document.getElementById("editTutorNome").value = tutor.nome;
    document.getElementById("editTutorCognome").value = tutor.cognome;
    document.getElementById("editTutorEmail").value = tutor.email;
    document.getElementById("editTutorError").style.display = "none";
    editTutorModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  document.getElementById("closeEditTutor").addEventListener("click", () => {
    editTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  document.getElementById("cancelEditTutor").addEventListener("click", () => {
    editTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  editTutorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("editTutorNome").value.trim();
    const cognome = document.getElementById("editTutorCognome").value.trim();
    const email = document.getElementById("editTutorEmail").value.trim();
    const errorDiv = document.getElementById("editTutorError");

    if (!nome || !cognome || !email) {
      errorDiv.textContent = "⚠️ Tutti i campi sono obbligatori";
      errorDiv.style.display = "block";
      return;
    }

    try {
      const response = await fetch(`/admin/tutor/${currentTutorEditID}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, cognome, email }),
      });

      const data = await response.json();

      if (response.ok) {
        editTutorModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor();
      } else {
        errorDiv.textContent = `⚠️ ${data.message}`;
        errorDiv.style.display = "block";
      }
    } catch (error) {
      errorDiv.textContent = "⚠️ Errore di connessione";
      errorDiv.style.display = "block";
    }
  });

  // ===== MODAL: ASSEGNA STUDENTE =====
  function openAssegnaStudenteModal(tutorID) {
    currentTutorAssegnaID = tutorID;
    const select = document.getElementById("selectStudente");
    select.innerHTML = '<option value="">-- Seleziona uno studente --</option>';

    allStudenti.forEach((studente) => {
      const option = document.createElement("option");
      option.value = studente._id;
      option.textContent = `${studente.nome} ${studente.cognome} (${studente.email})`;
      select.appendChild(option);
    });

    document.getElementById("assegnaStudenteError").style.display = "none";
    assegnaStudenteModal.classList.add("show");
    document.body.classList.add("modal-open");
  }

  document
    .getElementById("closeAssegnaStudente")
    .addEventListener("click", () => {
      assegnaStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelAssegnaStudente")
    .addEventListener("click", () => {
      assegnaStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  assegnaStudenteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const studenteID = document.getElementById("selectStudente").value;
    const errorDiv = document.getElementById("assegnaStudenteError");

    if (!studenteID) {
      errorDiv.textContent = "⚠️ Seleziona uno studente";
      errorDiv.style.display = "block";
      return;
    }

    try {
      const response = await fetch(
        `/admin/tutor/${currentTutorAssegnaID}/assegna-studente`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studenteID }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        assegnaStudenteModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        await loadTutor();
      } else {
        errorDiv.textContent = `⚠️ ${data.message}`;
        errorDiv.style.display = "block";
      }
    } catch (error) {
      errorDiv.textContent = "⚠️ Errore di connessione";
      errorDiv.style.display = "block";
    }
  });

  // ===== MODAL: ELIMINA TUTOR =====
  document.getElementById("closeDeleteTutor").addEventListener("click", () => {
    deleteTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  document.getElementById("cancelDeleteTutor").addEventListener("click", () => {
    deleteTutorModal.classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("confirmDeleteTutor")
    .addEventListener("click", async () => {
      if (!currentTutorDeleteID) return;

      try {
        const response = await fetch(`/admin/tutor/${currentTutorDeleteID}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          deleteTutorModal.classList.remove("show");
          document.body.classList.remove("modal-open");
          await loadTutor();
        } else {
          alert("Errore nell'eliminazione del tutor");
        }
      } catch (error) {
        alert("Errore di connessione");
      }
    });

  // ===== MODAL: ELIMINA STUDENTE =====
  document
    .getElementById("closeDeleteStudente")
    .addEventListener("click", () => {
      deleteStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelDeleteStudente")
    .addEventListener("click", () => {
      deleteStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("confirmDeleteStudente")
    .addEventListener("click", async () => {
      if (!currentStudenteDeleteID) return;

      try {
        const response = await fetch(
          `/admin/student/${currentStudenteDeleteID}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          deleteStudenteModal.classList.remove("show");
          document.body.classList.remove("modal-open");
          await loadStudenti();
        } else {
          alert("Errore nell'eliminazione dello studente");
        }
      } catch (error) {
        alert("Errore di connessione");
      }
    });

  // ===== SEARCH STUDENTI =====
  document.getElementById("searchStudenti").addEventListener("keyup", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document
      .getElementById("studenteTableBody")
      .querySelectorAll("tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });

  // ===== CHIUDI MODALI CLICCANDO FUORI =====
  window.addEventListener("click", (e) => {
    if (e.target === createTutorModal) {
      createTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === editTutorModal) {
      editTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === deleteTutorModal) {
      deleteTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === deleteStudenteModal) {
      deleteStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === assegnaStudenteModal) {
      assegnaStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
  });

  // ===== CARICA HOME AL PRIMO CARICAMENTO =====
  loadStatistiche();
});
