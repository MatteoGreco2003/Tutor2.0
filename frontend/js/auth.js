// ==========================================
// AUTENTICAZIONE - TUTOR 2.0
// ==========================================

// ===== ELEMENTI DOM =====
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// ===== TOGGLE LOGIN/REGISTRAZIONE =====
/**
 * Toggle tra schermata login e registrazione
 */
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
  // Resetta form login e errori quando vai a registrazione
  resetLoginForm();
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
  // Resetta form registrazione e errori quando vai a login
  resetRegisterForm();
});

// ===== FUNZIONI DI RESET FORM =====

/**
 * Resetta form login, errori e input errors
 */
function resetLoginForm() {
  loginForm.reset();

  document.getElementById("loginPassword").type = "password";
  document.querySelectorAll(".login .toggle-password").forEach((icon) => {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-lock");
  });

  clearErrors("login");
  clearInputErrors("login");
}

/**
 * Resetta form registrazione, errori e input errors
 */
function resetRegisterForm() {
  registerForm.reset();

  document.getElementById("registerPassword").type = "password";
  document.getElementById("confirmPassword").type = "password";
  document.querySelectorAll(".register .toggle-password").forEach((icon) => {
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-lock");
  });

  clearErrors("register");
  clearInputErrors("register");
}

// ==========================================
// VALIDAZIONE FORM
// ==========================================

/**
 * Valida formato email
 * @param {string} email - Email da validare
 * @returns {boolean} - True se valida, false altrimenti
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida password
 * Requisiti: min 8 caratteri, 1 maiuscola, 1 minuscola, 1 numero
 * @param {string} password - Password da validare
 * @returns {boolean} - True se valida, false altrimenti
 */
function isValidPassword(password) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
}

// ==========================================
// GESTIONE MESSAGGI DI ERRORE
// ==========================================

/**
 * Mostra messaggi di errore sotto il form
 * @param {string} formType - "login" o "register"
 * @param {array} errors - Array di messaggi di errore
 */
function showErrors(formType, errors) {
  const errorContainer = document.getElementById(`${formType}Errors`);
  errorContainer.innerHTML = "";

  errors.forEach((error) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "⚠️ " + error;
    errorContainer.appendChild(errorDiv);
  });
}

/**
 * Pulisce i messaggi di errore
 * @param {string} formType - "login" o "register"
 */
function clearErrors(formType) {
  const errorContainer = document.getElementById(`${formType}Errors`);
  errorContainer.innerHTML = "";
}

/**
 * Aggiunge classe di errore all'input (bordo rosso)
 * @param {string} inputId - ID dell'input
 */
function addInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("input-error");
  }
}

/**
 * Rimuove classe di errore da tutti gli input del form
 * @param {string} formType - "login" o "register"
 */
function clearInputErrors(formType) {
  const form = formType === "login" ? loginForm : registerForm;
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("input-error");
  });
}

// ==========================================
// GESTIONE REGISTRAZIONE
// ==========================================

/**
 * Registrazione: validazione client-side
 */
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const gdprConsent = document.getElementById("gdprConsent").checked;

  // Pulisci errori precedenti
  clearErrors("register");
  clearInputErrors("register");

  let firstError = null;
  let firstErrorInput = null;

  // Validazione 1: Email
  if (!isValidEmail(email)) {
    firstError = "Email non valida (es: user@example.com)";
    firstErrorInput = "registerEmail";
  }
  // Validazione 2: Password (solo se email OK)
  else if (!isValidPassword(password)) {
    firstError =
      "Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)";
    firstErrorInput = "registerPassword";
  }
  // Validazione 3: Conferma password (solo se password OK)
  else if (password !== confirmPassword) {
    firstError = "Le password non corrispondono";
    firstErrorInput = "confirmPassword";
  }
  // Validazione 4: GDPR (solo se password OK)
  else if (!gdprConsent) {
    firstError =
      "Devi accettare l'informativa sulla privacy e la cookie policy";
    firstErrorInput = null;
  }

  // Mostra primo errore se presente
  if (firstError) {
    showErrors("register", [firstError]);
    if (firstErrorInput) {
      addInputError(firstErrorInput);
    }
  } else {
    // Validazione OK: procedi con registrazione
    registerUser(email, password);
  }
});

/**
 * Registra un nuovo utente
 * Salva dati temporanei e reindirizza a complete-profile
 * @param {string} email - Email utente
 * @param {string} password - Password utente
 */
async function registerUser(email, password) {
  try {
    const registrationData = {
      email: email,
      password: password,
      tipo: "studente",
      consentGDPR: true,
      consentGDPRDate: new Date().toISOString(),
    };

    // Salva dati temporanei in sessionStorage
    sessionStorage.setItem(
      "registrationData",
      JSON.stringify(registrationData)
    );

    // Pulisci form
    registerForm.reset();

    // Reindirizza a pagina di completamento profilo
    window.location.href = "/complete-profile";
  } catch (error) {
    console.error("Errore registrazione:", error);
    showErrors("register", ["Errore di connessione al server"]);
  }
}

// ==========================================
// GESTIONE LOGIN
// ==========================================

