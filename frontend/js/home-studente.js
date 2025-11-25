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

    const data = await response.json();
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

        addBadgesToCalendar();
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
    <!-- Wrapper a larghezza fissa -->
    ${
      verifica.votoFuturo || isFutura
        ? `<div class="verifica-voto-wrapper"><span class="verifica-voto future">Non ancora voto</span></div>`
        : `<div class="verifica-voto-wrapper"><span class="verifica-voto">${verifica.voto}</span></div>`
    }
    <div class="verifica-buttons">
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
    div.querySelector(".btn-edit").addEventListener("click", function () {
      openEditVerifica(verifica._id);
    });

    const deleteVerificaModal = document.getElementById("deleteVerificaModal");
    let verificaToDeleteID = null;

    div.querySelector(".btn-delete").addEventListener("click", function () {
      verificaToDeleteID = verifica._id;
      deleteVerificaModal.style.display = "flex";
      document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
    });

    document
      .getElementById("closeDeleteVerifica")
      .addEventListener("click", function () {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      });

    document
      .getElementById("cancelDeleteVerifica")
      .addEventListener("click", function () {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      });

    window.addEventListener("click", function (event) {
      if (event.target === deleteVerificaModal) {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      }
    });

    document
      .getElementById("confirmDeleteVerifica")
      .addEventListener("click", async function () {
        if (!verificaToDeleteID) return;
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`/test/${verificaToDeleteID}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (response.ok) {
            deleteVerificaModal.style.display = "none";
            verificaToDeleteID = null;
            await loadVerifiche(); // Aggiorna la lista
            document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
          } else {
            alert(data.message || "Errore nell'eliminazione");
          }
        } catch (error) {
          alert("Errore di connessione al server");
        }
      });

    return div;
  }

  /**
   * Aggiunge i badge (pallini) al calendario
   */
  window.addBadgesToCalendar = function () {
    const token = localStorage.getItem("token");

    // Carica le verifiche prima di aggiungerle al calendario
    fetch("/test/data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data.verifiche)) return;

        const cells = document.querySelectorAll(".calendar td:not(.empty)");

        cells.forEach((cell) => {
          // Rimuovi badge vecchi
          const oldBadge = cell.querySelector(".calendar-badge");
          if (oldBadge) oldBadge.remove();

          // Estrai data dalla cella
          const dayText = cell.textContent.trim();
          if (!dayText || isNaN(dayText)) return;

          const day = parseInt(dayText);

          // Prendi il mese/anno dal calendario
          const currentMonthText = document
            .getElementById("currentMonth")
            .textContent.trim();
          const monthNames = [
            "GENNAIO",
            "FEBBRAIO",
            "MARZO",
            "APRILE",
            "MAGGIO",
            "GIUGNO",
            "LUGLIO",
            "AGOSTO",
            "SETTEMBRE",
            "OTTOBRE",
            "NOVEMBRE",
            "DICEMBRE",
          ];
          const [monthName, year] = currentMonthText.split(" ");
          const month = monthNames.indexOf(monthName) + 1;

          // Ricerca verifiche di quel giorno
          const verificheDelGiorno = data.verifiche.filter((v) => {
            const vDate = new Date(v.data);
            return (
              vDate.getDate() === day &&
              vDate.getMonth() === month - 1 &&
              vDate.getFullYear() === parseInt(year)
            );
          });

          if (verificheDelGiorno.length === 0) return;

          // Conta i voti per colore
          const votiBasso = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto < 6
          ).length;
          const votiMedio = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto >= 6 && v.voto < 8
          ).length;
          const votiAlto = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto >= 8
          ).length;

          // Totale verifiche con voto
          const totalConVoto = votiBasso + votiMedio + votiAlto;

          // Crea il badge
          const badge = document.createElement("span");
          badge.setAttribute("data-day", day);
          badge.addEventListener("click", (e) => {
            e.stopPropagation();
            openDayVerificheModal(day, verificheDelGiorno);
          });

          // Se ci sono voti MISTI (più colori diversi), crea badge torta
          const coloriDiversi = [
            votiBasso > 0,
            votiMedio > 0,
            votiAlto > 0,
          ].filter(Boolean).length;

          if (totalConVoto > 0 && coloriDiversi > 1) {
            // BADGE TORTA - Genera il gradient direttamente
            badge.className = "calendar-badge badge-pie";
            badge.setAttribute("data-count", verificheDelGiorno.length);

            // Calcola percentuali e angoli
            const percVerde = (votiAlto / totalConVoto) * 100;
            const percGiallo = (votiMedio / totalConVoto) * 100;
            const percRosso = (votiBasso / totalConVoto) * 100;

            // Angoli cumulativi
            const angVerde_end = percVerde;
            const angGiallo_end = percVerde + percGiallo;

            // Crea il gradient dinamico
            const gradientStr = `conic-gradient(
              #10b981 0%,
              #10b981 ${angVerde_end}%,
              #f59e0b ${angVerde_end}%,
              #f59e0b ${angGiallo_end}%,
              #ef4444 ${angGiallo_end}%,
              #ef4444 100%
            )`;

            badge.style.background = gradientStr;
            badge.innerHTML = "";
          } else {
            // ========== BADGE COLORE SINGOLO ==========
            badge.className = "calendar-badge badge-single";
            badge.setAttribute("data-count", verificheDelGiorno.length);

            // Determina il colore di background
            let bgColor = "#9ca3af"; // grigio (pending)

            if (totalConVoto > 0) {
              if (votiAlto > 0 && votiBasso === 0 && votiMedio === 0) {
                bgColor = "#10b981"; // verde (high)
              } else if (votiMedio > 0 && votiBasso === 0) {
                bgColor = "#f59e0b"; // giallo (medium)
              } else if (votiBasso > 0) {
                bgColor = "#ef4444"; // rosso (low)
              }
            }

            badge.style.background = bgColor;
            badge.innerHTML = "";
          }

          cell.appendChild(badge);
        });

        addCalendarLegend();
      })
      .catch((error) => console.error("Errore caricamento badges:", error));
  };

  /**
   * Apre il modal con le verifiche di un giorno specifico
   */
  function openDayVerificheModal(day, verifiche) {
    const modal = document.getElementById("dayVerificheModal");
    const title = document.getElementById("dayVerificheTitle");
    const list = document.getElementById("dayVerificheList");

    const today = new Date();
    const dataFormattata = new Date(
      today.getFullYear(),
      today.getMonth(),
      day
    ).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    title.textContent = `Verifiche del ${dataFormattata}`;

    list.innerHTML = "";
    verifiche.forEach((v) => {
      const item = document.createElement("div");
      item.className = "day-verifica-card";

      const nomeMateria = v.materialID?.nome || "Materia sconosciuta";

      // Determina classe voto
      let votoClass = "voto-pending";
      if (v.voto !== null && v.voto !== undefined) {
        if (v.voto >= 8) votoClass = "voto-high";
        else if (v.voto >= 6) votoClass = "voto-medium";
        else votoClass = "voto-low";
      }

      const votoDisplay =
        v.voto !== null && v.voto !== undefined
          ? `<div class="day-verifica-voto ${votoClass}">${v.voto}</div>`
          : `<div class="day-verifica-voto pending">Non ancora</div>`;

      item.innerHTML = `
        <div class="day-verifica-header">
          <h4 class="materia-name">${nomeMateria}</h4>
          ${votoDisplay}
        </div>
        <div class="day-verifica-content">
          <p class="argomento">${v.argomento || "Senza argomento specifico"}</p>
        </div>
      `;

      list.appendChild(item);
    });

    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  /**
   * Aggiunge la legenda interattiva sotto il calendario
   */
  function addCalendarLegend() {
    const calendarSection = document.querySelector(".calendar-section");

    // Controlla se legenda esiste già
    if (document.querySelector(".calendar-legend")) return;

    const legend = document.createElement("div");
    legend.className = "calendar-legend";
    legend.innerHTML = `
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-dot" style="background-color: #10b981;"></div>
          <span>Voti alti (8-10)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background-color: #f59e0b;"></div>
          <span>Voti medi (6-7)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background-color: #ef4444;"></div>
          <span>Voti bassi (&lt;6)</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background-color: #9ca3af;"></div>
          <span>Non votato</span>
        </div>
      </div>
      <div class="legend-tip">
        <i class="fas fa-lightbulb"></i>
        Clicca su un pallino per vedere le verifiche del giorno!
      </div>
    `;

    calendarSection.appendChild(legend);
  }

  // Listener per chiudere il modal
  document.getElementById("closeDayVerifiche").addEventListener("click", () => {
    document.getElementById("dayVerificheModal").style.display = "none";
    document.body.classList.remove("modal-open");
  });

  // Bottone chiudi in basso (nuovo)
  document
    .getElementById("closeDayVerificheBtn")
    .addEventListener("click", () => {
      document.getElementById("dayVerificheModal").style.display = "none";
      document.body.classList.remove("modal-open");
    });

  window.addEventListener("click", (event) => {
    const modal = document.getElementById("dayVerificheModal");
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

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

  document.querySelector(".delete-btn").addEventListener("click", function () {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
  });

  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });

  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });

  window.addEventListener("click", function (event) {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
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

    // Rimuove la classe bordo rosso da tutti i campi
    materiaSelect.classList.remove("input-error");
    dataInput.classList.remove("input-error");
    argomentoTextarea.classList.remove("input-error");
    selectValutazione.classList.remove("input-error");

    // Nasconde e svuota il messaggio di errore
    const erroreMsg = document.getElementById("verificaError");
    if (erroreMsg) {
      erroreMsg.style.display = "none";
      erroreMsg.textContent = "";
    }
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
        materiaSelect.innerHTML =
          '<option value="" selected disabled>Seleziona la materia</option>';
        data.materie.forEach((materia) => {
          const option = document.createElement("option");
          option.value = materia._id; // <-- Salva sempre l'id!
          option.textContent = materia.nome;
          materiaSelect.appendChild(option);
        });
      } else {
        materiaSelect.innerHTML =
          '<option value="" disabled>Errore nel caricamento</option>';
      }
    } catch (error) {
      materiaSelect.innerHTML =
        '<option value="" disabled>Errore di connessione</option>';
    }
  }

  // ===== MODALE INSERISCI VERIFICA =====
  document
    .getElementById("addVerificaBtn")
    .addEventListener("click", async () => {
      resetInsertVerificaForm();
      await loadMaterie();
      modal.style.display = "flex";
      document.body.classList.add("modal-open"); // ← BLOCCA SCROLL
    });

  document
    .getElementById("closeInsertVerifica")
    .addEventListener("click", () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });

  document.getElementById("annullaVerifica").addEventListener("click", () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
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

  const editVerificaModal = document.getElementById("editVerificaModal");
  const editVerificaForm = document.getElementById("editVerificaForm");
  const editVerificaError = document.getElementById("editVerificaError");
  const editVerificaData = document.getElementById("editVerificaData");
  const editMateria = document.getElementById("editMateria");
  const editArgomento = document.getElementById("editArgomento");
  const editValutazione = document.getElementById("editValutazione");
  const editPrevisto = document.getElementById("editPrevisto");

  let verificaToEditID = null;

  flatpickr(editVerificaData, {
    locale: "it",
    dateFormat: "d/m/Y",
    allowInput: false,
    disableMobile: true,
  });

  async function loadMaterieEdit() {
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
        editMateria.innerHTML =
          '<option value="" selected disabled>Seleziona la materia</option>';
        data.materie.forEach((materia) => {
          const option = document.createElement("option");
          option.value = materia._id;
          option.textContent = materia.nome;
          editMateria.appendChild(option);
        });
      }
    } catch (error) {
      editMateria.innerHTML =
        '<option value="" disabled>Errore nel caricamento</option>';
    }
  }

  // ===== LISTENER PER CAMBIO DATA IN TEMPO REALE =====
  // Questo fa sì che quando cambi la data, voto e checkbox si aggiornino dinamicamente
  editVerificaData.addEventListener("change", function () {
    const dataFormattata = editVerificaData.value.trim();

    if (!dataFormattata) return; // Se il campo è vuoto, non fare nulla

    // Converti la data da formato IT (d/m/Y) a Date
    const dateParts = dataFormattata.split("/");
    if (dateParts.length !== 3) return;

    const selectedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    selectedDate.setHours(0, 0, 0, 0);

    // Confronta con oggi
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isFutura = selectedDate > today;

    // LOGICA: Se futura → blocca voto e checkbox, altrimenti sblocca
    if (isFutura) {
      // Data è FUTURA
      editValutazione.value = "";
      editValutazione.disabled = true;
      editPrevisto.checked = true;
      editPrevisto.disabled = true;
    } else {
      // Data è PASSATA O OGGI
      editPrevisto.disabled = false;

      // Se c'è già un voto, blocca il checkbox
      if (editValutazione.value && !isNaN(parseFloat(editValutazione.value))) {
        editPrevisto.disabled = true;
      } else {
        editValutazione.disabled = false;
      }
    }
  });

  async function openEditVerifica(verificaID) {
    verificaToEditID = verificaID;
    editVerificaError.style.display = "none";
    editVerificaError.textContent = "";
    editMateria.classList.remove("input-error");
    editVerificaData.classList.remove("input-error");
    editArgomento.classList.remove("input-error");
    editValutazione.classList.remove("input-error");

    await loadMaterieEdit();

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/test/${verificaID}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.verifica) {
        // Determina se è futura o passata
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const verificaDate = new Date(data.verifica.data);
        verificaDate.setHours(0, 0, 0, 0);
        const isFutura = verificaDate > today;

        // Pre-compila campi
        editVerificaData.value = new Date(
          data.verifica.data
        ).toLocaleDateString("it-IT");
        editMateria.value = data.verifica.materialID._id;
        editArgomento.value = data.verifica.argomento;

        // 🔧 LOGICA CORRETTA:
        if (isFutura) {
          // Se la verifica è FUTURA: forza "Non ho ancora il voto"
          editValutazione.value = "";
          editValutazione.disabled = true;
          editPrevisto.checked = true;
          editPrevisto.disabled = true; // ← NON PUÒ MODIFICARE
        } else {
          // Se la verifica è OGGI O NEL PASSATO: permetti sia voto che checkbox

          if (data.verifica.voto !== null && data.verifica.voto !== undefined) {
            // ✅ HA GIÀ UN VOTO: blocca tutto
            editPrevisto.checked = false;
            editValutazione.disabled = false;
            editValutazione.value = data.verifica.voto?.toString() || "";
            editPrevisto.disabled = true; // ← BLOCCA CHECKBOX (non avrebbe senso)
          } else {
            // NON HA VOTO: permetti di gestire checkbox e voto
            editPrevisto.disabled = false; // ← PUÒ MODIFICARE IL CHECKBOX

            if (data.verifica.votoFuturo || data.verifica.voto == null) {
              editPrevisto.checked = true;
              editValutazione.value = "";
              editValutazione.disabled = true;
            } else {
              editPrevisto.checked = false;
              editValutazione.disabled = false;
              editValutazione.value = data.verifica.voto?.toString() || "";
            }
          }
        }

        // Gestione Flatpickr per calendario
        if (editVerificaData._flatpickr) {
          editVerificaData._flatpickr.destroy();
        }

        // Consenti date nel passato/oggi se la verifica è già nel passato
        if (isFutura) {
          // Se è futura: consenti solo date nel futuro (niente blocco)
          flatpickr(editVerificaData, {
            locale: "it",
            dateFormat: "d/m/Y",
            allowInput: false,
            disableMobile: true,
          });
        } else {
          // Se è nel passato/oggi: consenti solo date nel passato/oggi
          flatpickr(editVerificaData, {
            locale: "it",
            dateFormat: "d/m/Y",
            allowInput: false,
            disableMobile: true,
            maxDate: new Date(),
          });
        }

        editVerificaModal.style.display = "flex";
        document.body.classList.add("modal-open");
      } else {
        alert(data.message || "Errore dati verifica");
      }
    } catch {
      alert("Errore di connessione");
    }
  }

  // Gestione checkbox voto futuro/logica disabilitazione input
  editPrevisto.addEventListener("change", function () {
    if (editPrevisto.checked) {
      editValutazione.value = "";
      editValutazione.disabled = true;
    } else {
      editValutazione.disabled = false;
      // Se l'input diventa abilitato e l'utente inserisce ora un voto,
      // assicurati che non sia/venga settato "votoFuturo: true" nell'invio
    }
  });

  document
    .getElementById("closeEditVerifica")
    .addEventListener("click", function () {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });

  document
    .getElementById("annullaEditVerifica")
    .addEventListener("click", function () {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    });

  window.addEventListener("click", function (event) {
    if (event.target === editVerificaModal) {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
    }
  });

  editVerificaForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    editVerificaError.style.display = "none";
    editVerificaError.textContent = "";
    editMateria.classList.remove("input-error");
    editVerificaData.classList.remove("input-error");
    editArgomento.classList.remove("input-error");
    editValutazione.classList.remove("input-error");

    // Prendi valori
    const materia = editMateria.value;
    const data = editVerificaData.value.trim();
    const argomento = editArgomento.value.trim();
    const voto = editValutazione.disabled
      ? null
      : editValutazione.value
      ? parseFloat(editValutazione.value.replace(",", "."))
      : null;
    let votoFuturo = editPrevisto.checked;

    // FIX: Se c'è un voto valido, forza votoFuturo a false
    if (voto !== null && voto !== undefined && !isNaN(voto)) {
      votoFuturo = false;
    }

    let firstError = "";
    if (!data) {
      editVerificaData.classList.add("input-error");
      firstError ||= "⚠️ Seleziona la data";
    } else if (!materia) {
      editMateria.classList.add("input-error");
      firstError ||= "⚠️ Scegli una materia";
    } else if (!argomento || argomento.length < 3) {
      editArgomento.classList.add("input-error");
      firstError ||= "⚠️ L'argomento deve avere minimo 3 caratteri";
    } else if (votoFuturo === false && voto === null) {
      editValutazione.classList.add("input-error");
      firstError ||= "⚠️ Inserisci un voto";
    } else if (votoFuturo === false && !isValidVoto(voto)) {
      editValutazione.classList.add("input-error");
      firstError ||=
        "⚠️ Voto non valido: usa solo 0, 0.5, 1, 1.5, 2, 2.5, ... 10";
    }

    if (firstError) {
      editVerificaError.style.display = "block";
      editVerificaError.textContent = firstError;
      return;
    }

    // conversione data IT → YYYY-MM-DD
    const dateParts = data.split("/");
    const formattedDate =
      dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : data;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/test/${verificaToEditID}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialID: materia, // ← INCLUDE SEMPRE MATERIAID
          data: formattedDate,
          argomento: argomento,
          voto: votoFuturo ? null : voto,
          votoFuturo: votoFuturo, // ← ADESSO CORRETTO
        }),
      });
      const result = await res.json();
      if (res.ok && result.verifica) {
        editVerificaModal.style.display = "none";
        await loadVerifiche();
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      } else {
        editVerificaError.style.display = "block";
        editVerificaError.textContent = result.message || "Errore modifica";
        if (result.message?.toLowerCase().includes("data"))
          editVerificaData.classList.add("input-error");
        if (result.message?.toLowerCase().includes("materia"))
          editMateria.classList.add("input-error");
        if (result.message?.toLowerCase().includes("argomento"))
          editArgomento.classList.add("input-error");
        if (result.message?.toLowerCase().includes("voto"))
          editValutazione.classList.add("input-error");
      }
    } catch {
      editVerificaError.style.display = "block";
      editVerificaError.textContent = "Errore di connessione";
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

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Pulizia errori precedenti
    document.getElementById("verificaError").style.display = "none";
    document.getElementById("verificaError").textContent = "";
    materiaSelect.classList.remove("input-error");
    dataInput.classList.remove("input-error");
    argomentoTextarea.classList.remove("input-error");
    selectValutazione.classList.remove("input-error");

    // Recupera valori dal form
    const materialID = materiaSelect.value;
    const dataVerifica = dataInput.value.trim();
    const argomento = argomentoTextarea.value.trim();
    const voto = selectValutazione.value
      ? parseFloat(selectValutazione.value.replace(",", "."))
      : null;
    const votoFuturo = checkboxPrevisto.checked;

    let firstError = "";

    // Validazione frontend
    if (!dataVerifica) {
      dataInput.classList.add("input-error");
      firstError ||= "⚠️ Seleziona la data";
    } else if (!materialID) {
      materiaSelect.classList.add("input-error");
      firstError ||= "⚠️ Scegli una materia";
    } else if (!argomento || argomento.length < 3) {
      argomentoTextarea.classList.add("input-error");
      firstError ||= "⚠️ L'argomento deve avere minimo 3 caratteri";
    } else if (votoFuturo === false && voto === null) {
      selectValutazione.classList.add("input-error");
      firstError ||= "⚠️ Inserisci un voto";
    } else if (votoFuturo === false && !isValidVoto(voto)) {
      selectValutazione.classList.add("input-error");
      firstError ||=
        "⚠️ Voto non valido: usa solo 0, 0.5, 1, 1.5, 2, 2.5, ... 10";
    }

    if (firstError) {
      document.getElementById("verificaError").style.display = "block";
      document.getElementById("verificaError").textContent = firstError;
      return;
    }

    const dateParts = dataInput.value.trim().split("/");
    const formattedDate =
      dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        : dataInput.value.trim();

    // Invio al backend
    try {
      const res = await fetch("/test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialID,
          data: formattedDate,
          argomento,
          voto: votoFuturo ? null : voto,
          votoFuturo: votoFuturo,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        modal.style.display = "none";
        resetInsertVerificaForm();
        await loadVerifiche(); // Aggiorna subito la lista verifiche
        document.body.classList.remove("modal-open"); // ← SBLOCCA SCROLL
      } else {
        // Se c'è un errore backend, mostra solo primo errore
        document.getElementById("verificaError").style.display = "block";
        document.getElementById("verificaError").textContent =
          result.message || "Errore nel salvataggio";
        // Evidenzia il campo sbagliato se il messaggio contiene "materia"/"data"/"argomento"/"voto"
        if (result.message?.toLowerCase().includes("data"))
          dataInput.classList.add("input-error");
        if (result.message?.toLowerCase().includes("materia"))
          materiaSelect.classList.add("input-error");
        if (result.message?.toLowerCase().includes("argomento"))
          argomentoTextarea.classList.add("input-error");
        if (result.message?.toLowerCase().includes("voto"))
          selectValutazione.classList.add("input-error");
      }
    } catch (error) {
      document.getElementById("verificaError").style.display = "block";
      document.getElementById("verificaError").textContent =
        "Errore di connessione al server";
    }
  });

  // ===== VALIDAZIONE VOTI - SOLO 0, 0.5, 1, 1.5, 2, ... 10 =====
  function isValidVoto(voto) {
    const votoNum = parseFloat(voto);
    if (isNaN(votoNum)) {
      return false;
    }
    if (votoNum < 0 || votoNum > 10) {
      return false;
    }
    if ((votoNum * 2) % 1 !== 0) {
      return false;
    }
    return true;
  }

  // ===== VALIDAZIONE VOTO IN TEMPO REALE =====
  selectValutazione.addEventListener("input", (e) => {
    const voto = e.target.value;
    if (voto === "") {
      selectValutazione.classList.remove("input-error");
      return;
    }
    if (!isValidVoto(voto)) {
      selectValutazione.classList.add("input-error");
    } else {
      selectValutazione.classList.remove("input-error");
    }
  });

  // ===== VALIDAZIONE VOTO IN EDIT =====
  if (editValutazione) {
    editValutazione.addEventListener("input", (e) => {
      const voto = e.target.value;
      if (voto === "") {
        editValutazione.classList.remove("input-error");
        return;
      }
      if (!isValidVoto(voto)) {
        editValutazione.classList.add("input-error");
      } else {
        editValutazione.classList.remove("input-error");
      }
    });
  }
}); // ← CHIUSURA DOMContentLoaded
