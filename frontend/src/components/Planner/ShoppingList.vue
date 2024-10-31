<template>
  <div class="shopping-list">
    <h4 class="shopping-list__title">Shopping List</h4>

    <!-- Input group -->
    <div class="shopping-list__input-group">
      <input 
        v-model="newIngredient" 
        placeholder="Add an ingredient" 
        class="shopping-list__input"
        @keyup.enter="addIngredient"
      />
      <button class="shopping-list__button" @click="addIngredient">Add</button>
    </div>

    <!-- Clear all button with confirmation -->
    <div class="mb-3" v-if="localIngredients.length > 0">
      <button 
        class="shopping-list__button shopping-list__button--clear" 
        @click="showClearConfirmation = true"
      >
        Clear All
      </button>
    </div>

    <!-- List of ingredients -->
    <ul class="shopping-list__ingredients">
      <li 
        v-for="(item, index) in localIngredients" 
        :key="index" 
        class="shopping-list__item"
      >
        <template v-if="editIndex === index">
          <input 
            v-model="editedIngredient" 
            class="shopping-list__input shopping-list__input--edit"
            @keyup.enter="saveEdit(index)"
            @keyup.esc="cancelEdit"
            :ref="`editInput_${index}`"
          />
          <div class="shopping-list__button-group">
            <button 
              class="shopping-list__button shopping-list__button--save" 
              @click="saveEdit(index)"
            >
              Save
            </button>
            <button 
              class="shopping-list__button shopping-list__button--cancel" 
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </template>
        <template v-else>
          {{ item }}
          <div class="shopping-list__button-group">
            <button 
              class="shopping-list__button shopping-list__button--edit" 
              @click="startEdit(index, item)"
            >
              Edit
            </button>
            <button 
              class="shopping-list__button shopping-list__button--remove" 
              @click="removeIngredient(index)"
            >
              Remove
            </button>
          </div>
        </template>
      </li>
    </ul>

    <!-- Clear All Confirmation Modal -->
    <div v-if="showClearConfirmation" class="shopping-list__modal">
      <div class="shopping-list__modal-content">
        <h5 class="shopping-list__modal-title">Confirm Clear All</h5>
        <p class="shopping-list__modal-text">Are you sure you want to clear all items from your shopping list?</p>
        <div class="shopping-list__modal-buttons">
          <button 
            class="shopping-list__button shopping-list__button--confirm" 
            @click="confirmClear"
          >
            Yes, Clear All
          </button>
          <button 
            class="shopping-list__button shopping-list__button--cancel" 
            @click="showClearConfirmation = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
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
      newIngredient: '',
      editIndex: -1,
      editedIngredient: '',
      showClearConfirmation: false
    };
  },
  watch: {
    ingredients: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (JSON.stringify(this.localIngredients) !== JSON.stringify(newVal)) {
          this.localIngredients = [...newVal];
        }
      }
    }
  },
  methods: {
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
    startEdit(index, item) {
      this.editIndex = index;
      this.editedIngredient = item;
      this.$nextTick(() => {
        const input = this.$refs[`editInput_${index}`];
        if (input && input[0]) {
          input[0].focus();
        }
      });
    },
    saveEdit(index) {
      if (this.editedIngredient.trim()) {
        this.localIngredients[index] = this.editedIngredient.trim();
        this.$emit('update', [...this.localIngredients]);
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.editIndex = -1;
      this.editedIngredient = '';
    },
    confirmClear() {
      this.localIngredients = [];
      this.$emit('update', []);
      this.showClearConfirmation = false;
    }
  }
};
</script>