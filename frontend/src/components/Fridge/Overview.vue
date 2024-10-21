<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Fridge</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet"> 
    
    <!-- Vue 3 -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js"></script> 

    <!-- Style -->
    <link rel="stylesheet" href="styles.css">

    <!-- Script -->
    <script type="module" src="script.js"></script>
    
</head>
<body>
    
    <div id="app" class="container-fluid">

        <!-- Sidebar Filter: start -->
        <ul :class="['nav', { 'active': showFilterBar }]"> 
            <li id="xList">
                <button v-on:click="showFilterBar = !showFilterBar" class="btn btn-outline-dark" id="xRight">X</button>
            </li>
            <li class="nav-item"> 
                <button v-on:click="showFilter = true; handleFilterButton()" class="btn filterButton btn-outline-dark">Filter</button>
             </li>
            <li class="nav-item"> 
                <label for="searchName">Name:</label>
                <input id="searchName" v-model="searchName" type="text" placeholder="Search...">
            </li> 
            <li class="nav-item"> 
                <label for="searchCategory">Category:</label>
                <select id="searchCategory" v-model="searchCategory">
                    <option disabled value="" selected>Please Select</option>
                    <option v-for="category in categories" :value="category">{{category}}</option>
                </select>
            </li> 
            <li class="nav-item"> 
                <label for="searchQuantity">Quantity:</label>
                <input id="searchQuantity" v-model="searchQuantity" type="number" placeholder="1" min="1">
            </li> 
            <li class="nav-item"> 
                <label for="searchDate">Expiry Date (from):</label>
                <input id="searchDate" v-model="searchDate" type="date">
            </li> 
            <li class="nav-item"> 
                <button v-on:click="resetFilters" class="btn filterButton btn-outline-dark">Reset Filter</button>
            </li>
        </ul>
        <!-- Sidebar Filter: end -->

         <div class="content">
            <header class="header-container">
                <h4>My Fridge</h4>

                <!--Sorting: Start-->
                <label>
                    <input type="checkbox" value="name" v-model="sortOptions"> Sort by Name
                </label>
                <label>
                    <input type="checkbox" value="quantity" v-model="sortOptions"> Sort by Quantity
                </label>
                <label>
                    <input type="checkbox" value="expiryDate" v-model="sortOptions"> Sort by Expiry Date
                </label>
                <button class="btn btn-primary" v-on:click="sortItems">Sort</button>

                <!--Sorting: End-->

                <button id="hamburger" v-on:click="toggleFilterBar" class="btn hamburger-button">&#9776;</button> 

            </header>
            
            <br>

            <!--Filter Result: Start-->
            <div>
                <div class="row">
                    <div v-for="item in (showFilter ? filteredItems : items)" :key="item.id" 
                         :class="['card mb-4 mx-4 filterCard', { 'expiring-soon': item.isExpiringSoon }]">
                        <div class="card-body">
                            <h5 class="card-title">{{ item.name }}</h5>
                            <p class="card-text">Category: {{ item.category }}</p>
                            <p class="card-text">Quantity: {{ item.quantity }}</p>
                            <p class="card-text">Expiry Date: {{ item.expiryDate }}</p>
                        </div>
                    </div>
                </div>                
            </div>                
            <!--Filter Result: End-->

            <!--Add Product + the Card-->
            <button v-if="!openAddCard" v-on:click="openAddCard = !openAddCard" class="btn btn-primary addButton">Add Product</button>

            <div v-else class="card addCard" style="width: 30rem;">
                <div class="card-body">
                    <div class="cardTitle">
                        <h5 class="card-title">Ingredient &#129365&#127815&#127838&#129367</h5>
                        <button v-on:click="closeAddCard" class="btn btn-light" class="btnClose">X</button>
                    </div>
                    <hr>
                    <p v-if="validationError" class="errorMessage">{{validationError}}</p>

                    <form @submit.prevent="addItem">
                        <div class="mb-3">
                            <label class="form-label" for="itemName">Name</label>
                            <input v-model="itemName" class="form-control" type="text" id="itemName" placeholder="Insert Name" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="category">Category</label>
                            <select v-model="itemCategory" class="form-select" id="category" required>
                                <option disabled value="" selected>Please Select</option>
                                <option v-for="category in categories" :value="category">{{category}}</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="quantity">Quantity</label>
                            <input v-model="itemQuantity" class="form-control" type="number" id="quantity" min="1" placeholder="1" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label" for="expiryDate">Expiry Date</label>
                            <input v-model="itemExpiryDate" class="form-control" type="date" id="expiryDate" required>
                        </div>

                        <button type="submit" class="btn btn-primary" id="btnAdd">Add!</button>

                    </form>
                </div>
            </div>
            <!--Add Product + the Card-->
    </div>
    
</body>
</html>
