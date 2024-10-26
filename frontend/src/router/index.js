import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/Dashboard/Home.vue';
import AddItem from '../components/Fridge/AddItem.vue';
import CookingHistory from '../components/History/History.vue';
import CalendarPage from '../components/History/CalendarPage.vue';
import RecipeDetails from '../components/Community/CRecipeDetails.vue'; // Updated import
import PostRecipe from '../components/Community/CPostRecipe.vue'; // Updated import
import PostDrafts from '../components/Community/CPostDrafts.vue'; // Updated import
import RecipeList from '../components/Community/CRecipeList.vue';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },
  {
    path: '/add-item',
    name: 'AddItem',
    component: AddItem,
  },
  {
    path: '/history',
    name: 'CookingHistory',
    component: CookingHistory,
  },
  {
    path: '/calendar',
    name: 'CalendarPage',
    component: CalendarPage,
  },
  {
    path: '/community',
    name: 'Community',
    component: RecipeList // Displays list of all community recipes
  },
  {
    path: '/community/recipe/:id',
    name: 'RecipeDetails',
    component: RecipeDetails, // Displays the details of a single recipe
    props: true // Allows passing the recipe ID as a prop
  },
  {
    path: '/community/post-recipe',
    name: 'PostRecipe',
    component: PostRecipe // Page to create a new recipe
  },
  {
    path: '/community/drafts',
    name: 'PostDrafts',
    component: PostDrafts // Page to view/manage recipe drafts
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
