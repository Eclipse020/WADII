<template>
  <div class="cooking-history">
    <input v-model="filter" placeholder="Search by recipe name" class="search-bar" />

    <div class="slider">
      <div class="recipe-cards">
        <div 
          v-for="entry in filteredHistory" 
          :key="entry.id" 
          class="recipe-card" 
          @click="viewRecipe(entry)" 
        >
          <h3>{{ entry.name }}</h3>
          <p>Calories: {{ entry.calories }}</p>
          <button @click.stop="toggleFavorite(entry)">❤️</button>
          <button @click.stop="shareRecipe(entry)">Share</button>
        </div>
      </div>
    </div>

    <div class="calendar">
      <div class="calendar-header">
        <button @click="changeMonth(-1)" class="nav-button">&#9664;</button>
        <h3>{{ currentMonthName }} {{ currentYear }}</h3>
        <button @click="changeMonth(1)" class="nav-button">&#9654;</button>
      </div>
      <div class="weekdays">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>
      <div class="calendar-dates">
        <div 
          v-for="day in calendarDays" 
          :key="day.date" 
          :class="['day-circle', { filled: day.hasRecipe }]">
          <span>{{ day.day }}</span>
        </div>
      </div>
      <div class="year-selector">
        <button v-for="year in years" :key="year" @click="setYear(year)" class="year-button">{{ year }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CookingHistoryPage',
  data() {
    return {
      filter: '',
      history: [],
      calendarDays: [],
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      currentMonthName: new Date().toLocaleString('default', { month: 'long' }),
      years: this.generateYearRange(),
    };
  },
  computed: {
    filteredHistory() {
      return this.history.filter((entry) =>
        entry.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },
  },
  created() {
    this.fetchHistory();
    this.generateCalendar();
  },
  methods: {
    fetchHistory() {
      this.$axios.get('/api/cooking-history')
        .then((response) => {
          this.history = response.data;
        })
        .catch((error) => {
          console.error('Error fetching history:', error);
        });
    },
    generateCalendar() {
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      const startDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      
      this.calendarDays = Array.from({ length: startDay }).map(() => ({}));
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day);
        const hasRecipe = this.history.some(entry => new Date(entry.date).toDateString() === date.toDateString());
        this.calendarDays.push({ day, hasRecipe, date: date.toDateString() });
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
      this.currentMonthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
      this.generateCalendar();
    },
    generateYearRange() {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
    },
    setYear(year) {
      this.currentYear = year;
      this.generateCalendar();
    },
    viewRecipe(entry) {
      console.log("Viewing recipe:", entry);
    },
    toggleFavorite(entry) {
      console.log("Toggling favorite for:", entry);
      entry.isFavorite = !entry.isFavorite; 
    },
    shareRecipe(entry) {
      const message = `Check out what I cooked on ${entry.date}! It's ${entry.name}.`;
      console.log("Sharing recipe:", message);
    },
  },
};
</script>

<style scoped>
.cooking-history {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.slider {
  margin-bottom: 20px;
}

.recipe-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recipe-card {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #fff;
  transition: box-shadow 0.3s, transform 0.3s;
}

.recipe-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.nav-button {
  background-color: #76c7c0;
  border: none;
  color: white;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #68b2ab;
}

.calendar {
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  margin-bottom: 10px;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, transform 0.3s;
}

.day-circle.filled {
  background-color: #76c7c0;
  color: white;
}

.day-circle:hover {
  transform: scale(1.1);
}

.year-selector {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.year-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px 10px;
  margin: 2px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.year-button:hover {
  background-color: #76c7c0;
  color: white;
}
</style>
