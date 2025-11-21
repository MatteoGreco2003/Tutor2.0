// ==========================================
// HOME STUDENTE - TUTOR 2.0
// ==========================================

// ===== DISABILITA BACK DOPO LOGOUT E CONTROLLA TOKEN =====
window.addEventListener("pageshow", (event) => {
  const token = localStorage.getItem("token");

  // Se il token non esiste, torna a login
  if (!token) {
    window.location.href = "/";
    return;
  }
});

// Disabilita il back button tramite history
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function (event) {
  // Non permettere di tornare indietro
  window.history.pushState(null, null, window.location.href);
});

// ==========================================
// CARICAMENTO PAGINA
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ===== VERIFICA TOKEN ALL'INIZIO =====
  const token = localStorage.getItem("token");
  console.log("Token:", token);

  if (!token) {
    window.location.href = "/";
    return;
  }

  // ===== CARICA DATI STUDENTE NELL'HEADER =====
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
      // Aggiorna header con nome e cognome
      const headerTitle = document.querySelector(".header-title");
      headerTitle.textContent = `${data.data.nome} ${data.data.cognome}`;

      // Aggiorna icon con prima lettera
      const userIcon = document.querySelector(".user-icon");
      userIcon.textContent = data.data.nome.charAt(0).toUpperCase();
      userIcon.style.backgroundColor = "#9e3ffd";
    } else {
      console.error("Errore nel caricamento dati:", data.message);
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Errore caricamento studente:", error);
    window.location.href = "/";
  }

  // ===== VERIFICA ACCESSO PAGINA =====
  try {
    const response = await fetch("/auth/verify-home-studenti", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Risposta status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (error) {
    console.error("Errore:", error);
  }

  // ==========================================
  // CARICAMENTO VERIFICHE
  // ==========================================

  /**
   * Carica le verifiche dello studente
   */
  async function loadVerifiche() {
    try {
      const token = localStorage.getItem("token");
      const verificheList = document.getElementById("verificheList");

      const response = await fetch("/test/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.verifiche)) {
        if (data.verifiche.length === 0) {
          verificheList.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Nessuna verifica registrata</p>
            </div>
          `;
          return;
        }

        // Renderizza le verifiche
        verificheList.innerHTML = "";
        data.verifiche.forEach((verifica) => {
          const card = renderVerificaCard(verifica);
          verificheList.appendChild(card);
        });
      } else {
        console.error("Errore nel caricamento verifiche:", data.message);
      }
    } catch (error) {
      console.error("Errore caricamento verifiche:", error);
    }
  }

  /**
   * Renderizza una singola card verifica
   */
  function renderVerificaCard(verifica) {
    const div = document.createElement("div");
    div.className = "verifica-item";
    div.setAttribute("data-verifica-id", verifica._id);

    // Formatta data
    const dataObj = new Date(verifica.data);
    const dataFormattata = dataObj.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Estrai nome materia
    const nomeMateria = verifica.materialID?.nome || "Materia sconosciuta";

    // Determina se è futura o passata
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const verificaDate = new Date(verifica.data);
    verificaDate.setHours(0, 0, 0, 0);
    const isFutura = verificaDate > today;

    // Crea il voto HTML
    let votoHTML = "";
    if (verifica.votoFuturo || isFutura) {
      votoHTML = `<span class="verifica-voto future">Non ancora voto</span>`;
    } else {
      votoHTML = `<span class="verifica-voto">${verifica.voto}</span>`;
    }

    div.innerHTML = `
    <div class="verifica-info">
      <div class="verifica-materia">${nomeMateria}</div>
      <div class="verifica-giorno">${dataFormattata}</div>
      ${
        verifica.argomento
          ? `<div class="verifica-argomento">${verifica.argomento}</div>`
          : ""
      }
    </div>
    <div class="verifica-actions">
      ${votoHTML}
      <div class="verifica-buttons">
        <button class="btn-view" title="Visualizza" data-id="${verifica._id}">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-edit" title="Modifica" data-id="${verifica._id}">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn-delete" title="Elimina" data-id="${verifica._id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

    // Aggiungi event listeners (implementaremo dopo)
    div.querySelector(".btn-view").addEventListener("click", function () {
      console.log("Visualizza verifica:", verifica._id);
    });

    div.querySelector(".btn-edit").addEventListener("click", function () {
      console.log("Modifica verifica:", verifica._id);
    });

    div.querySelector(".btn-delete").addEventListener("click", function () {
      console.log("Elimina verifica:", verifica._id);
    });

    return div;
  }

  // Carica le verifiche all'inizio
  await loadVerifiche();

  // ==========================================
  // PULSANTE DISCONNETTITI
  // ==========================================

  document
    .querySelector(".logout-btn")
    .addEventListener("click", async function () {
      try {
        const response = await fetch("/auth/logout", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Cancella token
          localStorage.removeItem("token");
          // Reindirizza a login
          window.location.href = "/";
        } else {
          alert("Errore durante il logout");
        }
      } catch (error) {
        console.error("Errore logout:", error);
        alert("Errore durante il logout");
      }
    });

  // ==========================================
  // MODALE ELIMINA PROFILO
  // ==========================================

  const deleteProfileModal = document.getElementById("deleteProfileModal");

  // Apri modale
  document.querySelector(".delete-btn").addEventListener("click", function () {
    deleteProfileModal.style.display = "flex";
  });

  // Chiudi modale (X)
  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
    });

  // Chiudi modale (Annulla)
  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
    });

  // Chiudi modale (click fuori)
  window.addEventListener("click", function (event) {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
    }
  });

  // ===== BOTTONE "ELIMINA COMUNQUE" - ELIMINA IL PROFILO =====
  /**
   * Elimina il profilo dello studente dal database
   * Chiama DELETE /student/profile
   */
  document
    .getElementById("confirmDeleteProfile")
    .addEventListener("click", async function () {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/student/profile", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Elimina token
          localStorage.removeItem("token");

          // Alert di successo
          alert("Profilo eliminato con successo");

          // Reindirizza al login
          window.location.href = "/";
        } else {
          alert(data.message || "Errore nell'eliminazione del profilo");
        }
      } catch (error) {
        console.error("Errore eliminazione profilo:", error);
        alert("Errore di connessione al server");
      }
    });

  // ==========================================
  // MODALE INSERISCI VERIFICA
  // ==========================================

  const modal = document.getElementById("insertVerificaModal");
  const form = document.getElementById("insertVerificaForm");
  const materiaSelect = document.getElementById("materia");
  const argomentoTextarea = document.getElementById("argomento");
  const checkboxPrevisto = document.getElementById("previsto");
  const selectValutazione = document.getElementById("valutazione");
  const dataInput = document.getElementById("verificaData");

  /**
   * Resetta il form della modale verifiche
   */
  function resetInsertVerificaForm() {
    form.reset();
    materiaSelect.selectedIndex = 0;
    selectValutazione.selectedIndex = 0;
    selectValutazione.disabled = false;
    checkboxPrevisto.checked = false;
    argomentoTextarea.style.height = "";
  }

  /**
   * Carica le materie dello studente nella select
   */
  async function loadMaterie() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/subject/data", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.materie)) {
        // Pulisci le opzioni precedenti
        materiaSelect.innerHTML =
          '<option value="" selected disabled>Seleziona la materia</option>';

        // Aggiungi le materie dal DB
        data.materie.forEach((materia) => {
          const option = document.createElement("option");
          option.value = materia.nome;
          option.textContent = materia.nome;
          materiaSelect.appendChild(option);
        });

        // Se ci sono materie, il select scrollerà automaticamente
        console.log(`✅ ${data.materie.length} materie caricate`);
      } else {
        console.error("Errore nel caricamento materie:", data.message);
        materiaSelect.innerHTML =
          '<option value="" disabled>Errore nel caricamento</option>';
      }
    } catch (error) {
      console.error("Errore caricamento materie:", error);
      materiaSelect.innerHTML =
        '<option value="" disabled>Errore di connessione</option>';
    }
  }

  // Apri modale
  document
    .getElementById("addVerificaBtn")
    .addEventListener("click", async () => {
      resetInsertVerificaForm();
      await loadMaterie(); // ← CARICA LE MATERIE PRIMA DI APRIRE LA MODALE
      modal.style.display = "flex";
    });

  // Chiudi modale (X)
  document
    .getElementById("closeInsertVerifica")
    .addEventListener("click", () => {
      modal.style.display = "none";
      resetInsertVerificaForm();
    });

  // Chiudi modale (Annulla)
  document.getElementById("annullaVerifica").addEventListener("click", () => {
    modal.style.display = "none";
    resetInsertVerificaForm();
  });

  // Chiudi modale (click fuori)
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      resetInsertVerificaForm();
    }
  });

  // ===== CHECKBOX PREVISTO =====
  checkboxPrevisto.addEventListener("change", function () {
    if (this.checked) {
      selectValutazione.disabled = true;
      selectValutazione.value = "";
    } else {
      selectValutazione.disabled = false;
    }
  });

  // ==========================================
  // FLATPICKR DATE PICKER
  // ==========================================

  flatpickr(dataInput, {
    locale: "it",
    dateFormat: "d/m/Y",
    allowInput: false,
    disableMobile: true,
    onOpen: function (selectedDates, dateStr, instance) {
      // Centra il calendario
      const inputRect = dataInput.getBoundingClientRect();
      const inputWidth = dataInput.offsetWidth;
      const calendarWidth = instance.calendarContainer.offsetWidth;
      const offset = (inputWidth - calendarWidth) / 2;

      instance.calendarContainer.style.left = offset + "px";
    },
    onChange: function (selectedDates) {
      if (!selectedDates.length) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let selected = new Date(selectedDates[0].getTime());
      selected.setHours(0, 0, 0, 0);

      if (selected > today) {
        checkboxPrevisto.checked = true;
        checkboxPrevisto.disabled = true;
        selectValutazione.disabled = true;
        selectValutazione.value = "";
      } else {
        checkboxPrevisto.checked = false;
        checkboxPrevisto.disabled = false;
        selectValutazione.disabled = false;
      }
    },
  });

  // ==========================================
  // SUBMIT FORM VERIFICA
  // ==========================================

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Funzione di salvataggio verifica in sviluppo!");
    modal.style.display = "none";
    resetInsertVerificaForm();
  });
}); // ← CHIUSURA DOMContentLoaded
