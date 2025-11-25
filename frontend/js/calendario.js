class Calendario {
  constructor(tableId, prevBtnId, nextBtnId, monthDisplayId) {
    this.table = document.getElementById(tableId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    this.monthDisplay = document.getElementById(monthDisplayId);

    this.currentDate = new Date();
    this.verificheData = {}; // Mappa delle verifiche per giorno

    this.init();
  }

  init() {
    this.prevBtn.addEventListener("click", () => this.prevMonth());
    this.nextBtn.addEventListener("click", () => this.nextMonth());
    this.render();
  }

  // Render il calendario
  render() {
    this.table.innerHTML = "";

    // Header con giorni della settimana
    const headerRow = this.table.createTHead().insertRow();
    const days = ["L", "M", "M", "G", "V", "S", "D"];
    days.forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });

    // Aggiorna titolo mese
    this.updateMonthDisplay();

    // Body del calendario
    const tbody = this.table.createTBody();
    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0
    );
    const daysInMonth = lastDay.getDate();

    // Converti domenica (0) a 6, lunedì (1) a 0, ecc.
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    let date = 1;

    // Crea le righe del calendario
    for (let i = 0; i < 6; i++) {
      const row = tbody.insertRow();

      for (let j = 0; j < 7; j++) {
        const cell = row.insertCell();

        if (i === 0 && j < startingDayOfWeek) {
          cell.classList.add("empty");
        } else if (date > daysInMonth) {
          cell.classList.add("empty");
        } else {
          cell.textContent = date;
          const cellDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            date
          );

          // Evidenzia oggi
          if (this.isToday(cellDate)) {
            cell.classList.add("today");
          }

          // Controlla se c'è una verifica in questo giorno
          if (this.verificheData[date]) {
            cell.classList.add("has-event");
          }

          cell.addEventListener("click", () => this.onDateClick(date));
          date++;
        }
      }
    }

    // Richiama addBadgesToCalendar dopo il render
    setTimeout(() => {
      if (window.addBadgesToCalendar) {
        window.addBadgesToCalendar();
      }
    }, 100);
  }

  updateMonthDisplay() {
    const monthNames = [
      "GENNAIO",
      "FEBBRAIO",
      "MARZO",
      "APRILE",
      "MAGGIO",
      "GIUGNO",
      "LUGLIO",
      "AGOSTO",
      "SETTEMBRE",
      "OTTOBRE",
      "NOVEMBRE",
      "DICEMBRE",
    ];
    const month = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    this.monthDisplay.textContent = `${month} ${year}`;
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  onDateClick(day) {
    // Qui puoi aggiungere una modale per aggiungere verifiche
  }

  // Aggiungi una verifica a un giorno
  addVerifica(day) {
    this.verificheData[day] = true;
    this.render();
  }

  // Rimuovi una verifica
  removeVerifica(day) {
    delete this.verificheData[day];
    this.render();
  }
}

// Inizializza il calendario quando la pagina carica
document.addEventListener("DOMContentLoaded", () => {
  new Calendario(
    "calendarTable",
    "prevMonthBtn",
    "nextMonthBtn",
    "currentMonth"
  );
});
