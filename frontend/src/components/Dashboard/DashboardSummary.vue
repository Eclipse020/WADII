<template>
  <div class="dashboard">
    <div v-if="summary.expiringSoon > 0" class="notification-bar">
      <i class="fas fa-exclamation-circle notification-icon"></i>
      <p class="notification-bar__message">
        Note: You have {{ summary.expiringSoon }} item<span v-if="summary.expiringSoon > 1">s</span> expiring soon!
        Please check the fridge inventory.
      </p>
    </div>
    <div v-else class="notification-bar">
      <i class="fas fa-check-circle notification-icon"></i>
      <p class="notification-bar__message">
        There are no items nearing expiration.
      </p>
    </div>
    <h1 class="dashboard__title">Dashboard</h1>
    <div class="dashboard__controls row text-center">
      <div class="col-6">
        <label for="chartSelector" class="dashboard__label">View Data:</label>
        <select id="chartSelector" class="dashboard__selector" v-model="selectedChart" @change="renderChart">
          <option value="items">Fridge Items</option>
          <option value="expiredItems">Items Insight</option>
          <option value="recipeTrackerDashboard">Recipe Insights</option>
        </select>
      </div>
      <div class="col-6" v-if="selectedChart === 'expiredItems'">
        <label for="monthSelector" class="dashboard__label">Select Month:</label>
        <select
          id="monthSelector"
          class="dashboard__selector"
          v-model="selectedMonth"
          @change="fetchSummaryData"
        >
          <option
            v-for="(month, index) in monthNames"
            :key="index"
            :value="index"
            :disabled="isMonthInFuture(index)"
          >
            {{ month }}
          </option>
        </select>
      </div>

      <!-- Default month display -->
      <div class="col-6" v-if="selectedChart === 'items'">
        <p class="dashboard__month-text">Current Month: {{ monthNames[new Date().getMonth()] }}</p>
      </div>
    </div>
    <div class="dashboard__chart-container">
      <!-- Fridge Items Chart -->
      <div v-if="selectedChart === 'items'" class="dashboard__chart">
        <canvas v-if="hasDataForMonthItem" ref="itemsChart"></canvas>
        <p v-else class="notification-bar__message">No data available for Fridge Items.</p>
      </div>
      
      <!-- Items Insight Chart -->
      <div v-if="selectedChart === 'expiredItems'" class="dashboard__chart">
        <canvas v-if="hasDataForMonthExpired" ref="expiredItemsChart"></canvas>
        <p v-else class="notification-bar__message">No data available for Items Insight.</p>
      </div>

      <!-- Recipe Tracker Dashboard -->
      <div v-if="selectedChart === 'recipeTrackerDashboard'" class="dashboard__chart recipe-tracker-section">
        <RecipeTrackerDashboard />
      </div>

      <!-- Message -->
      <p v-if="selectedChart === 'expiredItems'" class="mt-3 notification-bar__message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Chart, registerables } from "chart.js/auto";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import RecipeTrackerDashboard from './RecipeTrackerDashboard.vue';
import '../../styles/components/dashboard/dashboard.css';

Chart.register(...registerables);

