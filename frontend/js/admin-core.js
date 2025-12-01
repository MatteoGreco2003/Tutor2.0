// ==========================================
// ADMIN PANEL - CORE/SHARED (RESPONSIVE)
// ==========================================

const token = localStorage.getItem("token");

// ===== DISABILITA BACK DOPO LOGOUT E CONTROLLA TOKEN =====
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

// ===== CARICAMENTO PAGINA =====
document.addEventListener("DOMContentLoaded", async function () {
  if (!token) {
    window.location.href = "/";
    return;
  }

  // ✅ VERIFICA ACCESSO PAGINA
  try {
    const response = await fetch("/auth/verify-home-admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Errore:", error);
  }

  // ===== SETUP HAMBURGER MENU =====
  setupHamburgerMenu();

  // ===== NAVIGAZIONE PAGINE =====
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const pages = document.querySelectorAll(".page");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      // ✅ RESET FILTRI
      resetAllFilters();

      sidebarItems.forEach((i) => i.classList.remove("active"));
      pages.forEach((p) => (p.style.display = "none"));

      item.classList.add("active");

      const pageName = item.getAttribute("data-page");
      const pageElement = document.getElementById(`page-${pageName}`);
      if (pageElement) {
        pageElement.style.display = "block";

        if (pageName === "studenti") {
          loadStudenti();
        } else if (pageName === "tutor") {
          loadTutor();
        } else if (pageName === "home") {
          loadStatistiche();
        }
      }

      // ✅ CHIUDI SIDEBAR SU MOBILE DOPO CLICK
      if (window.innerWidth <= 1024) {
        closeSidebarMobile();
      }
    });
  });

  // ===== LOGOUT =====
  document.querySelector(".logout-btn").addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Errore logout:", error);
    }
  });

  // ===== AZIONI RAPIDE =====
  document.querySelectorAll(".action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");

      if (action === "view-studenti") {
        sidebarItems[1].click();
      } else if (action === "view-tutor") {
        sidebarItems[2].click();
      }
    });
  });

  // ===== CHIUDI MODALI CLICCANDO FUORI =====
  window.addEventListener("click", (e) => {
    const viewStudenteModal = document.getElementById("viewStudenteModal");
    const deleteStudenteModal = document.getElementById("deleteStudenteModal");
    const viewTutorModal = document.getElementById("viewTutorModal");
    const deleteTutorModal = document.getElementById("deleteTutorModal");
    const createTutorModal = document.getElementById("createTutorModal");

    if (e.target === viewStudenteModal) {
      viewStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === deleteStudenteModal) {
      deleteStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === viewTutorModal) {
      viewTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === deleteTutorModal) {
      deleteTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === createTutorModal) {
      createTutorModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
  });

  // ===== EVENT LISTENERS PER CHIUDERSI =====
  document.getElementById("closeViewStudente").addEventListener("click", () => {
    document.getElementById("viewStudenteModal").classList.remove("show");
    document.body.classList.remove("modal-open");
  });

  document
    .getElementById("closeViewStudenteBtn")
    .addEventListener("click", () => {
      document.getElementById("viewStudenteModal").classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("closeDeleteStudente")
    .addEventListener("click", () => {
      document.getElementById("deleteStudenteModal").classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  document
    .getElementById("cancelDeleteStudente")
    .addEventListener("click", () => {
      document.getElementById("deleteStudenteModal").classList.remove("show");
      document.body.classList.remove("modal-open");
    });

  // ===== SETUP MODALI =====
  setupCreateTutorModal();

  // ===== CARICA HOME AL PRIMO CARICAMENTO =====
  loadStatistiche();
});

// ===== HAMBURGER MENU MOBILE =====
function setupHamburgerMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");

  // Crea overlay se non esiste
  if (!document.querySelector(".sidebar-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);

    // Click su overlay chiude sidebar
    overlay.addEventListener("click", closeSidebarMobile);
  }

  // Click su hamburger apre/chiude sidebar
  menuToggle.addEventListener("click", () => {
    toggleSidebarMobile();
  });

  // Chiudi sidebar quando risize della finestra
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");
      if (sidebar.classList.contains("active")) {
        closeSidebarMobile();
      }
    }
  });
}

function toggleSidebarMobile() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const menuToggle = document.querySelector(".menu-toggle");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
  menuToggle.classList.toggle("active");

  // Previene scroll del body quando sidebar è aperta
  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

function closeSidebarMobile() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const menuToggle = document.querySelector(".menu-toggle");

  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  menuToggle.classList.remove("active");
  document.body.style.overflow = "";
}

// ===== RESET FILTRI =====
function resetAllFilters() {
  const filterGrado = document.getElementById("filterGrado");
  const searchStudenti = document.getElementById("searchStudenti");
  if (filterGrado) filterGrado.value = "";
  if (searchStudenti) searchStudenti.value = "";

  const searchTutor = document.getElementById("searchTutor");
  if (searchTutor) searchTutor.value = "";
}
