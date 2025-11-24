// ==========================================
// ADMIN PANEL - CORE/SHARED
// ==========================================

const token = localStorage.getItem("token");

// ===== DISABILITA BACK DOPO LOGOUT E CONTROLLA TOKEN =====
window.addEventListener("pageshow", (event) => {
  if (!token) {
    window.location.href = "/";
    return;
  }
});

window.history.pushState(null, null, window.location.href);
window.addEventListener("popstate", function (event) {
  window.history.pushState(null, null, window.location.href);
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    info: "fa-info-circle",
  };

  toast.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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

    if (e.target === viewStudenteModal) {
      viewStudenteModal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }
    if (e.target === deleteStudenteModal) {
      deleteStudenteModal.classList.remove("show");
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

// ===== RESET FILTRI =====
function resetAllFilters() {
  // Reset filtri studenti
  const filterGrado = document.getElementById("filterGrado");
  const searchStudenti = document.getElementById("searchStudenti");
  if (filterGrado) filterGrado.value = "";
  if (searchStudenti) searchStudenti.value = "";

  // Reset ricerca tutor
  const searchTutor = document.getElementById("searchTutor");
  if (searchTutor) searchTutor.value = "";
}
