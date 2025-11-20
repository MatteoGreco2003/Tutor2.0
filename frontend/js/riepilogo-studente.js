// ==========================================
// RIEPILOGO PROFILO STUDENTE - TUTOR 2.0
// ==========================================

// ===== DISABILITA BACK BUTTON =====
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ==========================================
// CARICAMENTO PAGINA
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ===== VERIFICA TOKEN =====
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  console.log("✅ Token trovato");

  // ===== CARICA DATI STUDENTE =====
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
      populateProfileData(data.data);

      // Aggiorna header
      const headerTitle = document.querySelector(".header-title");
      headerTitle.textContent = `${data.data.nome} ${data.data.cognome}`;

      const userIcon = document.querySelector(".user-icon");
      userIcon.textContent = data.data.nome.charAt(0).toUpperCase();
    } else {
      console.error("Errore nel caricamento dati:", data.message);
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Errore caricamento studente:", error);
    window.location.href = "/";
  }

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

  // ==========================================
  // MODALE ELIMINA PROFILO
  // ==========================================

  const deleteProfileModal = document.getElementById("deleteProfileModal");

  document.querySelector(".delete-btn").addEventListener("click", function () {
    deleteProfileModal.style.display = "flex";
  });

  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
    });

  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", function () {
      deleteProfileModal.style.display = "none";
    });

  window.addEventListener("click", function (event) {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
    }
  });

  document
    .getElementById("confirmDeleteProfile")
    .addEventListener("click", async function () {
      try {
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
          alert("Profilo eliminato con successo");
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
  // BOTTONI MODIFICA (TODO)
  // ==========================================

  document
    .getElementById("editPersonalBtn")
    .addEventListener("click", function () {
      console.log("TODO: Modifica dati personali");
    });

  document
    .getElementById("editFamilyBtn")
    .addEventListener("click", function () {
      console.log("TODO: Modifica dati famiglia");
    });

  document
    .getElementById("editSchoolBtn")
    .addEventListener("click", function () {
      console.log("TODO: Modifica dati scuola");
    });
});

// ===== FUNZIONE PER POPOLARE I DATI =====
/**
 * Popola i dati del profilo nella pagina
 * @param {object} studentData - Dati dello studente dal backend
 */
function populateProfileData(studentData) {
  // ===== DATI PERSONALI =====
  document.getElementById("personalNomeCognome").textContent =
    `${studentData.nome} ${studentData.cognome}` || "-";
  document.getElementById("personalEmail").textContent =
    studentData.email || "-";
  document.getElementById("personalGrado").textContent =
    studentData.gradoScolastico || "-";
  document.getElementById("personalIndirizzo").textContent =
    studentData.indirizzoScolastico || "-";
  document.getElementById("personalTelefono").textContent =
    studentData.telefono || "-";

  // ===== DATI FAMIGLIA =====

  // Genitore 1
  if (studentData.genitore1) {
    document.getElementById("familyGen1Nome").textContent =
      `${studentData.genitore1.nome || ""} ${
        studentData.genitore1.cognome || ""
      }`.trim() || "-";
    document.getElementById("familyGen1Tel").textContent =
      studentData.genitore1.telefono || "-";
  }

  // Genitore 2
  if (studentData.genitore2) {
    document.getElementById("familyGen2Nome").textContent =
      `${studentData.genitore2.nome || ""} ${
        studentData.genitore2.cognome || ""
      }`.trim() || "-";
    document.getElementById("familyGen2Tel").textContent =
      studentData.genitore2.telefono || "-";
  }

  // Email Famiglia
  document.getElementById("familyEmail").textContent =
    studentData.emailFamiglia || "-";

  // ===== DATI SCUOLA =====

  if (studentData.emailInsegnanti && studentData.emailInsegnanti.length > 0) {
    const emailsContainer = document.getElementById("schoolEmails");
    emailsContainer.innerHTML = studentData.emailInsegnanti
      .map((email) => `<p class="info-value">${email}</p>`)
      .join("");
  } else {
    document.getElementById("schoolEmails").innerHTML =
      '<p class="info-value">-</p>';
  }
}
