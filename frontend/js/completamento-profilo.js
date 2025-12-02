// ==========================================
// COMPLETAMENTO PROFILO - TUTOR 2.0
// ==========================================

/* ===== VERIFICA SESSIONE ALL'APERTURA PAGINA ===== */
window.addEventListener("pageshow", (event) => {
  const registrationData = sessionStorage.getItem("registrationData");
  if (!registrationData) {
    window.location.href = "/";
  }
});

/* ===== DISABILITA IL BACK/FORWARD CACHE ===== */
window.addEventListener("pagehide", () => {
  // Disabilita bfcache
});

/* ===== DOM ELEMENTS ===== */
const profileForm = document.getElementById("profileForm");
const cancelBtn = document.getElementById("cancelBtn");
const gradoScolasticoSelect = document.getElementById("gradoScolastico");
const indirizzoScolasticoSelect = document.getElementById(
  "indirizzoScolastico"
);
const addProfessorBtn = document.getElementById("addProfessorBtn");
const emailProfessoriContainer = document.getElementById(
  "emailProfessoriContainer"
);

let emailProfCount = 0;

/* ===== LOGICA CONDIZIONALE: INDIRIZZO SCOLASTICO ===== */
gradoScolasticoSelect.addEventListener("change", (e) => {
  const isSuperiori = e.target.value === "Superiori";
  indirizzoScolasticoSelect.disabled = !isSuperiori;
  indirizzoScolasticoSelect.required = isSuperiori;
  if (!isSuperiori) {
    indirizzoScolasticoSelect.value = "";
  }
});

indirizzoScolasticoSelect.disabled = true;

/* ===== GESTIONE EMAIL PROFESSORI ===== */
addProfessorBtn.addEventListener("click", () => {
  if (emailProfCount < 5) {
    emailProfCount++;
    const newEmailGroup = document.createElement("div");
    newEmailGroup.className = "email-professor-group";
    newEmailGroup.id = `emailGroup${emailProfCount}`;
    newEmailGroup.innerHTML = `
      <div class="form-group">
        <input
          type="email"
          class="emailProf"
          id="emailProf${emailProfCount}"
          placeholder="Email Professore ${emailProfCount}"
        />
      </div>
      <button type="button" class="btn-remove-prof" data-index="${emailProfCount}">
        Rimuovi
      </button>
    `;

    emailProfessoriContainer.appendChild(newEmailGroup);
    newEmailGroup
      .querySelector(".btn-remove-prof")
      .addEventListener("click", () => {
        removeProfessor(newEmailGroup);
      });

    renumberProfessors();
    updateAddButtonState();
  }
});

/**
 * Rimuovi campo email professore
 */
function removeProfessor(group) {
  if (group) {
    group.remove();
    renumberProfessors();
    updateAddButtonState();
  }
}

/**
 * Rinumera tutti i campi email professori
 */
function renumberProfessors() {
  const allGroups = document.querySelectorAll(".email-professor-group");
  allGroups.forEach((group, index) => {
    const newIndex = index + 1;
    const input = group.querySelector(".emailProf");
    input.id = `emailProf${newIndex}`;
    input.placeholder = `Email Professore ${newIndex}`;
    group.id = `emailGroup${newIndex}`;
  });
  emailProfCount = allGroups.length;
}

/**
 * Abilita/disabilita bottone aggiungi in base al numero di email
 */
function updateAddButtonState() {
  const isDisabled = emailProfCount >= 5;
  addProfessorBtn.disabled = isDisabled;
  addProfessorBtn.style.opacity = isDisabled ? "0.5" : "1";
}

/* ===== BOTTONE ANNULLA ===== */
cancelBtn.addEventListener("click", () => {
  sessionStorage.removeItem("registrationData");
  window.location.href = "/";
});

/* ===== SUBMIT FORM ===== */
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearErrors();
  const errors = validateForm();

  if (errors.length > 0) {
    showErrors(errors);
  } else {
    submitProfile();
  }
});

/* ===== UTILITY FUNCTIONS ===== */

/**
 * Valida email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida telefono italiano (10 cifre)
 */
function isValidPhone(phone) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ""));
}

/**
 * Capitalizza prima lettera
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Aggiunge classe di errore all'input
 */
function addInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("input-error");
  }
}

/**
 * Rimuove classe di errore da tutti gli input
 */
function clearInputErrors() {
  document.querySelectorAll("input, select").forEach((el) => {
    el.classList.remove("input-error");
  });
}

/**
 * Valida il form completo
 */
