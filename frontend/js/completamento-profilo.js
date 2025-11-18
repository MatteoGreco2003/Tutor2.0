// ===== VERIFICA DATI SESSIONE =====
window.addEventListener("load", () => {
  const registrationData = sessionStorage.getItem("registrationData");

  if (!registrationData) {
    alert("Sessione scaduta. Effettua di nuovo la registrazione.");
    window.location.href = "/";
  }
});

// ===== ELEMENTI DOM =====
const profileForm = document.getElementById("profileForm");
const cancelBtn = document.getElementById("cancelBtn");
const gradoScolasticoSelect = document.getElementById("gradoScolastico");
const indirizzoScolasticoGroup = document.getElementById(
  "indirizzoScolasticoGroup"
);
const indirizzoScolasticoSelect = document.getElementById(
  "indirizzoScolastico"
);
const addProfessorBtn = document.getElementById("addProfessorBtn");
const emailProfessoriContainer = document.getElementById(
  "emailProfessoriContainer"
);

let emailProfCount = 0;

// ===== LOGICA CONDIZIONALE: INDIRIZZO SCOLASTICO =====
gradoScolasticoSelect.addEventListener("change", (e) => {
  if (e.target.value === "Superiori") {
    // Se seleziona "Superiori" → abilita la select
    indirizzoScolasticoSelect.disabled = false;
    indirizzoScolasticoSelect.required = true;
  } else {
    // Se NON seleziona "Superiori" → disabilita la select
    indirizzoScolasticoSelect.disabled = true;
    indirizzoScolasticoSelect.required = false;
    indirizzoScolasticoSelect.value = ""; // Resetta al valore iniziale
  }
});

// Inizialmente la select dell'indirizzo è disabilitata
indirizzoScolasticoSelect.disabled = true;

