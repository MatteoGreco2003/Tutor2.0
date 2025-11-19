// Elementi DOM
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// Toggle tra login e registrazione
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// ===== VALIDAZIONE REGISTRAZIONE =====
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const gdprConsent = document.getElementById("gdprConsent").checked;

  // Pulisci errori precedenti
  clearErrors("register");
  clearInputErrors("register");

  // Variabile per tracciare il primo errore
  let firstError = null;
  let firstErrorInput = null;

  // 1. Validazione email (PRIMA)
  if (!isValidEmail(email)) {
    firstError = "Email non valida (es: user@example.com)";
    firstErrorInput = "registerEmail";
  }

  // 2. Validazione password (SECONDA - solo se email è OK)
  else if (!isValidPassword(password)) {
    firstError =
      "Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero (es: Password123)";
    firstErrorInput = "registerPassword";
  }

  // 3. Conferma password corretta (TERZA - solo se password è OK)
  else if (password !== confirmPassword) {
    firstError = "Le password non corrispondono";
    firstErrorInput = "confirmPassword";
  }

  // 4. Consenso GDPR (QUARTA - solo se password è OK)
  else if (!gdprConsent) {
    firstError =
      "Devi accettare l'informativa sulla privacy e la cookie policy";
    firstErrorInput = null; // non c'è input associato
  }

  // Se c'è un errore, mostralo
  if (firstError) {
    showErrors("register", [firstError]);
    if (firstErrorInput) {
      addInputError(firstErrorInput);
    }
  } else {
    // Se tutto è OK, invia i dati al backend
    registerUser(email, password);
  }
});

// ===== VALIDAZIONE LOGIN =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Pulisci errori precedenti
  clearErrors("login");
  clearInputErrors("login");

  // Variabile per tracciare il primo errore
  let firstError = null;
  let firstErrorInput = null;

  // 1. Validazione email (PRIMA)
  if (!isValidEmail(email)) {
    firstError = "Email non valida (es: user@example.com)";
    firstErrorInput = "loginEmail";
  }

  // 2. Validazione password (SECONDA - solo se email è OK)
  else if (password.length === 0) {
    firstError = "Inserisci la password";
    firstErrorInput = "loginPassword";
  }

  // Se c'è un errore, mostralo
  if (firstError) {
    showErrors("login", [firstError]);
    if (firstErrorInput) {
      addInputError(firstErrorInput);
    }
  } else {
    loginUser(email, password);
  }
});

// ===== FUNZIONI DI VALIDAZIONE =====

/**
 * Valida formato email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida password:
 * - Minimo 8 caratteri
 * - Almeno una maiuscola
 * - Almeno una minuscola
 * - Almeno un numero
 */
function isValidPassword(password) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
}

// ===== FUNZIONI DI VISUALIZZAZIONE ERRORI =====

/**
 * Mostra messaggio di errore sotto il bottone
 */
function showErrors(formType, errors) {
  const errorContainer = document.getElementById(`${formType}Errors`);
  errorContainer.innerHTML = ""; // Pulisci

  errors.forEach((error) => {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "⚠️ " + error;
    errorContainer.appendChild(errorDiv);
  });
}

/**
 * Pulisci messaggio di errore
 */
function clearErrors(formType) {
  const errorContainer = document.getElementById(`${formType}Errors`);
  errorContainer.innerHTML = "";
}

/**
 * Aggiungi bordo rosso all'input
 */
function addInputError(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add("input-error");
  }
}

/**
 * Rimuovi bordo rosso dagli input
 */
function clearInputErrors(formType) {
  const form = formType === "login" ? loginForm : registerForm;
  const inputs = form.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("input-error");
  });
}

// ===== FUNZIONI PER INVIARE DATI AL BACKEND =====

/**
 * Registra un nuovo utente
 */
async function registerUser(email, password) {
  try {
    // NON fare fetch al backend ancora!
    // Salva temporaneamente i dati in sessionStorage
    const registrationData = {
      email: email,
      password: password,
      tipo: "studente",
      consentGDPR: true,
      consentGDPRDate: new Date().toISOString(),
    };

    // Salva in sessionStorage (dati temporanei per questa sessione)
    sessionStorage.setItem(
      "registrationData",
      JSON.stringify(registrationData)
    );

    // Pulisci il form
    registerForm.reset();

    // ===== REINDIRIZZA AL FORM DI COMPLETAMENTO PROFILO =====
    window.location.href = "/complete-profile";
  } catch (error) {
    console.error("Errore:", error);
    showErrors("register", ["Errore di connessione al server"]);
  }
}

/**
 * Accedi con email e password
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
      // Salva il token nel localStorage
      localStorage.setItem("token", data.token);
      // Reindirizza alla home
      window.location.href = "/home-studenti";
    } else {
      showErrors("login", [data.message || "Credenziali non valide"]);
    }
  } catch (error) {
    console.error("Errore:", error);
    showErrors("login", ["Errore di connessione al server"]);
  }
}

// ===== MODALE FORGOT PASSWORD =====
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeModalBtn = document.querySelector(".close");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

// Apri modale quando clicca "Ho dimenticato la password"
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = "flex";
});

// Chiudi modale quando clicca la X
closeModalBtn.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
});

// Chiudi modale quando clicca fuori dal contenuto
window.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) {
    forgotPasswordModal.style.display = "none";
  }
});

// ===== SUBMIT FORGOT PASSWORD FORM =====
forgotPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();

  // Pulisci errori precedenti
  document.getElementById("forgotErrors").innerHTML = "";
  document.getElementById("forgotSuccess").style.display = "none";

  // Valida email
  if (!isValidEmail(email)) {
    showErrorsForgotPass("forgot", ["Email non valida (es: user@example.com)"]);
    return;
  }

  // Invia richiesta al backend
  requestPasswordReset(email);
});

/**
 * Richiedi reset password al backend
 */
/*async function requestPasswordReset(email) {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const data = await response.json();

    if (response.ok) {
      // Mostra messaggio di successo
      document.getElementById("forgotSuccess").style.display = "block";
      forgotPasswordForm.reset();

      // Chiudi modale dopo 3 secondi
      setTimeout(() => {
        forgotPasswordModal.style.display = "none";
        document.getElementById("forgotSuccess").style.display = "none";
      }, 3000);
    } else {
      showErrorsForgotPass("forgot", [data.message || "Errore nella richiesta"]);
    }
  } catch (error) {
    console.error("Errore:", error);
    showErrorsForgotPass("forgot", ["Errore di connessione al server"]);
  }
}*/

// Aggiungi funzione showErrors per forgot
function showErrorsForgotPass(formType, errors) {
  if (formType === "forgot") {
    const errorContainer = document.getElementById("forgotErrors");
    errorContainer.innerHTML = "";
    errors.forEach((error) => {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = "⚠️ " + error;
      errorContainer.appendChild(errorDiv);
    });
  }
}
