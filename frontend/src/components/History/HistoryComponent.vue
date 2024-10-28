<script>
import { fetchCookingHistory, addCookingHistory } from "@/services/historyService";

export default {
  name: "CookingHistoryPage",
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
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
      return Array.isArray(this.history) ? this.history.filter((entry) =>
        entry.name.toLowerCase().includes(this.filter.toLowerCase())
      ) : [];
    },
  },
  created() {
    this.fetchHistory();
    this.generateCalendar();
  },
  methods: {
    async fetchHistory() {
      try {
        const response = await fetchCookingHistory(this.userId);
        console.log("Fetched history:", response);
        this.history = Array.isArray(response) ? response : [];
        this.generateCalendar();
      } catch (error) {
        console.error('Error fetching history:', error);
        this.history = [];
      }
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
    async saveNewHistory() {
      try {
        const newHistory = {
          recipeId: "exampleRecipeId",
          date: new Date(),
          calories: 300,
        };
        await addCookingHistory(this.userId, newHistory.recipeId, newHistory.date, newHistory.calories);
        this.fetchHistory();
      } catch (error) {
        console.error("Error saving new history:", error);
      }
    },
  },
};
</script>

<template>
  <div class="cooking-history">
    <h2>Your Cooking History</h2>
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

