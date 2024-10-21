<template>
    <div id="app">
        <h1>Inventory Summary</h1>
        <h3>Daily Summary</h3>
        <p>Total Items: {{ summary.totalItems }}</p>
        <p>Items Expiring Soon: {{ summary.expiringSoon }}</p>
        <h4>Category Breakdown:</h4>
        <ul>
            <li v-for="(count, category) in summary.categories" :key="category">
                {{ category }}: {{ count }}
            </li>
        </ul>
        <h4>Newly Added Items:</h4>
        <ul>
            <li v-for="item in summary.newlyAdded" :key="item.id">{{ item.name }}</li>
        </ul>
        <h4>Recently Deleted Items:</h4>
        <ul>
            <li v-for="item in summary.deletedItems" :key="item.id">{{ item.name }} (Deleted on: {{ item.deletedAt }})</li>
        </ul>
        <button class="btn btn-secondary" @click="goToInventory">Back to Inventory</button>
    </div>
</template>

<script>
import { db } from '../services/firebase';
import { useRouter } from 'vue-router';
import { collection, getDocs } from "firebase/firestore";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import 'bootstrap/dist/css/bootstrap.min.css';

export default {
    data() {
        return {
            summary: {
                totalItems: 0,
                expiringSoon: 0,
                categories: {},
                newlyAdded: [],
                deletedItems: []
            },
        };
    },

    setup() {
        const router = useRouter();
        return {
            router
        };
    },

    methods: {
        goToInventory() {
            this.router.push({ name: 'Fridge' }); 
        },

        async fetchSummaryData() {
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(today.getDate() - 3);

            try {
                const itemsSnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
                const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                this.summary.totalItems = items.length;

                this.summary.expiringSoon = items.filter(item => {
                    const expiryDate = new Date(item.expiryDate);
                    return (expiryDate > today && expiryDate <= new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)));
                }).length;

                this.summary.categories = items.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                }, {});

                const newlyAddedItems = items.filter(item => {
                    const createdAt = new Date(item.createdDate);
                    return createdAt >= threeDaysAgo && createdAt <= today;
                }).map(item => ({
                    ...item,
                    createdDate: new Date(item.createdDate).toLocaleString() 
                }));

                this.summary.newlyAdded = newlyAddedItems;

                const deletedItemsSnapshot = await getDocs(collection(db, `users/${this.currentUserId}/deletedItems`));
                const deletedItems = deletedItemsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        deletedAt: new Date(data.deletedAt).toLocaleString()
                    };
                });

                this.summary.deletedItems = deletedItems.filter(deletedItem => {
                    const deletedAt = new Date(deletedItem.deletedAt);
                    return deletedAt >= threeDaysAgo && deletedAt <= today;
                });

            } catch (error) {
                console.error("Error fetching summary data: ", error);
            }
        },

    },
    mounted() {
        this.fetchSummaryData();
    }
};
</script>