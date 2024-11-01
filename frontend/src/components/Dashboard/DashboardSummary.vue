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
    <div class="dashboard__controls row">
      <div class="col-6">
        <label for="chartSelector" class="dashboard__label">View Data:</label>
        <select id="chartSelector" class="dashboard__selector" v-model="selectedChart" @change="renderChart">
          <option value="items">Fridge Items</option>
          <option value="expiredItems">Items Insight</option>
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

      <!-- Message -->
      <p class="mt-3 notification-bar__message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { db, auth } from "../../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Chart, registerables } from "chart.js/auto";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        if (!user) {
          throw new Error("User not authenticated");
        }
        this.currentUserId = user.uid;

        // Fetch all items from the main items collection
        const itemsSnapshot = await getDocs(
          collection(db, `users/${this.currentUserId}/items`)
        );
        const items = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        this.summary.totalItems = items.length;
        this.hasDataForMonthItem = this.summary.totalItems > 0;

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

        // Determine if there is data for expired items
        this.hasDataForMonthExpired = this.summary.expiredItemsCount > 0 || this.summary.usedItems > 0;

        // Count categories from the filtered items
        this.summary.categories = items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {});

        // Render chart or perform other UI updates
        if (this.hasDataForMonthItem || this.hasDataForMonthExpired) {
          this.renderChart(); // Call renderChart after all data is fetched
        }
      } catch (error) {
        console.error("Error fetching summary data: ", error);
      }
    },

    renderChart() {
      this.message = "";
      if (this.isRendering) return;
      this.isRendering = true;

      // Check for data availability before rendering
      if (
        (this.selectedChart === "items" && !this.hasDataForMonthItem) ||
        (this.selectedChart === "expiredItems" && !this.hasDataForMonthExpired)
      ) {
        console.warn("No data available for the selected chart:", this.selectedChart);
        this.isRendering = false;
        return;
      }

      // Retrieve the appropriate canvas based on the selected chart type
      let canvas = this.$refs[this.selectedChart === "items" ? "itemsChart" : "expiredItemsChart"];
      
      // Check if the canvas is available
      if (!canvas) {
        console.warn("Canvas not available for selected chart:", this.selectedChart);
        this.isRendering = false;
        return;
      }

      try {
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on device pixel ratio
        const devicePixelRatio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth * devicePixelRatio;
        const height = canvas.clientHeight * devicePixelRatio;
        canvas.width = width;
        canvas.height = height;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        // Destroy the previous chart instance if it exists
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }

        // Prepare the data and options for the chart
        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
        };

        // Render the chart based on the selected type
        switch (this.selectedChart) {
          case "items": {
            const categories = Object.keys(this.summary.categories);
            const data = Object.values(this.summary.categories);

            // Create a new Chart instance for items
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
            // Create a new Chart instance for expired items
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
            // Update motivational message based on the ratio of used to expired items
            this.updateMotivationalMessage();
            break;
          }

          default:
            console.warn("Unknown chart type:", this.selectedChart);
            break;
        }
      } catch (error) {
        console.error("Error rendering chart:", error);
      } finally {
        this.isRendering = false; // Allow new selections after rendering
      }
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
  },

  watch: {
    selectedMonth() {
      this.fetchSummaryData();
    }
  },

};
</script>

<style scoped>
.dashboard {
  height: 700px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dashboard__month-text {
  margin-top: 5px;
  font-size: 15px;
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
  height: 400px; 
}

.dashboard__chart {
  width: 100%;
  height: 100%;
}
</style>
