// ===== ATTENDI IL CARICAMENTO DEL DOM =====
document.addEventListener("DOMContentLoaded", async function () {
  // ===== VERIFICA TOKEN ALL'INIZIO =====
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    const response = await apiCall("/auth/home-studenti");
    if (!response || !response.ok) {
      window.location.href = "/login";
      return;
    }
    console.log("Autorizzato!");
  } catch (error) {
    console.error("Errore verifica token:", error);
    window.location.href = "/login";
    return;
  }

  // ===== PULSANTE DISCONNETTITI =====
  document
    .querySelector(".logout-btn")
    .addEventListener("click", async function () {
      try {
        const response = await fetch("/auth/logout", {
          method: "GET",
        });

        if (response.ok) {
          // Cancella il token da localStorage
          localStorage.removeItem("token");

          // Reindirizza al login
          window.location.href = "/";
        } else {
          alert("Errore durante il logout");
        }
      } catch (error) {
        console.error("Errore logout:", error);
        alert("Errore durante il logout");
      }
    });

  // ===== MODALE ELIMINA PROFILO =====
  document.querySelector(".delete-btn").addEventListener("click", function (e) {
    document.getElementById("deleteProfileModal").style.display = "flex";
  });

  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", function () {
      document.getElementById("deleteProfileModal").style.display = "none";
    });

  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", function () {
      document.getElementById("deleteProfileModal").style.display = "none";
    });

  window.addEventListener("click", function (event) {
    const modal = document.getElementById("deleteProfileModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // ===== MODALE INSERISCI VERIFICA =====
  const modal = document.getElementById("insertVerificaModal");
  const form = document.getElementById("insertVerificaForm");
  const materiaSelect = document.getElementById("materia");
  const argomentoTextarea = document.getElementById("argomento");
  const checkboxPrevisto = document.getElementById("previsto");
  const selectValutazione = document.getElementById("valutazione");
  const dataInput = document.getElementById("verificaData");

  // Funzione per resettare il form
  function resetInsertVerificaForm() {
    form.reset();
    materiaSelect.selectedIndex = 0;
    selectValutazione.selectedIndex = 0;
    selectValutazione.disabled = false;
    checkboxPrevisto.checked = false;
    argomentoTextarea.style.height = "";
  }

  // Quando apri la modale
  document.getElementById("addVerificaBtn").addEventListener("click", () => {
    resetInsertVerificaForm();
    modal.style.display = "flex";
  });

  // Quando chiudi la modale (X)
  document
    .getElementById("closeInsertVerifica")
    .addEventListener("click", () => {
      modal.style.display = "none";
      resetInsertVerificaForm();
    });

  // Quando chiudi la modale (Annulla)
  document.getElementById("annullaVerifica").addEventListener("click", () => {
    modal.style.display = "none";
    resetInsertVerificaForm();
  });

  // Quando chiudi cliccando fuori
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

  // ===== FLATPICKR DATE PICKER =====
  flatpickr(dataInput, {
    locale: "it",
    dateFormat: "d/m/Y",
    allowInput: false,
    disableMobile: true,
    onOpen: function (selectedDates, dateStr, instance) {
      // Centra il calendario rispetto all'input
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
        checkboxPrevisto.disabled = true; /* ← AGGIUNGI QUESTA RIGA */
        selectValutazione.disabled = true;
        selectValutazione.value = "";
      } else {
        checkboxPrevisto.checked = false;
        checkboxPrevisto.disabled = false; /* ← AGGIUNGI QUESTA RIGA */
        selectValutazione.disabled = false;
      }
    },
  });

  // ===== SUBMIT FORM =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Funzione di salvataggio verifica in sviluppo!");
    modal.style.display = "none";
    resetInsertVerificaForm();
  });
});
