//celeste stuff
import axios from 'axios';

const APP_ID = '3293e008'; // Your application ID
const APP_KEY = '715ffcc7f5922cd9e6cc3ab48549c216'; // Your application key
const BASE_URL = 'https://api.edamam.com/api/recipes/v2';

export const fetchFridgeContents = async () => {
  // Dummy data for fridge contents, replace with actual API call if needed
  return [
    { id: 1, name: 'Tomato' },
    { id: 2, name: 'Chicken' },
    { id: 3, name: 'Lettuce' },
  ];
};

export const fetchRecommendedRecipes = async () => {
  const response = await axios.get(`${BASE_URL}?type=public&app_id=${APP_ID}&app_key=${APP_KEY}&q=chicken`);
  return response.data.hits.map(hit => hit.recipe); // Adjust based on API response
};
