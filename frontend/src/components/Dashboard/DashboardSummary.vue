<template>
  <div class="dashboard">
    <div v-if="summary.expiringSoon > 0" class="notification-bar">
      <p class="notification-bar__message">
        Note: You have {{ summary.expiringSoon }} item<span v-if="summary.expiringSoon > 1">s</span> expiring soon!
        Please check the fridge inventory.
      </p>
    </div>
    <div v-else class="notification-bar">
      <p class="notification-bar__message">
        There are no items nearing expiration.
      </p>
    </div>
    <h2 class="dashboard__title">Your Fridge Dashboard</h2>
    <div class="dashboard__controls">
      <label for="chartSelector" class="dashboard__label">View Data:</label>
      <select id="chartSelector" class="dashboard__selector" v-model="selectedChart" @change="renderChart">
        <option value="items">Items by Category</option>
        <option value="usedItems">Used Items</option>
        <option value="expiredItems">Expired Items</option>
      </select>
    </div>
    <div class="dashboard__chart-container">
      <canvas v-if="selectedChart === 'items'" ref="itemsChart" class="dashboard__chart"></canvas>
      <canvas v-if="selectedChart === 'usedItems'" ref="usedItemsChart" class="dashboard__chart"></canvas>
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
    };
  },
  methods: {
    async fetchSummaryData() {
      const today = new Date();
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);

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

        // Count expired items
        this.summary.expiredItemsCount = expiredItems.length; // Store expired items count

        // Fetch used items from the deletedItems collection
        const deletedItemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/deletedItems`)
        );
        const deletedItems = deletedItemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Count used items
        this.summary.usedItems = deletedItems.length; // Count used items

        // Count categories from the main items collection
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
        case "usedItems":
          this.chartInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["Used Items", "Remaining Items"],
              datasets: [
                {
                  label: "Count",
                  data: [this.summary.usedItems, this.summary.totalItems],
                  backgroundColor: this.getChartColors(2),
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
          if (this.summary.expiredItemsCount > this.summary.usedItems) {
            this.message = "🌟 Tip: It looks like you have some items that went unused. Consider planning your meals to reduce waste and enjoy more delicious meals!";
          } else {
            this.message = "Awesome! You're doing a fantastic job using more items than you're wasting!";
          }
          break;
      }
    },
    getChartColors(count) {
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(
          `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`
        );
      }
      return colors;
    },
  },
  mounted() {
    this.fetchSummaryData();
  },
};
</script>

<style scoped>
.dashboard {
    padding: 2rem;
    max-width: 800px;
    margin: 1.5rem auto;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;
    height: 620px; 
}

.dashboard:hover {
  transform: translateY(-5px);
}

.notification-bar {
  background-color: #ffebcc;
  color: #d97a00;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.notification-bar__message {
  margin: 0;
  font-size: 1rem;
}

.dashboard__title {
  font-size: 2rem;
  color: #4a4a4a;
  text-align: center;
  font-weight: 600;
  margin-bottom: 2rem;
}

.dashboard__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.dashboard__label {
  font-size: 1.1rem;
  color: #777;
  margin-right: 0.75rem;
}

.dashboard__selector {
  width: 220px;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.dashboard__selector:focus,
.dashboard__selector:hover {
  background-color: #ffffff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.dashboard__chart-container {
  position: relative;
  height: 300px;
}

.dashboard__chart {
  width: 100%;
  height: 100%;
}
</style>
