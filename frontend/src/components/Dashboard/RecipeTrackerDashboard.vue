<template>
  <div class="recipe-tracker-dashboard">
    <div class="stats-row">
      <div class="total-recipes">
        <div class="number">{{ completedRecipes.length }}</div>
        <div class="label">Total Recipes Cooked</div>
      </div>
      <div class="most-cooked" v-if="topRecipes.length">
        <div class="recipe-info">
          <h3>Most Cooked Recipe</h3>
          <div class="recipe-name">{{ topRecipes[0].label }}</div>
          <div class="cook-count">Cooked {{ topRecipes[0].count }} times</div>
        </div>
        <div class="recipe-image">
          <!-- <img :src="topRecipes[0].image" alt="Recipe Image"> -->
        </div>
      </div>
    </div>
    <div v-if="dataLoaded" class="chart-wrapper">
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

<style scoped>
.recipe-tracker-dashboard {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.total-recipes {
  flex: 1;
  background: #4CAF50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.total-recipes .number {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 10px;
}

.total-recipes .label {
  font-size: 18px;
  opacity: 0.9;
}

.most-cooked {
  flex: 2;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.recipe-info {
  flex: 1;
}

.recipe-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.recipe-name {
  font-size: 24px;
  font-weight: 500;
  color: #2196F3;
  margin-bottom: 5px;
}

.cook-count {
  color: #666;
  font-size: 16px;
}

.recipe-image {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-wrapper {
  position: relative;
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 400px;
}

</style>
