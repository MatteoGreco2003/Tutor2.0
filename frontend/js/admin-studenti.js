// ==========================================
// ADMIN PANEL - GESTIONE STUDENTI
// ==========================================

let allStudenti = [];

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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px"><i class="fas fa-inbox"></i> Nessuno studente registrato</td></tr>`;
        return;
      }

      data.studenti.forEach((studente) => {
        const dataIscrizione = new Date(studente.createdAt).toLocaleDateString(
          "it-IT"
        );

        const row = document.createElement("tr");
        row.innerHTML = `<td>${studente.nome}</td><td>${
          studente.cognome
        }</td><td>${studente.email}</td><td>${
          studente.gradoScolastico || "-"
        }</td><td>${dataIscrizione}</td><td>
          <div class="table-actions">
            <button class="btn-view" title="Visualizza Profilo" data-id="${
              studente._id
            }">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-delete" title="Elimina" data-id="${
              studente._id
            }">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>`;

        row.querySelector(".btn-delete").addEventListener("click", () => {
          openDeleteStudenteModal(studente._id);
        });

        row.querySelector(".btn-view").addEventListener("click", () => {
          openViewStudenteModal(studente);
        });

        tbody.appendChild(row);

        setupStudentiFilters();
      });
    }
  } catch (error) {
    console.error("Errore caricamento studenti:", error);
  }
}

// ===== SETUP FILTRI STUDENTI =====
function setupStudentiFilters() {
  const filterGrado = document.getElementById("filterGrado");
  const searchInput = document.getElementById("searchStudenti");

  function filterTable() {
    const gradoValue = filterGrado.value.toLowerCase();
    const searchValue = searchInput.value.toLowerCase();
    const tbody = document.getElementById("studenteTableBody");
    const rows = tbody.querySelectorAll("tr:not(.empty-state-row)");

    let visibleCount = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const nome = cells[0]?.textContent.toLowerCase() || "";
      const cognome = cells[1]?.textContent.toLowerCase() || "";
      const email = cells[2]?.textContent.toLowerCase() || "";
      const grado = cells[3]?.textContent.toLowerCase() || "";

      const gradoMatch = gradoValue === "" || grado.includes(gradoValue);
      const searchMatch =
        searchValue === "" ||
        nome.includes(searchValue) ||
        cognome.includes(searchValue) ||
        email.includes(searchValue);

      row.style.display = gradoMatch && searchMatch ? "" : "none";
      if (gradoMatch && searchMatch) visibleCount++;
    });

    // ✅ Se nessun risultato, mostra messaggio
    if (visibleCount === 0) {
      // Rimuovi vecchi empty state
      const oldEmpty = tbody.querySelector(".empty-state-row");
      if (oldEmpty) oldEmpty.remove();

      // Crea nuovo empty state
      const emptyRow = document.createElement("tr");
      emptyRow.className = "empty-state-row";
      emptyRow.innerHTML = `
      <td colspan="6">
        <div class="empty-state-message">Nessuno studente trovato</div>
        <div class="empty-state-submessage">Prova a cambiare i filtri</div>
      </td>
    `;
      tbody.appendChild(emptyRow);
    } else {
      // Rimuovi empty state se ci sono risultati
      const oldEmpty = tbody.querySelector(".empty-state-row");
      if (oldEmpty) oldEmpty.remove();
    }
  }

  filterGrado.addEventListener("change", filterTable);
  searchInput.addEventListener("keyup", filterTable);
}

// ===== MODAL: VISUALIZZA PROFILO STUDENTE =====
function openViewStudenteModal(studente) {
  const viewStudenteModal = document.getElementById("viewStudenteModal");

  // Titolo
  document.getElementById(
    "modalProfileTitle"
  ).textContent = `Profilo Studente - ${studente.nome} ${studente.cognome}`;

  // ===== DATI PERSONALI =====
  document.getElementById("profile-nome").textContent = studente.nome || "-";
  document.getElementById("profile-cognome").textContent =
    studente.cognome || "-";
  document.getElementById("profile-telefono").textContent =
    studente.telefono || "-";
  document.getElementById("profile-grado-scolastico").textContent =
    studente.gradoScolastico || "-";
  document.getElementById("profile-indirizzo-scolastico").textContent =
    studente.indirizzoScolastico || "-";

  // ===== DATI FAMIGLIA =====
  document.getElementById("profile-genitore1-nome").textContent =
    studente.genitore1?.nome || "-";
  document.getElementById("profile-genitore1-cognome").textContent =
    studente.genitore1?.cognome || "-";
  document.getElementById("profile-genitore1-telefono").textContent =
    studente.genitore1?.telefono || "-";

  document.getElementById("profile-genitore2-nome").textContent =
    studente.genitore2?.nome || "-";
  document.getElementById("profile-genitore2-cognome").textContent =
    studente.genitore2?.cognome || "-";
  document.getElementById("profile-genitore2-telefono").textContent =
    studente.genitore2?.telefono || "-";

  document.getElementById("profile-email-famiglia").textContent =
    studente.emailFamiglia || "-";

  // ===== DATI SCUOLA =====
  const emailProfessoriContainer = document.getElementById(
    "profile-email-professori"
  );
  emailProfessoriContainer.innerHTML = "";

  if (studente.emailInsegnanti && Array.isArray(studente.emailInsegnanti)) {
    if (studente.emailInsegnanti.length === 0) {
      emailProfessoriContainer.innerHTML = "<p>-</p>";
    } else {
      studente.emailInsegnanti.forEach((email) => {
        const p = document.createElement("p");
        p.textContent = email;
        emailProfessoriContainer.appendChild(p);
      });
    }
  } else {
    emailProfessoriContainer.innerHTML = "<p>-</p>";
  }

  // Apri modal
  viewStudenteModal.classList.add("show");
  document.body.classList.add("modal-open");
}

// ===== MODAL: ELIMINA STUDENTE =====
function openDeleteStudenteModal(studenteID) {
  const deleteStudenteModal = document.getElementById("deleteStudenteModal");
  let currentStudenteDeleteID = studenteID;

  deleteStudenteModal.classList.add("show");
  document.body.classList.add("modal-open");

  // Aggiungi listener al bottone conferma
  document.getElementById("confirmDeleteStudente").onclick = async () => {
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
      }
    } catch (error) {
      console.error("Errore di connessione");
    }
  };
}
