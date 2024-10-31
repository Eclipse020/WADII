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
    <h2 class="dashboard__title">Your Fridge Dashboard</h2>
    <div class="dashboard__controls">
      <label for="chartSelector" class="dashboard__label">View Data:</label>
      <select id="chartSelector" class="dashboard__selector" v-model="selectedChart" @change="renderChart">
        <option value="items">Fridge Items</option>
        <option value="expiredItems">Items Insight</option>
      </select>
      <label for="monthSelector" class="dashboard__label">Select Month:</label>
      <select :disabled= "selectedChart === 'items'"
        id="monthSelector" 
        class="dashboard__selector" 
        v-model="selectedMonth" 
        @change="fetchSummaryData"
      >
        <option v-for="(month, index) in monthNames" :key="index" :value="index" :disabled="isMonthInFuture(index)">{{ month }}</option>
      </select>
    </div>
    <div class="dashboard__chart-container">
      <canvas v-if="selectedChart === 'items'" ref="itemsChart" class="dashboard__chart"></canvas>
      <canvas v-if="selectedChart === 'expiredItems'" ref="expiredItemsChart" class="dashboard__chart"></canvas>
      <br><p class="mt-2 notification-bar__message">{{message}}</p>
    </div>
  </div>
</template>

<script>
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Chart, registerables } from "chart.js/auto";

Chart.register(...registerables);

export default {
  data() {
    return {
      currentUserId: null,
      chartInstance: null,
      summary: {
        totalItems: 0,
        expiringSoon: 0,
        categories: {},
        usedItems: 0,
        expiredItemsCount: 0,
      },
      message: '',
      selectedChart: "items",
      selectedMonth: new Date().getMonth(), // Default to current month
      monthNames: [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ],
      hasDataForMonth: false,
    };
  },
  methods: {
    isMonthInFuture(monthIndex) {
      const currentMonth = new Date().getMonth(); // Get the current month (0-11)
      // Compare the index with the current month to see if it's in the future
      return monthIndex > currentMonth;
    },

    async fetchSummaryData() {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), this.selectedMonth, 1);
      const endDate = new Date(today.getFullYear(), this.selectedMonth + 1, 0); // Last day of selected month

      try {
        const user = auth.currentUser;
        if (user) {
          this.currentUserId = user.uid;
        } else {
          throw new Error("User not authenticated");
        }

        // Fetch all items from the main items collection
        const itemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/items`)
        );
        const items = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        this.summary.totalItems = items.length;

        // Count items expiring soon (within the next 3 days)
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);
        this.summary.expiringSoon = items.filter((item) => {
          const expiryDate = new Date(item.expiryDate);
          return expiryDate > today && expiryDate <= threeDaysFromNow;
        }).length;

        // Fetch expired items from the expiredItemsWOUsing collection
        const expiredItemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/expiredItemsWOUsing`)
        );
        const expiredItems = expiredItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Count expired items based on selected month
        this.summary.expiredItemsCount = expiredItems.filter(item => {
          const expiryDate = new Date(item.expiryDate);
          return expiryDate >= startDate && expiryDate <= endDate;
        }).length;

        // Fetch used items from the deletedItems collection
        const deletedItemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/deletedItems`)
        );
        const deletedItems = deletedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Count used items based on selected month
        this.summary.usedItems = deletedItems.filter(item => {
          const deleteDate = new Date(item.deletedAt);
          return deleteDate >= startDate && deleteDate <= endDate;
        }).length;

        // Count categories from the filtered items
        this.summary.categories = items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});

        // Render chart or perform other UI updates
        this.renderChart();
      } catch (error) {
        console.error("Error fetching summary data: ", error);
      }
    },

    renderChart() {
      let canvas;
      switch (this.selectedChart) {
        case "items":
          canvas = this.$refs.itemsChart;
          break;
        case "usedItems":
          canvas = this.$refs.usedItemsChart;
          break;
        case "expiredItems":
          canvas = this.$refs.expiredItemsChart;
          break;
        default:
          console.warn("Unknown chart type:", this.selectedChart);
          return;
      }

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

      const categories = Object.keys(this.summary.categories);
      const data = Object.values(this.summary.categories);
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
      };

      switch (this.selectedChart) {
        case "items":
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
        case "expiredItems":
          this.chartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["Expired Items", "Used Items"],
              datasets: [
                {
                  label: "Count",
                  data: [this.summary.expiredItemsCount, this.summary.usedItems],
                  backgroundColor: this.getChartColors(2),
                },
              ],
            },
            options: chartOptions,
          });
          break;
        default:
          console.warn("Unknown chart type:", this.selectedChart);
          break;
      }

      // Update motivational message based on the ratio of used to expired items
      this.updateMotivationalMessage();
    },

    getChartColors(numColors) {
      const colors = [];
      const baseColor = [0, 51, 102]; // A darker base color
      const colorStep = Math.floor(255 / numColors); // Adjust step based on number of colors

      for (let i = 0; i < numColors; i++) {
        const r = Math.max(0, baseColor[0] + i * colorStep);
        const g = Math.max(0, baseColor[1] + i * colorStep);
        const b = Math.max(0, baseColor[2] + i * colorStep);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`); // Set opacity to 0.8 for a slightly transparent effect
      }
      
      return colors;
    },

    updateMotivationalMessage() {
      if (this.summary.expiredItemsCount > this.summary.usedItems) {
        this.message = "Let's reduce waste! Remember to use items before they expire!";
      } else {
        this.message = "Great job! You're using items effectively!";
      }
    },
  },

  mounted() {
    this.fetchSummaryData(); // Fetch summary data when the component mounts
  },

  computed: {
    isDisabled() {
      return this.selectedChart === 'items'; // Disable if selectedChart is 'items'
    },
  }
};
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.notification-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #e9f7f9;
}

.notification-bar__message {
  margin-left: 10px;
  margin-top: 13px;
  font-size: 16px;
}

.notification-icon {
  font-size: 20px;
  color: #007bff;
}

.dashboard__title {
  font-size: 24px;
  margin-bottom: 20px;
}

.dashboard__controls {
  display: block;
  margin-bottom: 20px;
}

.dashboard__label {
  font-weight: bold;
}

.dashboard__selector {
  padding: 5px 10px;
  margin-left: 10px;
  margin-right: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: border-color 0.3s;
}

.dashboard__selector:hover {
  border-color: #007bff;
}

.dashboard__chart-container {
  position: relative;
  width: 100%;
  height: 400px; /* Fixed height for charts */
}

.dashboard__chart {
  width: 100%;
  height: 100%;
}
</style>