export default {
  components: {
    RecipeTrackerDashboard
  },
  data() {
    return {
      currentUserId: null,
      chartInstance: null,
      summary: {
        totalItems: 0,
        expiringSoon: 0,
        categories: {},
        expiredItemsQuantity: 0,
        deletedItemsQuantity: 0
      },
      message: '',
      selectedChart: "items",
      selectedMonth: new Date().getMonth(),
      monthNames: [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ],
      hasDataForMonthItem: false,
      hasDataForMonthExpired: false,
      isRendering: false,
    };
  },
  methods: {
    debounce(func, delay) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
      };
    },
    
    isMonthInFuture(monthIndex) {
      const currentMonth = new Date().getMonth();
      return monthIndex > currentMonth;
    },

    async fetchSummaryData() {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), this.selectedMonth, 1);
      const endDate = new Date(today.getFullYear(), this.selectedMonth + 1, 0);

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }
        this.currentUserId = user.uid;

        const itemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/items`)
        );
        const items = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        this.summary.totalItems = items.reduce((total, item) => total + item.quantity, 0);
        this.hasDataForMonthItem = this.summary.totalItems > 0;

        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        this.summary.expiringSoon = items.filter((item) => {
          const expiryDate = new Date(item.expiryDate);
          return expiryDate > today && expiryDate <= threeDaysFromNow;
        }).reduce((total, item) => total + item.quantity, 0);

        const expiredItemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/expiredItemsWOUsing`)
        );
        const expiredItems = expiredItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        this.summary.expiredItemsCount = expiredItems.reduce((total, item) => {
          const expiryDate = new Date(item.expiryDate);
          if (expiryDate >= startDate && expiryDate <= endDate) {
            return total + (item.quantity || 0);  // Add the quantity, defaulting to 0 if undefined
          }
          return total;
        }, 0);  // Start with a total of 0

        const deletedItemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/deletedItems`)
        );
        const deletedItems = deletedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate the total quantity difference (originalQuantity - finalQuantity) for items used within the date range
        this.summary.deletedItemsQuantity = deletedItems.reduce((total, item) => {
          const deleteDate = new Date(item.usedAt);
          if (deleteDate >= startDate && deleteDate <= endDate) {
            const quantityDifference = (item.originalQuantity || 0) - (item.finalQuantity || 0);
            return total + quantityDifference;  // Add the quantity difference
          }
          return total;
        }, 0);  // Start with a total of 0

        this.hasDataForMonthExpired = this.summary.expiredItemsQuantity > 0 || this.summary.deletedItemsQuantity > 0;

        this.summary.categories = items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.quantity;
          return acc;
        }, {});

        if (this.hasDataForMonthItem || this.hasDataForMonthExpired) {
          this.renderChart();
        }
      } catch (error) {
        console.error("Error fetching summary data: ", error);
      }
    },

    renderChart() {
      if (this.selectedChart === 'recipeTrackerDashboard') return;
      
      this.message = "";
      if (this.isRendering) return;
      this.isRendering = true;

      if (
        (this.selectedChart === "items" && !this.hasDataForMonthItem) ||
        (this.selectedChart === "expiredItems" && !this.hasDataForMonthExpired)
      ) {
        this.isRendering = false;
        return;
      }

      let canvas = this.$refs[this.selectedChart === "items" ? "itemsChart" : "expiredItemsChart"];
      
      if (!canvas) {
        this.isRendering = false;
        return;
      }

      try {
        const ctx = canvas.getContext("2d");

        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth * devicePixelRatio;
        const height = canvas.clientHeight * devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
        };

        switch (this.selectedChart) {
          case "items": {
            const categories = Object.keys(this.summary.categories);
            const data = Object.values(this.summary.categories);

            this.chartInstance = new Chart(ctx, {
              type: "doughnut",
              data: {
                labels: categories,
                datasets: [
                  {
                    label: "Items by Category",
                    data: data,
                    backgroundColor: this.getChartColors(data.length),
                    borderWidth: 1,
                  },
                ],
              },
              options: chartOptions,
            });
            break;
          }

          case "expiredItems": {
            this.chartInstance = new Chart(ctx, {
              type: "doughnut",
              data: {
                labels: ["Expired Items", "Used Items"],
                datasets: [
                  {
                    label: "Quantity",
                    data: [this.summary.expiredItemsQuantity, this.summary.deletedItemsQuantity],
                    backgroundColor: this.getChartColors(2),
                  },
                ],
              },
              options: chartOptions,
            });
            this.updateMotivationalMessage();
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error("Error rendering chart:", error);
      } finally {
        this.isRendering = false;
      }
    },

    getChartColors(numColors) {
      const colors = [];
      const baseColor = [0, 51, 102];
      const colorStep = Math.floor(255 / numColors);

      for (let i = 0; i < numColors; i++) {
        const r = Math.max(0, baseColor[0] + i * colorStep);
        const g = Math.max(0, baseColor[1] + i * colorStep);
        const b = Math.max(0, baseColor[2] + i * colorStep);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
      }
      
      return colors;
    },

    updateMotivationalMessage() {
      if (this.summary.expiredItemsQuantity > this.summary.deletedItemsQuantity) {
        this.message = "Let's reduce waste! Remember to use items before they expire!";
      } else {
        this.message = "Great job! You're using items effectively!";
      }
    },
  },

  mounted() {
    this.fetchSummaryData();
  },

  computed: {
    isDisabled() {
      return this.selectedChart === 'items';
    },
  },

  watch: {
    selectedMonth() {
      this.fetchSummaryData();
    }
  },
};
</script>