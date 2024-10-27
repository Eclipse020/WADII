<template>
  <div class="shopping-list">
    <h4>Shopping List</h4>

    <!-- Input group stays at the top -->
    <div class="input-group mb-3">
      <input 
        v-model="newIngredient" 
        placeholder="Add an ingredient" 
        class="form-control"
        @keyup.enter="addIngredient"
      />
      <button class="btn btn-primary" @click="addIngredient">Add</button>
    </div>

    <!-- Clear all button -->
    <div class="mb-3">
      <button 
        class="btn btn-warning" 
        @click="clearAll"
        v-if="localIngredients.length > 0"
      >
        Clear All
      </button>
    </div>

    <!-- List of ingredients -->
    <ul class="ingredient-list">
      <li v-for="(item, index) in localIngredients" :key="index" class="list-item">
        {{ item }}
        <button class="btn btn-danger btn-sm" @click="removeIngredient(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'ShoppingList',
  props: {
    ingredients: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localIngredients: [],
      newIngredient: ''
    };
  },
  watch: {
    ingredients: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // Only update if the arrays are different
        if (JSON.stringify(this.localIngredients) !== JSON.stringify(newVal)) {
          // Process each ingredient to extract the main ingredient
          const processedIngredients = newVal.map(ingredient => this.extractMainIngredient(ingredient));
          // Remove duplicates and empty strings
          this.localIngredients = [...new Set(processedIngredients.filter(Boolean))];
        }
      }
    }
  },
  methods: {
    extractMainIngredient(ingredientText) {
      // Convert any special fraction characters to standard fractions
      let cleanText = ingredientText
        .replace(/½/g, '1/2')
        .replace(/⅓/g, '1/3')
        .replace(/¼/g, '1/4')
        .replace(/¾/g, '3/4')
        .replace(/⅔/g, '2/3');

      // Remove measurements and amounts
      cleanText = cleanText
        // Remove complex measurements with units
        .replace(/\d+(?:\/\d+)?(?:\.\d+)?\s*(?:cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|pound|pounds|ounce|ounces|oz|gram|grams|g|ml|inch|inches|cm|mm)s?\b/gi, '')
        // Remove standalone numbers and fractions
        .replace(/\d+\/\d+|\d+\.?\d*/g, '')
        // Remove common measurement words without numbers
        .replace(/\b(?:cup|tablespoon|teaspoon|tsp|tbsp|pound|ounce|oz|gram|g|ml|inch|cm|mm)s?\b/gi, '');

      // Remove cooking instructions and qualifiers
      cleanText = cleanText
        // Remove parenthetical instructions
        .replace(/\([^)]+\)/g, '')
        // Remove everything after a comma
        .replace(/,.*$/g, '')
        // Remove common cooking instructions
        .replace(/\b(?:chopped|minced|diced|sliced|grated|crushed|trimmed|peeled|cut|divided|stems|tips|pieces|lengths|bias|around)\b/gi, '')
        // Remove freshness/temperature indicators
        .replace(/\b(?:fresh|freshly|dried|frozen|cold|hot|warm|room temperature|cooked|uncooked|hard-cooked)\b/gi, '')
        // Remove descriptive terms
        .replace(/\b(?:large|medium|small|thin|thick|fine|coarse|plus|more)\b/gi, '')
        // Remove common prepositions and articles
        .replace(/\b(?:of|and|or|to|for|with|into|on|the|a|an)\b/gi, '')
        // Remove specific qualifiers
        .replace(/\b(?:kosher|ground|grated|zest|juice|purpose|all-purpose)\b/gi, '')
        // Clean up extra spaces and punctuation
        .replace(/\s+/g, ' ')
        .replace(/[.,;]/g, '')
        .trim();

      // Special cases for common ingredients
      const specialCases = {
        'salt kosher': 'salt',
        'pepper ground': 'pepper',
        'egg yolks': 'egg yolks',
        'egg noodles': 'egg noodles'
      };

      // Check for special cases
      for (const [pattern, replacement] of Object.entries(specialCases)) {
        if (cleanText.toLowerCase().includes(pattern)) {
          return replacement;
        }
      }

      // Return the first remaining word, or the original if nothing meaningful remains
      const words = cleanText.split(' ').filter(Boolean);
      return words.length > 0 ? words[0] : ingredientText;
    },
    addIngredient() {
      if (this.newIngredient.trim()) {
        const ingredient = this.newIngredient.trim();
        if (!this.localIngredients.includes(ingredient)) {
          this.localIngredients.push(ingredient);
          this.newIngredient = '';
          this.$emit('update', [...this.localIngredients]);
        }
      }
    },
    removeIngredient(index) {
      this.localIngredients.splice(index, 1);
      this.$emit('update', [...this.localIngredients]);
    },
    clearAll() {
      this.localIngredients = [];
      this.$emit('update', []);
    }
  }
};
</script>

<!-- <style scoped>
.shopping-list {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ingredient-list {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn-danger {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-warning {
  margin-bottom: 1rem;
}
</style> -->