function validateForm() {
  const errors = [];

  // 1. NOME
  const nome = document.getElementById("nome").value.trim();
  if (!nome || nome.length < 2) {
    errors.push("Nome deve contenere almeno 2 caratteri");
    addInputError("nome");
    return errors;
  }

  // 2. COGNOME
  const cognome = document.getElementById("cognome").value.trim();
  if (!cognome || cognome.length < 2) {
    errors.push("Cognome deve contenere almeno 2 caratteri");
    addInputError("cognome");
    return errors;
  }

  // 3. TELEFONO
  const telefono = document.getElementById("telefono").value.trim();
  if (!isValidPhone(telefono)) {
    errors.push("Telefono non valido (es: 3331234567)");
    addInputError("telefono");
    return errors;
  }

  // 4. GRADO SCOLASTICO
  const gradoScolastico = document.getElementById("gradoScolastico").value;
  if (!gradoScolastico) {
    errors.push("Seleziona il grado scolastico");
    addInputError("gradoScolastico");
    return errors;
  }

  // 5. INDIRIZZO SCOLASTICO (se Superiori)
  if (gradoScolastico === "Superiori") {
    const indirizzoScolastico = document.getElementById(
      "indirizzoScolastico"
    ).value;
    if (!indirizzoScolastico) {
      errors.push("Seleziona l'indirizzo scolastico");
      addInputError("indirizzoScolastico");
      return errors;
    }
  }

  // 6. GENITORE 1 (OBBLIGATORIO)
  const genitore1Nome = document.getElementById("genitore1Nome").value.trim();
  if (!genitore1Nome || genitore1Nome.length < 2) {
    errors.push("Nome Genitore 1 deve contenere almeno 2 caratteri");
    addInputError("genitore1Nome");
    return errors;
  }

  const genitore1Cognome = document
    .getElementById("genitore1Cognome")
    .value.trim();
  if (!genitore1Cognome || genitore1Cognome.length < 2) {
    errors.push("Cognome Genitore 1 deve contenere almeno 2 caratteri");
    addInputError("genitore1Cognome");
    return errors;
  }

  const genitore1Telefono = document
    .getElementById("genitore1Telefono")
    .value.trim();
  if (!isValidPhone(genitore1Telefono)) {
    errors.push("Telefono Genitore 1 non valido (es: 3331234567)");
    addInputError("genitore1Telefono");
    return errors;
  }

  // 7. EMAIL FAMIGLIA (OBBLIGATORIA)
  const emailFamiglia = document.getElementById("emailFamiglia").value.trim();
  if (!isValidEmail(emailFamiglia)) {
    errors.push("Email Famiglia non valida (es: famiglia@example.com)");
    addInputError("emailFamiglia");
    return errors;
  }

  // 8. EMAIL PROFESSORI (OPZIONALI - valida solo se compilati)
  const emailProfInputs = document.querySelectorAll(".emailProf");
  for (let input of emailProfInputs) {
    if (input.value.trim() !== "") {
      if (!isValidEmail(input.value.trim())) {
        const index = Array.from(emailProfInputs).indexOf(input) + 1;
        errors.push(
          `Email Professore ${index} non valida (es: prof${index}@example.com)`
        );
        addInputError(input.id);
        return errors;
      }
    }
  }

  return errors;
}

/**
 * Mostra messaggio di errore (solo il primo)
 */
function showErrors(errors) {
  const errorContainer = document.getElementById("profileErrors");
  errorContainer.innerHTML = "";

  if (errors.length > 0) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "⚠️ " + errors[0];
    errorContainer.appendChild(errorDiv);
  }

  errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * Pulisce tutti gli errori
 */
function clearErrors() {
  document.getElementById("profileErrors").innerHTML = "";
  clearInputErrors();
}

/* ===== SUBMIT DATI AL BACKEND ===== */

/**
 * Invia i dati del profilo al backend
 */
async function submitProfile() {
  const registrationData = JSON.parse(
    sessionStorage.getItem("registrationData")
  );

  if (!registrationData) {
    showErrors(["Sessione scaduta. Registrati di nuovo."]);
    window.location.href = "/";
    return;
  }

  const formData = {
    // Dati registrazione
    email: registrationData.email,
    password: registrationData.password,
    tipo: registrationData.tipo,
    consentGDPR: registrationData.consentGDPR,
    consentGDPRDate: registrationData.consentGDPRDate,

    // Dati personali (capitalizzati)
    nome: capitalize(document.getElementById("nome").value.trim()),
    cognome: capitalize(document.getElementById("cognome").value.trim()),
    telefono: document.getElementById("telefono").value.trim(),
    gradoScolastico: document.getElementById("gradoScolastico").value,
    indirizzoScolastico:
      document.getElementById("indirizzoScolastico").value || null,

    // Dati famiglia (capitalizzati)
    famiglia: {
      genitore1: {
        nome: capitalize(document.getElementById("genitore1Nome").value.trim()),
        cognome: capitalize(
          document.getElementById("genitore1Cognome").value.trim()
        ),
        telefono: document.getElementById("genitore1Telefono").value.trim(),
      },
      genitore2: {
        nome: capitalize(document.getElementById("genitore2Nome").value.trim()),
        cognome: capitalize(
          document.getElementById("genitore2Cognome").value.trim()
        ),
        telefono: document.getElementById("genitore2Telefono").value.trim(),
      },
      email: document.getElementById("emailFamiglia").value.trim(),
    },

    // Email professori
    scuola: {
      emailProfessori: [],
    },
  };

  // Raccogli email professori compilate
  document.querySelectorAll(".emailProf").forEach((input) => {
    if (input.value.trim() !== "") {
      formData.scuola.emailProfessori.push(input.value.trim());
    }
  });

  try {
    const response = await fetch("/auth/register-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      sessionStorage.removeItem("registrationData");
      window.location.href = "/home-studenti";
    } else {
      showErrors([data.message || "Errore nel completamento del profilo"]);
    }
  } catch (error) {
    console.error("Errore:", error);
    showErrors(["Errore di connessione al server"]);
  }
}
