// ==========================================
// ADMIN PANEL - HOME/DASHBOARD
// ==========================================

// ===== CARICA STATISTICHE =====
async function loadStatistiche() {
  try {
    const [tutorRes, studentiRes] = await Promise.all([
      fetch("/admin/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/admin/student", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const tutorData = await tutorRes.json();
    const studentiData = await studentiRes.json();

    // ✅ FILTRA ADMIN DA CONTEGGIO TUTOR
    const tutorReali =
      tutorData.tutor?.filter((t) => t.email !== "toptutor.it@gmail.com") || [];

    // Conta tutor attivi (con almeno 1 studente)
    const activeTutor = tutorReali.filter(
      (t) => t.studentiAssociati?.length > 0
    ).length;

    document.getElementById("totalTutor").textContent = tutorReali.length;
    document.getElementById("totalStudenti").textContent =
      studentiData.count || 0;
    document.getElementById("activeTutorCount").textContent = activeTutor;

    // ✅ MOSTRA ULTIMI TUTOR E STUDENTI
    displayRecentItems(tutorData.tutor || [], studentiData.studenti || []);

    // ✅ MOSTRA GRAFICI
    displayCharts(tutorData.tutor || [], studentiData.studenti || []);
  } catch (error) {
    console.error("Errore caricamento statistiche:", error);
  }
}

// ===== MOSTRA ULTIMI TUTOR E STUDENTI =====
function displayRecentItems(allTutorList, allStudentiList) {
  // Filtra admin da tutor
  const tutorReali = allTutorList.filter(
    (t) => t.email !== "toptutor.it@gmail.com"
  );

  // Ultimi 2 tutor (ordinati per data decrescente)
  const recentTutor = tutorReali
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  // Ultimi 2 studenti (ordinati per data decrescente)
  const recentStudenti = allStudentiList
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 2);

  // Display tutor
  const tutorList = document.getElementById("recentTutorList");
  if (recentTutor.length === 0) {
    tutorList.innerHTML = '<p class="empty-state-small">Nessun tutor</p>';
  } else {
    tutorList.innerHTML = recentTutor
      .map(
        (tutor) => `
      <div class="recent-item">
        <div class="recent-item-name">${tutor.nome} ${tutor.cognome}</div>
        <div class="recent-item-email">${tutor.email}</div>
        <div class="recent-item-date">${new Date(
          tutor.createdAt
        ).toLocaleDateString("it-IT")}</div>
      </div>
    `
      )
      .join("");
  }

  // Display studenti
  const studentiList = document.getElementById("recentStudentiList");
  if (recentStudenti.length === 0) {
    studentiList.innerHTML =
      '<p class="empty-state-small">Nessuno studente</p>';
  } else {
    studentiList.innerHTML = recentStudenti
      .map(
        (studente) => `
      <div class="recent-item">
        <div class="recent-item-name">${studente.nome} ${studente.cognome}</div>
        <div class="recent-item-email">${studente.email}</div>
        <div class="recent-item-date">${new Date(
          studente.createdAt
        ).toLocaleDateString("it-IT")}</div>
      </div>
    `
      )
      .join("");
  }
}

// ==========================================
// GRAFICI (versione definitiva e semplificata)
// ==========================================
let gradoChart = null;

function displayCharts(allTutorList, allStudentiList) {
  // ===== CHART 1: Studenti per Grado =====
  const gradoCount = {};
  allStudentiList.forEach((studente) => {
    const grado = studente.gradoScolastico || "Non specificato";
    gradoCount[grado] = (gradoCount[grado] || 0) + 1;
  });

  const gradoCtx = document.getElementById("gradoChart")?.getContext("2d");
  if (gradoCtx) {
    // Distrugge il grafico precedente se esiste
    if (gradoChart) gradoChart.destroy();

    gradoChart = new Chart(gradoCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(gradoCount),
        datasets: [
          {
            data: Object.values(gradoCount),
            backgroundColor: [
              "#9e3ffd",
              "#116dff",
              "#10b981",
              "#f59e0b",
              "#ef4444",
              "#06b6d4",
            ],
            borderColor: "var(--white)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // <-- IMPORTANTE: Permette al CSS di gestire le dimensioni
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 12, // Dimensione base, il CSS la gestirà
              },
              padding: 15,
              usePointStyle: true,
            },
          },
        },
      },
    });
  }

  // ===== RIDISEGNA CHART QUANDO RESIZE DELLA FINESTRA =====
  // Usa una variabile per evitare di aggiungere l'evento più volte
  if (!window.chartResizeListenerAdded) {
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (gradoChart) {
          gradoChart.resize();
        }
      }, 150); // Debounce per performance
    });
    window.chartResizeListenerAdded = true;
  }
}
