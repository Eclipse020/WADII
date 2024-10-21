<template>
  <div class="calendar-page">
    <h1>Calendar</h1>
    <div class="calendar">
      <h2>{{ months[currentMonth] }} {{ currentYear }}</h2>
      <div class="calendar-controls">
        <button @click="changeMonth(-1)">Previous</button>
        <button @click="changeMonth(1)">Next</button>
      </div>

      <div class="calendar-header">
        <div class="day-name">Sun</div>
        <div class="day-name">Mon</div>
        <div class="day-name">Tue</div>
        <div class="day-name">Wed</div>
        <div class="day-name">Thu</div>
        <div class="day-name">Fri</div>
        <div class="day-name">Sat</div>
      </div>

      <div class="calendar-dates">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="['day-circle', { filled: day.hasRecipe, planned: day.isPlanned }]"
        >
          <span v-if="day.day !== null">{{ day.day }}</span>
        </div>
        <div v-for="(empty, index) in emptyDays" :key="'empty-' + index" class="day-circle empty-day"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      calendarDays: [],
      history: [],
      plannedDays: [],
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    };
  },
  computed: {
    emptyDays() {
      const startDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      return Array.from({ length: startDay }).map(() => ({ day: null }));
    },
  },
  methods: {
    fetchHistory() {
      this.$axios.get('/api/cooking-history')
        .then((response) => {
          this.history = response.data;
          this.generateCalendar();
        })
        .catch((error) => {
          console.error('Error fetching history:', error);
        });
    },
    generateCalendar() {
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      this.calendarDays = []; // Reset the calendar days

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day);
        const hasRecipe = this.history.some(entry => new Date(entry.date).toDateString() === date.toDateString());
        const isPlanned = this.plannedDays.some(plannedDate => plannedDate === date.toDateString());
        this.calendarDays.push({ day, hasRecipe, isPlanned });
      }
    },
    changeMonth(direction) {
      this.currentMonth += direction;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.generateCalendar();
    }
  },
  created() {
    this.fetchHistory();
  }
};
</script>

<style scoped>
.calendar-page {
  padding: 20px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px; /* Adds spacing between controls and the calendar */
}

.calendar {
  max-width: 600px;
  margin: auto;
  text-align: center;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 5px;
  gap: 0; /* Remove any gap between the day names for better alignment */
}

.day-name {
  font-weight: bold;
  padding: 5px 0; /* Ensure day names have a consistent height */
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px; /* Controls the spacing between date circles */
}

.day-circle {
  width: 100%;
  aspect-ratio: 1; /* Keeps the circles proportional */
  border-radius: 50%;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto; /* Center the circle within its cell */
  box-sizing: border-box; /* Ensures borders don’t affect the size */
}

.day-circle.filled {
  background-color: #a1d6a1; /* Light green for days with recipes */
}

.day-circle.planned {
  background-color: #f9e99c; /* Light yellow for planned days */
}

.day-circle.empty-day {
  visibility: hidden; /* Hide empty day circles while maintaining their space */
}
</style>

