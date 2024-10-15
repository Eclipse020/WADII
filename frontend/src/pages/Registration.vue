<template>
    <h1>Create an Account</h1>
    <p><input type="text" placeholder="Email" v-model="email"/></p>
    <p><input type="password" placeholder="Password" v-model="password"/></p>
    <p><button @click="register">Submit</button></p>
    <p><button @click="signInWithGoogle">Sign In With Google</button></p>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router"; //import router
const email = ref("");
const password = ref("");
const router = useRouter() // get a reference to our vue router

const register = () => {
    // need .value because ref()
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((data) => {
            console.log("Successfully registered!");

            console.log(auth.currentUser)

            router.push('/recipe') // redirect to the recipe
        })
        .catch((error) => {
            console.log(error.code);
            alert(error.message);
        });
        
    
};

const signInWithGoogle = () => {

}
</script>