// ===== AGGIUNGI PROFESSORE =====
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
          name="emailProf${emailProfCount}"
          placeholder="Email Professore ${emailProfCount}"
        />
      </div>
      <button 
        type="button" 
        class="btn-remove-prof" 
        data-index="${emailProfCount}"
      >
        Rimuovi
      </button>
    `;

    emailProfessoriContainer.appendChild(newEmailGroup);

    // Aggiungi event listener al bottone Rimuovi
    const removeBtn = newEmailGroup.querySelector(".btn-remove-prof");
    removeBtn.addEventListener("click", () => {
      removeProfessor(newEmailGroup);
    });

    // Rinumera tutto dopo aver aggiunto
    renumberProfessors();

    // Disabilita il bottone se raggiungi 5 email
    if (emailProfCount >= 5) {
      addProfessorBtn.disabled = true;
      addProfessorBtn.style.opacity = "0.5";
    }
  }
});

// ===== RIMUOVI PROFESSORE =====
function removeProfessor(group) {
  if (group) {
    group.remove();

    // Rinumera tutti gli input dopo la rimozione
    renumberProfessors();

    // Riabilita il bottone se scendi sotto 5
    if (emailProfCount < 5) {
      addProfessorBtn.disabled = false;
      addProfessorBtn.style.opacity = "1";
    }
  }
}

// ===== RINUMERA GLI INPUT PROFESSORI =====
function renumberProfessors() {
  const allGroups = document.querySelectorAll(".email-professor-group");

  allGroups.forEach((group, index) => {
    const newIndex = index + 1;
    const input = group.querySelector(".emailProf");

    // Aggiorna ID e name dell'input
    input.id = `emailProf${newIndex}`;
    input.name = `emailProf${newIndex}`;

    // Aggiorna placeholder
    input.placeholder = `Email Professore ${newIndex}`;

    // Aggiorna l'ID del gruppo
    group.id = `emailGroup${newIndex}`;
  });

  // Aggiorna il contatore
  emailProfCount = allGroups.length;
}

// ===== ANNULLA =====
cancelBtn.addEventListener("click", () => {
  // Torna alla pagina di registrazione
  window.location.href = "/";
});

// ===== SUBMIT FORM =====
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Pulisci errori precedenti
  clearErrors();

  // Raccogli errori
  const errors = validateForm();

  if (errors.length > 0) {
    showErrors(errors);
  } else {
    // Invia i dati al backend
    submitProfile();
  }
});

// ===== VALIDAZIONI =====
function validateForm() {
  const errors = [];

  // 1. Nome
  const nome = document.getElementById("nome").value.trim();
  if (!nome || nome.length < 2) {
    errors.push("Nome deve contenere almeno 2 caratteri");
    addInputError("nome");
    return errors; // ← RETURN SUBITO (primo errore)
  }

  // 2. Cognome
  const cognome = document.getElementById("cognome").value.trim();
  if (!cognome || cognome.length < 2) {
    errors.push("Cognome deve contenere almeno 2 caratteri");
    addInputError("cognome");
    return errors;
  }

  // 3. Telefono (formato italiano - 10 cifre)
  const telefono = document.getElementById("telefono").value.trim();
  if (!isValidPhone(telefono)) {
    errors.push("Telefono non valido (es: 3331234567)");
    addInputError("telefono");
    return errors;
  }

  // 4. Grado scolastico
  const gradoScolastico = document.getElementById("gradoScolastico").value;
  if (!gradoScolastico) {
    errors.push("Seleziona il grado scolastico");
    addInputError("gradoScolastico");
    return errors;
  }

  // 5. Indirizzo scolastico (OBBLIGATORIO se Superiori)
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

  // ===== GENITORE 1 (OBBLIGATORIO) =====
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

  // ===== GENITORE 2 (OBBLIGATORIO) =====
  const genitore2Nome = document.getElementById("genitore2Nome").value.trim();
  if (!genitore2Nome || genitore2Nome.length < 2) {
    errors.push("Nome Genitore 2 deve contenere almeno 2 caratteri");
    addInputError("genitore2Nome");
    return errors;
  }

  const genitore2Cognome = document
    .getElementById("genitore2Cognome")
    .value.trim();
  if (!genitore2Cognome || genitore2Cognome.length < 2) {
    errors.push("Cognome Genitore 2 deve contenere almeno 2 caratteri");
    addInputError("genitore2Cognome");
    return errors;
  }

  const genitore2Telefono = document
    .getElementById("genitore2Telefono")
    .value.trim();
  if (!isValidPhone(genitore2Telefono)) {
    errors.push("Telefono Genitore 2 non valido (es: 3331234567)");
    addInputError("genitore2Telefono");
    return errors;
  }

  // 6. Email Famiglia (OBBLIGATORIA)
  const emailFamiglia = document.getElementById("emailFamiglia").value.trim();
  if (!isValidEmail(emailFamiglia)) {
    errors.push("Email Famiglia non valida (es: famiglia@example.com)");
    addInputError("emailFamiglia");
    return errors;
  }

  // 7. Email Professori (OPZIONALI - valida solo se inserite)
  const emailProfInputs = document.querySelectorAll(".emailProf");
  for (let input of emailProfInputs) {
    if (input.value.trim() !== "") {
      if (!isValidEmail(input.value.trim())) {
        const index = Array.from(emailProfInputs).indexOf(input) + 1;
        errors.push(
          `Email Professore ${index} non valida (es: professore${index}@example.com)`
        );
        addInputError(input.id);
        return errors;
      }
    }
  }

  // Se non ci sono errori, ritorna array vuoto
  return errors;
}

// ===== FUNZIONI VALIDAZIONE =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Accetta numeri italiani (10 cifre)
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ""));
}

function addInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("input-error");
  }
}

function clearInputErrors() {
  document.querySelectorAll("input, select").forEach((el) => {
    el.classList.remove("input-error");
  });
}

function showErrors(errors) {
  const errorContainer = document.getElementById("profileErrors");
  errorContainer.innerHTML = "";

  // Mostra SOLO il primo errore
  if (errors.length > 0) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "⚠️ " + errors[0]; // ← SOLO il primo
    errorContainer.appendChild(errorDiv);
  }

  // Scroll all'errore
  errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearErrors() {
  document.getElementById("profileErrors").innerHTML = "";
  clearInputErrors();
}

// ===== SUBMIT DATI AL BACKEND =====
async function submitProfile() {
  // Recupera i dati temporanei salvati in sessionStorage
  const registrationData = JSON.parse(
    sessionStorage.getItem("registrationData")
  );

  if (!registrationData) {
    showErrors(["Sessione scaduta. Registrati di nuovo."]);
    window.location.href = "/";
    return;
  }

  // Capitalizza TUTTI i nomi e cognomi (stesso codice di validateForm)
  const nome = document.getElementById("nome").value.trim();
  const nomeCapitalizzato =
    nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

  const cognome = document.getElementById("cognome").value.trim();
  const cognomeCapitalizzato =
    cognome.charAt(0).toUpperCase() + cognome.slice(1).toLowerCase();

  const genitore1Nome = document.getElementById("genitore1Nome").value.trim();
  const genitore1NomeCapitalizzato =
    genitore1Nome.charAt(0).toUpperCase() +
    genitore1Nome.slice(1).toLowerCase();

  const genitore1Cognome = document
    .getElementById("genitore1Cognome")
    .value.trim();
  const genitore1CognomeCapitalizzato =
    genitore1Cognome.charAt(0).toUpperCase() +
    genitore1Cognome.slice(1).toLowerCase();

  const genitore2Nome = document.getElementById("genitore2Nome").value.trim();
  const genitore2NomeCapitalizzato =
    genitore2Nome.charAt(0).toUpperCase() +
    genitore2Nome.slice(1).toLowerCase();

  const genitore2Cognome = document
    .getElementById("genitore2Cognome")
    .value.trim();
  const genitore2CognomeCapitalizzato =
    genitore2Cognome.charAt(0).toUpperCase() +
    genitore2Cognome.slice(1).toLowerCase();

  // Crea l'oggetto formData con i nomi capitalizzati
  const formData = {
    // ===== DATI DI REGISTRAZIONE (da sessionStorage) =====
    email: registrationData.email,
    password: registrationData.password,
    tipo: registrationData.tipo,
    consentGDPR: registrationData.consentGDPR,
    consentGDPRDate: registrationData.consentGDPRDate,

    // ===== DATI PERSONALI (CAPITALIZZATI) =====
    nome: nomeCapitalizzato, // ← USA IL CAPITALIZZATO
    cognome: cognomeCapitalizzato, // ← USA IL CAPITALIZZATO
    telefono: document.getElementById("telefono").value.trim(),
    gradoScolastico: document.getElementById("gradoScolastico").value,
    indirizzoScolastico:
      document.getElementById("indirizzoScolastico").value || null,

    // ===== DATI FAMIGLIA (CAPITALIZZATI) =====
    famiglia: {
      genitore1: {
        nome: genitore1NomeCapitalizzato, // ← USA IL CAPITALIZZATO
        cognome: genitore1CognomeCapitalizzato, // ← USA IL CAPITALIZZATO
        telefono: document.getElementById("genitore1Telefono").value.trim(),
      },
      genitore2: {
        nome: genitore2NomeCapitalizzato, // ← USA IL CAPITALIZZATO
        cognome: genitore2CognomeCapitalizzato, // ← USA IL CAPITALIZZATO
        telefono: document.getElementById("genitore2Telefono").value.trim(),
      },
      email: document.getElementById("emailFamiglia").value.trim(),
    },

    // ===== EMAIL PROFESSORI =====
    scuola: {
      emailProfessori: [],
    },
  };

  // Raccogli email professori (solo quelle compilate)
  document.querySelectorAll(".emailProf").forEach((input) => {
    if (input.value.trim() !== "") {
      formData.scuola.emailProfessori.push(input.value.trim());
    }
  });

  try {
    // ===== INVIA TUTTO AL BACKEND IN UNA SOLA VOLTA =====
    const response = await fetch("/auth/register-complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      // Salva il token se il backend lo restituisce
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Pulisci sessionStorage (dati non più necessari)
      sessionStorage.removeItem("registrationData");

      alert("Profilo completato con successo!");

      // Reindirizza alla home studente
      window.location.href = "/home-studente";
    } else {
      showErrors([data.message || "Errore nel completamento del profilo"]);
    }
  } catch (error) {
    console.error("Errore:", error);
    showErrors(["Errore di connessione al server"]);
  }
}
