// ==========================================
// RIEPILOGO PROFILO STUDENTE - TOPTUTOR 2.0
// ==========================================

// ===== DISABILITA BACK BUTTON =====
window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function () {
  window.history.pushState(null, null, window.location.href);
});

// ===== HAMBURGER MENU INITIALIZATION =====
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
    console.warn("Hamburger menu elements not found");
    return;
  }

  // Toggle sidebar
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hamburgerBtn.classList.toggle("active");
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  });

  // Close sidebar on overlay click
  sidebarOverlay.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  });

  // Close sidebar on link click
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", () => {
      hamburgerBtn.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  // Close sidebar on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hamburgerBtn.classList.remove("active");
      sidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  });
}

// Initialize immediately
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHamburgerMenu);
} else {
  initHamburgerMenu();
}

// ===== PAGE LOAD =====
document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  // Check token when page becomes visible
  window.addEventListener("pageshow", (event) => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  });

  // Load student data
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
      window._studentData = data.data;

      const headerTitle = document.querySelector(".header-title");
      headerTitle.textContent = `${data.data.nome} ${data.data.cognome}`;

      const userIcon = document.querySelector(".user-icon");
      userIcon.textContent = data.data.nome.charAt(0).toUpperCase();
    } else {
      console.error("Errore caricamento dati:", data.message);
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Errore caricamento studente:", error);
    window.location.href = "/";
  }

  // ===== LOGOUT BUTTON =====
  document.querySelector(".logout-btn").addEventListener("click", async () => {
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

  // ===== DELETE PROFILE MODAL =====
  const deleteProfileModal = document.getElementById("deleteProfileModal");

  document.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProfileModal.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  document
    .getElementById("closeDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelDeleteProfile")
    .addEventListener("click", () => {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  window.addEventListener("click", (event) => {
    if (event.target === deleteProfileModal) {
      deleteProfileModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  document
    .getElementById("confirmDeleteProfile")
    .addEventListener("click", async () => {
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
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Errore eliminazione profilo:", error);
      }
    });

  // ===== HELPER FUNCTIONS =====
  function showError(containerElement, fieldElement, message) {
    containerElement.innerHTML = `<span>⚠️ ${message}</span>`;
    containerElement.parentElement?.parentElement
      ?.querySelectorAll("input, select")
      .forEach((el) => el.classList.remove("input-error"));
    if (fieldElement) {
      fieldElement.classList.add("input-error");
    }
  }

  function clearErrors(formElement) {
    formElement
      .querySelectorAll(".error-messages")
      .forEach((el) => (el.innerHTML = ""));
    formElement
      .querySelectorAll("input, select")
      .forEach((el) => el.classList.remove("input-error"));
  }

  // ===== EDIT PERSONAL DATA MODAL =====
  const editPersonalModal = document.getElementById("editPersonalModal");
  const editPersonalForm = document.getElementById("editPersonalForm");
  const editErrors = document.getElementById("editPersonalErrors");
  const editNome = document.getElementById("editNome");
  const editCognome = document.getElementById("editCognome");
  const editTelefono = document.getElementById("editTelefono");
  const editGrado = document.getElementById("editGradoScolastico");
  const editIndirizzo = document.getElementById("editIndirizzoScolastico");

  function openEditPersonalModal() {
    const d = window._studentData;
    if (!d) return;

    clearErrors(editPersonalForm);

    editNome.value = d.nome || "";
    editCognome.value = d.cognome || "";
    editTelefono.value = d.telefono || "";
    editGrado.value = d.gradoScolastico || "";

    if (d.gradoScolastico === "Superiori") {
      editIndirizzo.disabled = false;
      editIndirizzo.value = d.indirizzoScolastico || "";
    } else {
      editIndirizzo.disabled = true;
      editIndirizzo.value = "";
    }

    editPersonalModal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  editGrado.addEventListener("change", () => {
    editIndirizzo.disabled = editGrado.value !== "Superiori";
    if (editIndirizzo.disabled) editIndirizzo.value = "";
  });

  document
    .getElementById("editPersonalBtn")
    .addEventListener("click", openEditPersonalModal);

  document.getElementById("closeEditPersonal").addEventListener("click", () => {
    editPersonalModal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("cancelEditPersonal")
    .addEventListener("click", () => {
      editPersonalModal.style.display = "none";
      document.body.classList.remove("modal-open");
    });

  window.addEventListener("click", (e) => {
    if (e.target === editPersonalModal) {
      editPersonalModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  editPersonalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(editPersonalForm);

    const nome = editNome.value.trim();
    const cognome = editCognome.value.trim();
    const telefono = editTelefono.value.trim();
    const gradoScolastico = editGrado.value;
    const indirizzoScolastico = editIndirizzo.disabled
      ? ""
      : editIndirizzo.value;

    if (nome.length < 2) {
      return showError(
        editErrors,
        editNome,
        "Nome deve contenere almeno 2 caratteri"
      );
    }
    if (cognome.length < 2) {
      return showError(
        editErrors,
        editCognome,
        "Cognome deve contenere almeno 2 caratteri"
      );
    }
    if (!/^[0-9]{10}$/.test(telefono)) {
      return showError(
        editErrors,
        editTelefono,
        "Telefono non valido (es: 3331234567)"
      );
    }
    if (!gradoScolastico) {
      return showError(editErrors, editGrado, "Seleziona il grado scolastico");
    }
    if (gradoScolastico === "Superiori" && !indirizzoScolastico) {
      return showError(
        editErrors,
        editIndirizzo,
        "Seleziona l'indirizzo scolastico"
      );
    }

    try {
      const response = await fetch("/student/personal", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          cognome,
          telefono,
          gradoScolastico,
          indirizzoScolastico,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        window._studentData = { ...window._studentData, ...data.data };
        populateProfileData(window._studentData);

        document.querySelector(
          ".header-title"
        ).textContent = `${data.data.nome} ${data.data.cognome}`;
        document.querySelector(".user-icon").textContent = data.data.nome
          .charAt(0)
          .toUpperCase();

        editPersonalModal.style.display = "none";
        document.body.classList.remove("modal-open");
      } else {
        showError(editErrors, null, data.message || "Errore nel salvataggio");
      }
    } catch (error) {
      console.error("Errore update dati personali:", error);
      showError(editErrors, null, "Errore di connessione al server");
    }
  });

  // ===== EDIT PASSWORD MODAL =====
  const editPasswordModal = document.getElementById("editPasswordModal");
  const editPasswordForm = document.getElementById("editPasswordForm");
  const oldPasswordInput = document.getElementById("oldPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
  const editPasswordErrors = document.getElementById("editPasswordErrors");

  function resetPasswordModal() {
    editPasswordForm.reset();
    clearErrors(editPasswordForm);

    oldPasswordInput.type = "password";
    newPasswordInput.type = "password";
    confirmNewPasswordInput.type = "password";

    document
      .querySelectorAll("#editPasswordModal .toggle-password")
      .forEach((icon) => {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-lock");
      });
  }

  document.getElementById("editPasswordBtn").addEventListener("click", () => {
    resetPasswordModal();
    editPasswordModal.style.display = "flex";
    document.body.classList.add("modal-open");
  });

  document.getElementById("closeEditPassword").addEventListener("click", () => {
    editPasswordModal.style.display = "none";
    document.body.classList.remove("modal-open");
    resetPasswordModal();
  });

  document
    .getElementById("cancelEditPassword")
    .addEventListener("click", () => {
      editPasswordModal.style.display = "none";
      document.body.classList.remove("modal-open");
      resetPasswordModal();
    });

  window.addEventListener("click", (e) => {
    if (e.target === editPasswordModal) {
      editPasswordModal.style.display = "none";
      document.body.classList.remove("modal-open");
      resetPasswordModal();
    }
  });

  function isValidPassword(pwd) {
    const hasMinLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  }

  editPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(editPasswordForm);

    const oldPwd = oldPasswordInput.value;
    const newPwd = newPasswordInput.value;
    const confirmPwd = confirmNewPasswordInput.value;

    if (!oldPwd) {
      return showError(
        editPasswordErrors,
        oldPasswordInput,
        "Inserisci la password attuale"
      );
    }
    if (!newPwd) {
      return showError(
        editPasswordErrors,
        newPasswordInput,
        "Inserisci una nuova password"
      );
    }
    if (!isValidPassword(newPwd)) {
      return showError(
        editPasswordErrors,
        newPasswordInput,
        "Password deve contenere minimo 8 caratteri, almeno una maiuscola, una minuscola e un numero"
      );
    }
    if (!confirmPwd) {
      return showError(
        editPasswordErrors,
        confirmNewPasswordInput,
        "Conferma la nuova password"
      );
    }
    if (newPwd !== confirmPwd) {
      return showError(
        editPasswordErrors,
        confirmNewPasswordInput,
        "Le nuove password non coincidono"
      );
    }

    try {
      const response = await fetch("/student/password", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPwd,
          newPassword: newPwd,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        editPasswordModal.style.display = "none";
        document.body.classList.remove("modal-open");
        resetPasswordModal();
      } else {
        showError(
          editPasswordErrors,
          oldPasswordInput,
          data.message || "Errore nel cambio password"
        );
      }
    } catch (error) {
      console.error("Errore cambio password:", error);
      showError(editPasswordErrors, null, "Errore di connessione al server");
    }
  });

  // ===== EDIT FAMILY MODAL =====
  const editFamilyModal = document.getElementById("editFamilyModal");
  const editFamilyForm = document.getElementById("editFamilyForm");
  const editFamilyErrors = document.getElementById("editFamilyErrors");
  const editGen1Nome = document.getElementById("editGen1Nome");
  const editGen1Cognome = document.getElementById("editGen1Cognome");
  const editGen1Telefono = document.getElementById("editGen1Telefono");
  const editGen2Nome = document.getElementById("editGen2Nome");
  const editGen2Cognome = document.getElementById("editGen2Cognome");
  const editGen2Telefono = document.getElementById("editGen2Telefono");
  const editEmailFamiglia = document.getElementById("editEmailFamiglia");

  function openEditFamilyModal() {
    const d = window._studentData;

    editGen1Nome.value = d?.genitore1?.nome || "";
    editGen1Cognome.value = d?.genitore1?.cognome || "";
    editGen1Telefono.value = d?.genitore1?.telefono || "";

    editGen2Nome.value = d?.genitore2?.nome || "";
    editGen2Cognome.value = d?.genitore2?.cognome || "";
    editGen2Telefono.value = d?.genitore2?.telefono || "";

    editEmailFamiglia.value = d?.emailFamiglia || "";

    clearFamilyInputErrors();
    editFamilyErrors.innerHTML = "";
    editFamilyModal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  function clearFamilyInputErrors() {
    document.querySelectorAll("#editFamilyForm input").forEach((input) => {
      input.classList.remove("input-error");
    });
  }

  document
    .getElementById("editFamilyBtn")
    .addEventListener("click", openEditFamilyModal);

  document.getElementById("closeEditFamily").addEventListener("click", () => {
    editFamilyModal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  document.getElementById("cancelEditFamily").addEventListener("click", () => {
    editFamilyModal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  window.addEventListener("click", (e) => {
    if (e.target === editFamilyModal) {
      editFamilyModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  editFamilyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFamilyInputErrors();
    editFamilyErrors.innerHTML = "";

    const gen1Nome = editGen1Nome.value.trim();
    const gen1Cognome = editGen1Cognome.value.trim();
    const gen1Telefono = editGen1Telefono.value.trim();
    const gen2Nome = editGen2Nome.value.trim();
    const gen2Cognome = editGen2Cognome.value.trim();
    const gen2Telefono = editGen2Telefono.value.trim();
    const emailFam = editEmailFamiglia.value.trim();

    let errorField = null;
    let errorMsg = "";

    if (gen1Nome.length < 2) {
      errorField = editGen1Nome;
      errorMsg = "Nome Genitore 1 deve contenere almeno 2 caratteri";
    } else if (gen1Cognome.length < 2) {
      errorField = editGen1Cognome;
      errorMsg = "Cognome Genitore 1 deve contenere almeno 2 caratteri";
    } else if (!/^[0-9]{10}$/.test(gen1Telefono.replace(/[^0-9]/g, ""))) {
      errorField = editGen1Telefono;
      errorMsg = "Telefono Genitore 1 non valido";
    } else if (gen2Nome || gen2Cognome || gen2Telefono) {
      if (gen2Nome && gen2Nome.length < 2) {
        errorField = editGen2Nome;
        errorMsg = "Nome Genitore 2 deve contenere almeno 2 caratteri";
      } else if (gen2Cognome && gen2Cognome.length < 2) {
        errorField = editGen2Cognome;
        errorMsg = "Cognome Genitore 2 deve contenere almeno 2 caratteri";
      } else if (
        gen2Telefono &&
        !/^[0-9]{10}$/.test(gen2Telefono.replace(/[^0-9]/g, ""))
      ) {
        errorField = editGen2Telefono;
        errorMsg = "Telefono Genitore 2 non valido";
      }
    }

    if (!errorMsg && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFam)) {
      errorField = editEmailFamiglia;
      errorMsg = "Email non valida";
    }

    if (errorMsg) {
      if (errorField) errorField.classList.add("input-error");
      editFamilyErrors.innerHTML = `<p style="margin:0;">⚠️ ${errorMsg}</p>`;
      return;
    }

    try {
      const response = await fetch("/student/family", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          genitore1Nome: gen1Nome,
          genitore1Cognome: gen1Cognome,
          genitore1Telefono: gen1Telefono,
          genitore2Nome: gen2Nome,
          genitore2Cognome: gen2Cognome,
          genitore2Telefono: gen2Telefono,
          emailFamiglia: emailFam,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        window._studentData = {
          ...window._studentData,
          genitore1: data.data.genitore1,
          genitore2: data.data.genitore2,
          emailFamiglia: data.data.emailFamiglia,
        };

        populateProfileData(window._studentData);
        editFamilyModal.style.display = "none";
        document.body.classList.remove("modal-open");
      } else {
        editFamilyErrors.innerHTML = `⚠️ ${
          data.message || "Errore nel salvataggio"
        }`;
      }
    } catch (error) {
      console.error("Errore update famiglia:", error);
      editFamilyErrors.innerHTML = "⚠️ Errore di connessione al server";
    }
  });

  // ===== EDIT SCHOOL MODAL =====
  const editSchoolModal = document.getElementById("editSchoolModal");
  const editSchoolForm = document.getElementById("editSchoolForm");
  const editSchoolErrors = document.getElementById("editSchoolErrors");
  const emailSchoolContainer = document.getElementById("emailSchoolContainer");
  const addSchoolEmailBtn = document.getElementById("addSchoolEmailBtn");

  let emailSchoolCount = 0;

  function openEditSchoolModal() {
    const emails = window._studentData.emailInsegnanti || [];

    emailSchoolContainer.innerHTML = "";
    emailSchoolCount = 0;
    editSchoolErrors.innerHTML = "";

    emails.forEach((email, index) => {
      emailSchoolCount++;
      addEmailField(email, emailSchoolCount);
    });

    updateAddSchoolBtnState();
    editSchoolModal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  function addEmailField(value = "", index) {
    const newEmailGroup = document.createElement("div");
    newEmailGroup.className = "email-school-group";
    newEmailGroup.id = `emailSchoolGroup${index}`;

    const isMobile = window.innerWidth <= 576;
    const removeText = isMobile ? "" : "Elimina";
    const removeIcon = isMobile ? '<i class="fas fa-trash"></i>' : "";

    newEmailGroup.innerHTML = `
      <div class="form-group">
        <input
          type="email"
          class="emailSchool"
          id="emailSchool${index}"
          placeholder="Email Professore ${index}"
          value="${value}"
        />
      </div>
      <button 
        type="button" 
        class="btn-remove-email" 
        data-index="${index}"
        title="Elimina"
      >
        ${removeIcon}${removeText}
      </button>
    `;

    emailSchoolContainer.appendChild(newEmailGroup);

    newEmailGroup
      .querySelector(".btn-remove-email")
      .addEventListener("click", () => {
        removeEmailField(newEmailGroup);
      });
  }

  function removeEmailField(group) {
    group.remove();
    renumberSchoolEmails();
    updateAddSchoolBtnState();
  }

  function renumberSchoolEmails() {
    const allGroups = document.querySelectorAll(".email-school-group");

    allGroups.forEach((group, index) => {
      const newIndex = index + 1;
      const input = group.querySelector(".emailSchool");

      input.id = `emailSchool${newIndex}`;
      input.placeholder = `Email Professore ${newIndex}`;
      group.id = `emailSchoolGroup${newIndex}`;
    });

    emailSchoolCount = allGroups.length;
  }

  function updateAddSchoolBtnState() {
    if (emailSchoolCount >= 5) {
      addSchoolEmailBtn.disabled = true;
      addSchoolEmailBtn.style.opacity = "0.5";
    } else {
      addSchoolEmailBtn.disabled = false;
      addSchoolEmailBtn.style.opacity = "1";
    }
  }

  addSchoolEmailBtn.addEventListener("click", () => {
    if (emailSchoolCount < 5) {
      emailSchoolCount++;
      addEmailField("", emailSchoolCount);
      updateAddSchoolBtnState();
    }
  });

  document
    .getElementById("editSchoolBtn")
    .addEventListener("click", openEditSchoolModal);

  window.addEventListener("resize", () => {
    if (emailSchoolCount > 0) {
      const emails = Array.from(document.querySelectorAll(".emailSchool")).map(
        (input) => input.value
      );
      emailSchoolContainer.innerHTML = "";
      emailSchoolCount = 0;
      emails.forEach((email, index) => {
        emailSchoolCount++;
        addEmailField(email, emailSchoolCount);
      });
      updateAddSchoolBtnState();
    }
  });

  document.getElementById("closeEditSchool").addEventListener("click", () => {
    editSchoolModal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  document.getElementById("cancelEditSchool").addEventListener("click", () => {
    editSchoolModal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  window.addEventListener("click", (e) => {
    if (e.target === editSchoolModal) {
      editSchoolModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  editSchoolForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    editSchoolErrors.innerHTML = "";

    const emailInputs = document.querySelectorAll(".emailSchool");
    const emails = [];
    const errors = [];

    emailInputs.forEach((input, index) => {
      const email = input.value.trim();

      if (email !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          errors.push(`Email Professore ${index + 1} non valida`);
        } else {
          emails.push(email);
        }
      }
    });

    if (errors.length > 0) {
      editSchoolErrors.innerHTML = errors.map((e) => `⚠️ ${e}`).join("<br>");
      return;
    }

    try {
      const response = await fetch("/student/school", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailInsegnanti: emails,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        window._studentData = {
          ...window._studentData,
          emailInsegnanti: data.data.emailInsegnanti,
        };

        populateProfileData(window._studentData);
        editSchoolModal.style.display = "none";
        document.body.classList.remove("modal-open");
      } else {
        editSchoolErrors.innerHTML = data.message || "Errore nel salvataggio";
      }
    } catch (error) {
      console.error("Errore update email insegnanti:", error);
      editSchoolErrors.innerHTML = "Errore di connessione al server";
    }
  });
});

// ===== POPULATE PROFILE DATA =====
function populateProfileData(studentData) {
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

  if (studentData) {
    document.getElementById("familyGen1Nome").textContent =
      `${studentData.genitore1?.nome || ""} ${
        studentData.genitore1?.cognome || ""
      }`.trim() || "-";
    document.getElementById("familyGen1Tel").textContent =
      studentData.genitore1?.telefono || "-";

    document.getElementById("familyGen2Nome").textContent =
      `${studentData.genitore2?.nome || ""} ${
        studentData.genitore2?.cognome || ""
      }`.trim() || "-";
    document.getElementById("familyGen2Tel").textContent =
      studentData.genitore2?.telefono || "-";

    document.getElementById("familyEmail").textContent =
      studentData.emailFamiglia || "-";
  }

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

// ===== PASSWORD TOGGLE =====
document.querySelectorAll(".toggle-password").forEach((icon) => {
  const inputId = icon.getAttribute("data-input");
  const input = document.getElementById(inputId);

  function updateIcon() {
    if (input.value.length > 0) {
      icon.classList.remove("fa-lock");
      icon.classList.add("fa-eye");
      icon.style.cursor = "pointer";
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-lock");
      input.type = "password";
      icon.style.cursor = "default";
    }
  }

  input.addEventListener("input", updateIcon);

  icon.addEventListener("click", () => {
    if (input.value.length > 0) {
      input.type = input.type === "password" ? "text" : "password";
    }
  });

  updateIcon();
});
