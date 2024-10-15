<script setup>
</script>

<template>
    <nav>
        <router-link to="/"> Home </router-link>
        <router-link to="/register"> Register </router-link>
        <router-link to="/login"> Login </router-link>
        <router-link to="/recipe"> Recipe </router-link>
        <button @click="handleSignOut" v-if="isLoggedIn">Sign out</button>
    </nav>
    <router-view />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getAuth, onAuthStateChnaged, signOut } from "firebase/auth";

const isLoggedIn = ref(false);

let auth;
onMounted(() => {
    auth = getAuth();
    onAuthStateChnaged(auth, (user) => {
        if (user) {
            isLoggedIn.value = true;
        } else {
            isLoggedIn.value = false;
        }
    })
})

const handleSignOut = () => {
    signOut(auth).then(() => {
        router.push("/")
    });
};
</script>
