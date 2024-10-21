<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
          <a class="navbar-brand" href="#">My Cooking App</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link class="nav-link" to="/">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/add-meal">Add Meal</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/history">Cooking History</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/community">Community</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="container mt-4">
      <router-view></router-view>
    </main>

    <footer class="text-center mt-5">
      <p>&copy; 2024 My Cooking App. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>