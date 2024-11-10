<template>
    <div class="app-summary">
        <h1 class="app-summary__title">Inventory Summary</h1>
        <h3 class="app-summary__section-title app-summary__section-title--h3">Daily Summary</h3>
        <p>Total Items: {{ summary.totalItems }}</p>
        <p>Items Expiring Soon: {{ summary.expiringSoon }}</p>
        <h4 class="app-summary__section-title app-summary__section-title--h4">Category Breakdown:</h4>
        <ul class="app-summary__list">
            <li class="app-summary__list-item" v-for="(count, category) in summary.categories" :key="category">
                {{ category }}: {{ count }}
            </li>
        </ul>
        <h4 class="app-summary__section-title app-summary__section-title--h4">Newly Added Items:</h4>
        <ul class="app-summary__list">
            <li class="app-summary__list-item" v-for="item in summary.newlyAdded" :key="item.id">{{ item.name }}</li>
        </ul>
        <h4 class="app-summary__section-title app-summary__section-title--h4">Recently Used Items:</h4>
        <ul class="app-summary__list">
            <li class="app-summary__list-item" v-for="item in summary.deletedItems" :key="item.id">{{ item.name }} (Deleted on: {{ item.usedAt }})</li>
        </ul>
        <h4 class="app-summary__section-title app-summary__section-title--h4">Expired Items:</h4>
        <ul class="app-summary__list">
            <li class="app-summary__list-item" v-for="item in summary.expiredItems" :key="item.id">{{ item.name }} (Expired on: {{ item.expiryDate }})</li>
        </ul>
        <button style="width: 100%;" class="app-summary__button app-summary__button--secondary" @click="goToInventory">Back to Inventory</button>
    </div>
</template>


<script>
import { db, auth } from "../../services/firebase";
import { useRouter } from 'vue-router';
import { collection, getDocs } from "firebase/firestore";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/components/fridge/fridge.css';
import '../../styles/main.css';


export default {
    data() {
        return {
            currentUserId: null,
            summary: {
                totalItems: 0,
                expiringSoon: 0,
                categories: {},
                newlyAdded: [],
                deletedItems: [],
                expiredItems: [],
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
            this.router.push('/fridge');
        },


        async fetchSummaryData() {
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(today.getDate() - 3);


            try {
                // Fetch current user ID
                const user = auth.currentUser;
                if (user) {
                    this.currentUserId = user.uid;
                } else {
                    throw new Error('User not authenticated');
                }


                // Fetch items from Firestore
                const itemsSnapshot = await getDocs(collection(db, `users/${this.currentUserId}/items`));
                const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


                // Calculate summary
                this.summary.totalItems = items.length;


                this.summary.expiringSoon = items.filter(item => {
                    const expiryDate = new Date(item.expiryDate);
                    return (expiryDate > today && expiryDate <= new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)));
                }).length;


                this.summary.categories = items.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                }, {});


                // Filter newly added items within the last 3 days
                const newlyAddedItems = items.filter(item => {
                    const createdAt = new Date(item.createdDate);
                    return createdAt >= threeDaysAgo && createdAt <= today;
                }).map(item => ({
                    ...item,
                    createdDate: new Date(item.createdDate).toLocaleString()
                }));


                this.summary.newlyAdded = newlyAddedItems;


                // Fetch used items from Firestore
                const deletedItemsSnapshot = await getDocs(collection(db, `users/${this.currentUserId}/deletedItems`));
                const deletedItems = deletedItemsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        usedAt: new Date(data.usedAt).toLocaleString()  // Keep as Date object
                    };
                });

                // Filter items based on date range
                this.summary.deletedItems = deletedItems.filter(deletedItem => {
                    const deletedAt = new Date(deletedItem.usedAt);  // Already a Date object
                    return deletedAt >= threeDaysAgo && deletedAt <= today;
                });

                // Fetch expired items from Firestore
                const expiredItemsSnapshot = await getDocs(collection(db, `users/${this.currentUserId}/expiredItemsWOUsing`));
                const expiredItems = expiredItemsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        expiryDate: new Date(data.expiryDate).toLocaleString()
                    };
                });

                // Filter expired items based on the expiry date
                this.summary.expiredItems = expiredItems.filter(expiredItem => {
                    const expiryDate = new Date(expiredItem.expiryDate);
                    return expiryDate < today && expiryDate >= threeDaysAgo;
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
