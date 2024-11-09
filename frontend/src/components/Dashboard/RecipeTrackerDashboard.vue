<template>
  <div class="recipe-tracker-dashboard">
    <div class="recipe-tracker-dashboard__stats-row">
      <div class="recipe-tracker-dashboard__total-recipes">
        <div class="recipe-tracker-dashboard__total-recipes-number">{{ completedRecipes.length }}</div>
        <div class="recipe-tracker-dashboard__total-recipes-label">Total Recipes Cooked</div>
      </div>
      <div class="recipe-tracker-dashboard__most-cooked" v-if="topRecipes.length">
        <div class="recipe-tracker-dashboard__most-cooked-info">
          <h3 class="recipe-tracker-dashboard__most-cooked-title">Most Cooked Recipe</h3>
          <div class="recipe-tracker-dashboard__most-cooked-name">{{ topRecipes[0].label }}</div>
          <div class="recipe-tracker-dashboard__most-cooked-count">Cooked {{ topRecipes[0].count }} times</div>
        </div>
        <div class="recipe-tracker-dashboard__most-cooked-image">
          <!-- <img :src="topRecipes[0].image" alt="Recipe Image"> -->
        </div>
      </div>
    </div>
    <div v-if="dataLoaded" class="recipe-tracker-dashboard__chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js/auto'
import { db } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

Chart.register(...registerables);

export default {
  name: 'RecipeTrackerDashboard',
  data() {
    return {
      chart: null,
      completedRecipes: [],
      currentUserId: null,
      dataLoaded: false
    }
  },
  computed: {
    topRecipes() {
      const recipeCounts = this.completedRecipes.reduce((acc, recipe) => {
        acc[recipe.label] = (acc[recipe.label] || 0) + 1;
        return acc;
      }, {});

      const recipeArray = Object.entries(recipeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      return recipeArray.length ? [recipeArray[0]] : [];
    }
  },
  methods: {
    async initializeDashboard() {
      const auth = getAuth();
      this.currentUserId = auth.currentUser?.uid;
      if (this.currentUserId) {
        await this.loadCompletedRecipes();
      }
    },
    async loadCompletedRecipes() {
      try {
        const completedRecipesCollection = collection(db, `users/${this.currentUserId}/completedRecipes`);
        const snapshot = await getDocs(completedRecipesCollection);
        this.completedRecipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.dataLoaded = true;
        this.$nextTick(() => {
          this.createChart();
        });
      } catch (error) {
        console.error("Error loading completed recipes:", error);
        this.completedRecipes = [];
      }
    },
    processChartData() {
      const recipesByDate = {};
      
      this.completedRecipes.forEach(recipe => {
        if (recipe.completionDate) {
          const dateKey = recipe.completionDate;
          recipesByDate[dateKey] = (recipesByDate[dateKey] || 0) + 1;
        }
      });

      const sortedDates = Object.keys(recipesByDate).sort((a, b) => {
        const [aMonth, aDay, aYear] = a.split('/');
        const [bMonth, bDay, bYear] = b.split('/');
        return new Date(aYear, aMonth - 1, aDay) - new Date(bYear, bMonth - 1, bDay);
      });

      return {
        labels: sortedDates.length ? sortedDates : ['No data'],
        datasets: [{
          label: 'Recipes Cooked',
          data: sortedDates.length ? sortedDates.map(date => recipesByDate[date]) : [0],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#4CAF50'
        }]
      };
    },
    createChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const canvas = this.$refs.chartCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.processChartData(),
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }
  },
  mounted() {
    this.initializeDashboard();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>
