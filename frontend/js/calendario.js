/**
 * Calendario class
 * Manages calendar rendering, month navigation, and verification tracking
 */
class Calendario {
  constructor(tableId, prevBtnId, nextBtnId, monthDisplayId) {
    this.table = document.getElementById(tableId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    this.monthDisplay = document.getElementById(monthDisplayId);

    this.currentDate = new Date();
    this.verificheData = {}; // Map of verifications by day

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    this.prevBtn.addEventListener("click", () => this.prevMonth());
    this.nextBtn.addEventListener("click", () => this.nextMonth());
    this.render();
  }

  /**
   * Render the calendar table
   */
  render() {
    this.table.innerHTML = "";

    // Create header with days of week
    const headerRow = this.table.createTHead().insertRow();
    const days = ["L", "M", "M", "G", "V", "S", "D"];
    days.forEach((day) => {
      const th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });

    // Update month display
    this.updateMonthDisplay();

    // Create calendar body
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

    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    let date = 1;

    // Create calendar rows (6 weeks)
    for (let i = 0; i < 6; i++) {
      const row = tbody.insertRow();

      for (let j = 0; j < 7; j++) {
        const cell = row.insertCell();

        if (i === 0 && j < startingDayOfWeek) {
          // Empty cells before first day
          cell.classList.add("empty");
        } else if (date > daysInMonth) {
          // Empty cells after last day
          cell.classList.add("empty");
        } else {
          // Valid date cell
          cell.textContent = date;
          const cellDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            date
          );

          // Highlight today
          if (this.isToday(cellDate)) {
            cell.classList.add("today");
          }

          // Check if there's a verification on this day
          if (this.verificheData[date]) {
            cell.classList.add("has-event");
          }

          cell.addEventListener("click", () => this.onDateClick(date));
          date++;
        }
      }
    }

    // Call addBadgesToCalendar after render
    setTimeout(() => {
      if (window.addBadgesToCalendar) {
        window.addBadgesToCalendar();
      }
    }, 100);
  }

  /**
   * Update month and year display
   */
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

  /**
   * Navigate to previous month
   */
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  /**
   * Navigate to next month
   */
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  /**
   * Check if given date is today
   * @param {Date} date - Date to check
   * @returns {boolean} True if date is today
   */
  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Handle date click event
   * @param {number} day - Day of month
   */
  onDateClick(day) {
    // Placeholder for modal or additional functionality
  }

  /**
   * Add a verification to a specific day
   * @param {number} day - Day of month
   */
  addVerifica(day) {
    this.verificheData[day] = true;
    this.render();
  }

  /**
   * Remove a verification from a specific day
   * @param {number} day - Day of month
   */
  removeVerifica(day) {
    delete this.verificheData[day];
    this.render();
  }
}

// Initialize calendar when page loads
document.addEventListener("DOMContentLoaded", () => {
  new Calendario(
    "calendarTable",
    "prevMonthBtn",
    "nextMonthBtn",
    "currentMonth"
  );
});