/**
 * Login: validazione client-side
 */
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Pulisci errori precedenti
  clearErrors("login");
  clearInputErrors("login");

  let firstError = null;
  let firstErrorInput = null;

  // Validazione 1: Email
  if (!isValidEmail(email)) {
    firstError = "Email non valida (es: user@example.com)";
    firstErrorInput = "loginEmail";
  }
  // Validazione 2: Password (solo se email OK)
  else if (password.length === 0) {
    firstError = "Inserisci la password";
    firstErrorInput = "loginPassword";
  }

  // Mostra primo errore se presente
  if (firstError) {
    showErrors("login", [firstError]);
    if (firstErrorInput) {
      addInputError(firstErrorInput);
    }
  } else {
    // Validazione OK: procedi con login
    loginUser(email, password);
  }
});

/**
 * Effettua login comunicando con il backend
 * Salva token e reindirizza a home se successo
 * @param {string} email - Email utente
 * @param {string} password - Password utente
 */
async function loginUser(email, password) {
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Salva token nel localStorage
      localStorage.setItem("token", data.token);
      // Reindirizza a home
      window.location.href = "/home-studenti";
    } else {
      // Mostra errore dal backend
      showErrors("login", [data.message || "Credenziali non valide"]);
    }
  } catch (error) {
    console.error("Errore login:", error);
    showErrors("login", ["Errore di connessione al server"]);
  }
}

// ==========================================
// GESTIONE MODALE RECUPERO PASSWORD
// ==========================================

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeModalBtn = document.querySelector(".close");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const closeForgotBtn = document.getElementById("closeForgotBtn");

/**
 * Apri modale recupero password
 */
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = "flex";
});

/**
 * Chiudi modale cliccando X e resetta il form
 */
closeModalBtn.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
  resetForgotPasswordForm();
});

/**
 * Chiudi modale cliccando fuori dal contenuto e resetta il form
 */
window.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) {
    forgotPasswordModal.style.display = "none";
    resetForgotPasswordForm();
  }
});

/**
 * Chiudi modale cliccando bottone Annulla
 */
closeForgotBtn.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
  resetForgotPasswordForm();
});

/**
 * Resetta form recupero password, errori e messaggi di successo
 */
function resetForgotPasswordForm() {
  forgotPasswordForm.reset();
  document.getElementById("forgotErrors").innerHTML = "";
  document.getElementById("forgotSuccess").style.display = "none";
}

/**
 * Submit form recupero password
 */
forgotPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();

  // Pulisci errori precedenti
  document.getElementById("forgotErrors").innerHTML = "";
  document.getElementById("forgotSuccess").style.display = "none";

  // Valida email
  if (!isValidEmail(email)) {
    showErrorsForgotPass(["Email non valida (es: user@example.com)"]);
    return;
  }

  /**
   * Submit form recupero password
   */
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();

    // Pulisci errori precedenti
    document.getElementById("forgotErrors").innerHTML = "";
    document.getElementById("forgotSuccess").style.display = "none";

    // Valida email
    if (!isValidEmail(email)) {
      showErrorsForgotPass(["Email non valida (es: user@example.com)"]);
      return;
    }

    // ✅ IMPLEMENTATO: Richiedi reset password
    requestPasswordReset(email);
  });
});

/**
 * Mostra errori nella modale recupero password
 * @param {array} errors - Array di messaggi di errore
 */
function showErrorsForgotPass(errors) {
  const errorContainer = document.getElementById("forgotErrors");
  errorContainer.innerHTML = "";

  errors.forEach((error) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "⚠️ " + error;
    errorContainer.appendChild(errorDiv);
  });
}

// ==========================================
// TOGGLE PASSWORD VISIBILITY
// ==========================================

/**
 * Toggle mostra/nascondi password
 * Cambia icona da lucchetto a occhio in base al contenuto dell'input
 */
document.querySelectorAll(".toggle-password").forEach((icon) => {
  const inputId = icon.getAttribute("data-input");
  const input = document.getElementById(inputId);

  /**
   * Aggiorna l'icona: occhio se c'è testo, lucchetto se vuoto
   */
  function updateIcon() {
    if (input.value.length > 0) {
      // C'è testo: mostra occhio se non è già visibile
      if (!icon.classList.contains("fa-eye")) {
        icon.classList.remove("fa-lock");
        icon.classList.add("fa-eye");
        icon.style.cursor = "pointer";
      }
    } else {
      // Input vuoto: mostra lucchetto
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-lock");
      input.type = "password"; // Nascondi password
      icon.style.cursor = "default";
    }
  }

  // Aggiorna icona quando scrivi
  input.addEventListener("input", updateIcon);

  // Click sull'icona: toggle visibilità (solo se c'è testo)
  icon.addEventListener("click", () => {
    if (input.value.length > 0) {
      if (input.type === "password") {
        // Mostra password
        input.type = "text";
      } else {
        // Nascondi password
        input.type = "password";
      }
    }
  });

  // Inizializza l'icona al caricamento
  updateIcon();
});

/**
 * Richiedi reset password al backend
 * @param {string} email - Email utente
 */
async function requestPasswordReset(email) {
  try {
    const response = await fetch("/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("forgotSuccess").style.display = "block";
      forgotPasswordForm.reset();

      setTimeout(() => {
        forgotPasswordModal.style.display = "none";
        document.getElementById("forgotSuccess").style.display = "none";
      }, 3000);
    } else {
      showErrorsForgotPass([data.message || "Errore nella richiesta"]);
    }
  } catch (error) {
    console.error("Errore:", error);
    showErrorsForgotPass(["Errore di connessione al server"]);
  }
}
