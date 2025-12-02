/**
 * ============================================
 * HOME STUDENTE - TUTOR 2.0
 * ============================================
 * Main script for student dashboard page
 */

/**
 * DISABLE BACK BUTTON AFTER LOGOUT & CHECK TOKEN
 */
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

/**
 * Initialize hamburger menu and sidebar
 */
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

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

/**
 * ============================================
 * PAGE LOAD
 * ============================================
 */

document.addEventListener("DOMContentLoaded", async function () {
  // ===== VERIFY TOKEN =====
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // ===== LOAD STUDENT DATA IN HEADER =====
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
      const headerTitle = document.querySelector(".header-title");
      headerTitle.textContent = `${data.data.nome} ${data.data.cognome}`;

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

  // ===== VERIFY PAGE ACCESS =====
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

  /**
   * ============================================
   * LOAD VERIFICATIONS
   * ============================================
   */

  /**
   * Load student verifications
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
   * Render single verification card
   */
  function renderVerificaCard(verifica) {
    const div = document.createElement("div");
    div.className = "verifica-item";
    div.setAttribute("data-verifica-id", verifica._id);

    const dataObj = new Date(verifica.data);
    const dataFormattata = dataObj.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const nomeMateria = verifica.materialID?.nome || "Materia sconosciuta";

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

    div.querySelector(".btn-edit").addEventListener("click", function () {
      openEditVerifica(verifica._id);
    });

    const deleteVerificaModal = document.getElementById("deleteVerificaModal");
    let verificaToDeleteID = null;

    div.querySelector(".btn-delete").addEventListener("click", function () {
      verificaToDeleteID = verifica._id;
      deleteVerificaModal.style.display = "flex";
      document.body.classList.add("modal-open");
    });

    document
      .getElementById("closeDeleteVerifica")
      .addEventListener("click", function () {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open");
      });

    document
      .getElementById("cancelDeleteVerifica")
      .addEventListener("click", function () {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open");
      });

    window.addEventListener("click", function (event) {
      if (event.target === deleteVerificaModal) {
        deleteVerificaModal.style.display = "none";
        document.body.classList.remove("modal-open");
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
            await loadVerifiche();
            document.body.classList.remove("modal-open");
          }
        } catch (error) {
          console.error("Errore di connessione al server");
        }
      });

    return div;
  }

  /**
   * Add badges (circles) to calendar
   */
  window.addBadgesToCalendar = function () {
    const token = localStorage.getItem("token");

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
          const oldBadge = cell.querySelector(".calendar-badge");
          if (oldBadge) oldBadge.remove();

          const dayText = cell.textContent.trim();
          if (!dayText || isNaN(dayText)) return;

          const day = parseInt(dayText);

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

          const verificheDelGiorno = data.verifiche.filter((v) => {
            const vDate = new Date(v.data);
            return (
              vDate.getDate() === day &&
              vDate.getMonth() === month - 1 &&
              vDate.getFullYear() === parseInt(year)
            );
          });

          if (verificheDelGiorno.length === 0) return;

          const votiBasso = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto < 6
          ).length;
          const votiMedio = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto >= 6 && v.voto < 8
          ).length;
          const votiAlto = verificheDelGiorno.filter(
            (v) => v.voto !== null && v.voto >= 8
          ).length;

          const totalConVoto = votiBasso + votiMedio + votiAlto;

          const badge = document.createElement("span");
          badge.setAttribute("data-day", day);
          badge.addEventListener("click", (e) => {
            e.stopPropagation();
            openDayVerificheModal(day, verificheDelGiorno);
          });

          const coloriDiversi = [
            votiBasso > 0,
            votiMedio > 0,
            votiAlto > 0,
          ].filter(Boolean).length;

          if (totalConVoto > 0 && coloriDiversi > 1) {
            badge.className = "calendar-badge badge-pie";
            badge.setAttribute("data-count", verificheDelGiorno.length);

            const percVerde = (votiAlto / totalConVoto) * 100;
            const percGiallo = (votiMedio / totalConVoto) * 100;
            const percRosso = (votiBasso / totalConVoto) * 100;

            const angVerde_end = percVerde;
            const angGiallo_end = percVerde + percGiallo;

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
            badge.className = "calendar-badge badge-single";
            badge.setAttribute("data-count", verificheDelGiorno.length);

            let bgColor = "#9ca3af";

            if (totalConVoto > 0) {
              if (votiAlto > 0 && votiBasso === 0 && votiMedio === 0) {
                bgColor = "#10b981";
              } else if (votiMedio > 0 && votiBasso === 0) {
                bgColor = "#f59e0b";
              } else if (votiBasso > 0) {
                bgColor = "#ef4444";
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
   * Open modal with verifications for specific day
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
   * Add interactive legend under calendar
   */
  function addCalendarLegend() {
    const calendarSection = document.querySelector(".calendar-section");

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
          <span>Senza voto</span>
        </div>
      </div>
      <div class="legend-tip">
        <i class="fas fa-lightbulb"></i>
        Clicca su un pallino per vedere le verifiche del giorno!
      </div>
    `;

    calendarSection.appendChild(legend);
  }

  // ===== CLOSE DAY VERIFICATION MODAL =====
  document.getElementById("closeDayVerifiche").addEventListener("click", () => {
    document.getElementById("dayVerificheModal").style.display = "none";
    document.body.classList.remove("modal-open");
  });

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

  // Load verifications on page load
  await loadVerifiche();

  /**
   * ============================================
   * LOGOUT BUTTON
   * ============================================
   */

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
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Errore logout:", error);
      }
    });

  /**
   * ============================================
   * DELETE PROFILE MODAL
   * ============================================
   */

  const deleteProfileModal = document.getElementById("deleteProfileModal");

  document.querySelector(".delete-btn").addEventListener("click", function () {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  window.addEventListener("click", function (event) {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  /**
   * Delete student profile
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
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Errore eliminazione profilo:", error);
      }
    });

  /**
   * ============================================
   * INSERT VERIFICATION MODAL
   * ============================================
   */

  const modal = document.getElementById("insertVerificaModal");
  const form = document.getElementById("insertVerificaForm");
  const materiaSelect = document.getElementById("materia");
  const argomentoTextarea = document.getElementById("argomento");
  const checkboxPrevisto = document.getElementById("previsto");
  const selectValutazione = document.getElementById("valutazione");
  const dataInput = document.getElementById("verificaData");

  /**
   * Reset verification form
   */
  function resetInsertVerificaForm() {
    form.reset();
    materiaSelect.selectedIndex = 0;
    selectValutazione.selectedIndex = 0;
    selectValutazione.disabled = false;
    checkboxPrevisto.checked = false;
    argomentoTextarea.style.height = "";

    materiaSelect.classList.remove("input-error");
    dataInput.classList.remove("input-error");
    argomentoTextarea.classList.remove("input-error");
    selectValutazione.classList.remove("input-error");

    const erroreMsg = document.getElementById("verificaError");
    if (erroreMsg) {
      erroreMsg.style.display = "none";
      erroreMsg.textContent = "";
    }
  }

  /**
   * Load student subjects in select
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
          option.value = materia._id;
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

  // ===== OPEN INSERT VERIFICATION MODAL =====
  document
    .getElementById("addVerificaBtn")
    .addEventListener("click", async () => {
      await loadMaterie();

      const materieOptions = materiaSelect.querySelectorAll("option");
      const hasMaterie = materieOptions.length > 1;

      if (!hasMaterie) {
        document.getElementById("noMaterieModal").style.display = "flex";
        document.body.classList.add("modal-open");
        return;
      }

      resetInsertVerificaForm();
      modal.style.display = "flex";
      document.body.classList.add("modal-open");
    });

  document
    .getElementById("closeInsertVerifica")
    .addEventListener("click", () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document.getElementById("annullaVerifica").addEventListener("click", () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  // ===== CHECKBOX "PREVISTO" LOGIC =====
  checkboxPrevisto.addEventListener("change", function () {
    if (this.checked) {
      selectValutazione.disabled = true;
      selectValutazione.value = "";
    } else {
      selectValutazione.disabled = false;
    }
  });

  // ===== NO SUBJECTS MODAL MANAGEMENT =====
  const noMaterieModal = document.getElementById("noMaterieModal");

  document
    .getElementById("closeNoMaterie")
    .addEventListener("click", function () {
      noMaterieModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelNoMaterie")
    .addEventListener("click", function () {
      noMaterieModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("goToSubjectBtn")
    .addEventListener("click", function () {
      window.location.href = "/subject";
    });

  window.addEventListener("click", function (event) {
    if (event.target === noMaterieModal) {
      noMaterieModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  /**
   * ============================================
   * EDIT VERIFICATION MODAL
   * ============================================
   */

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

  /**
   * Load subjects for edit form
   */
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

  // ===== REAL-TIME DATE CHANGE LISTENER =====
  editVerificaData.addEventListener("change", function () {
    const dataFormattata = editVerificaData.value.trim();

    if (!dataFormattata) return;

    const dateParts = dataFormattata.split("/");
    if (dateParts.length !== 3) return;

    const selectedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isFutura = selectedDate > today;

    if (isFutura) {
      editValutazione.value = "";
      editValutazione.disabled = true;
      editPrevisto.checked = true;
      editPrevisto.disabled = true;
    } else {
      editPrevisto.disabled = false;

      if (editValutazione.value && !isNaN(parseFloat(editValutazione.value))) {
        editPrevisto.disabled = true;
      } else {
        editValutazione.disabled = false;
      }
    }
  });

  /**
   * Open edit verification modal
   */
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const verificaDate = new Date(data.verifica.data);
        verificaDate.setHours(0, 0, 0, 0);
        const isFutura = verificaDate > today;

        editVerificaData.value = new Date(
          data.verifica.data
        ).toLocaleDateString("it-IT");
        editMateria.value = data.verifica.materialID._id;
        editArgomento.value = data.verifica.argomento;

        if (isFutura) {
          editValutazione.value = "";
          editValutazione.disabled = true;
          editPrevisto.checked = true;
          editPrevisto.disabled = true;
        } else {
          if (data.verifica.voto !== null && data.verifica.voto !== undefined) {
            editPrevisto.checked = false;
            editValutazione.disabled = false;
            editValutazione.value = data.verifica.voto?.toString() || "";
            editPrevisto.disabled = true;
          } else {
            editPrevisto.disabled = false;

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

        if (editVerificaData._flatpickr) {
          editVerificaData._flatpickr.destroy();
        }

        if (isFutura) {
          flatpickr(editVerificaData, {
            locale: "it",
            dateFormat: "d/m/Y",
            allowInput: false,
            disableMobile: true,
          });
        } else {
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
      }
    } catch {
      console.error("Errore di connessione");
    }
  }

  // ===== CHECKBOX LOGIC FOR GRADE =====
  editPrevisto.addEventListener("change", function () {
    if (editPrevisto.checked) {
      editValutazione.value = "";
      editValutazione.disabled = true;
    } else {
      editValutazione.disabled = false;
    }
  });

  document
    .getElementById("closeEditVerifica")
    .addEventListener("click", function () {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("annullaEditVerifica")
    .addEventListener("click", function () {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  window.addEventListener("click", function (event) {
    if (event.target === editVerificaModal) {
      editVerificaModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  /**
   * Submit edit verification form
   */
  editVerificaForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    editVerificaError.style.display = "none";
    editVerificaError.textContent = "";
    editMateria.classList.remove("input-error");
    editVerificaData.classList.remove("input-error");
    editArgomento.classList.remove("input-error");
    editValutazione.classList.remove("input-error");

    const materia = editMateria.value;
    const data = editVerificaData.value.trim();
    const argomento = editArgomento.value.trim();
    const voto = editValutazione.disabled
      ? null
      : editValutazione.value
      ? parseFloat(editValutazione.value.replace(",", "."))
      : null;
    let votoFuturo = editPrevisto.checked;

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
          materialID: materia,
          data: formattedDate,
          argomento: argomento,
          voto: votoFuturo ? null : voto,
          votoFuturo: votoFuturo,
        }),
      });
      const result = await res.json();
      if (res.ok && result.verifica) {
        editVerificaModal.style.display = "none";
        await loadVerifiche();
        document.body.classList.remove("modal-open");
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

  /**
   * ============================================
   * FLATPICKR DATE PICKER
   * ============================================
   */

  flatpickr(dataInput, {
    locale: "it",
    dateFormat: "d/m/Y",
    allowInput: false,
    disableMobile: true,
    onOpen: function (selectedDates, dateStr, instance) {
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

  /**
   * ============================================
   * SUBMIT VERIFICATION FORM
   * ============================================
   */

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    document.getElementById("verificaError").style.display = "none";
    document.getElementById("verificaError").textContent = "";
    materiaSelect.classList.remove("input-error");
    dataInput.classList.remove("input-error");
    argomentoTextarea.classList.remove("input-error");
    selectValutazione.classList.remove("input-error");

    const materialID = materiaSelect.value;
    const dataVerifica = dataInput.value.trim();
    const argomento = argomentoTextarea.value.trim();
    const voto = selectValutazione.value
      ? parseFloat(selectValutazione.value.replace(",", "."))
      : null;
    const votoFuturo = checkboxPrevisto.checked;

    let firstError = "";

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
        await loadVerifiche();
        document.body.classList.remove("modal-open");
      } else {
        document.getElementById("verificaError").style.display = "block";
        document.getElementById("verificaError").textContent =
          result.message || "Errore nel salvataggio";
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

  /**
   * ============================================
   * GRADE VALIDATION
   * ============================================
   */

  /**
   * Validate grade - only 0, 0.5, 1, 1.5, ... 10
   */
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

  // ===== REAL-TIME GRADE VALIDATION =====
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

  // ===== REAL-TIME EDIT GRADE VALIDATION =====
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
});
