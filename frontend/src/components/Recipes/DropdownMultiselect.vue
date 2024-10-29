<template>
    <div class="dropdown-multiselect">
      <label>{{ label }}</label>
      <div class="dropdown">
        <input type="text" 
               :placeholder="placeholder" 
               @focus="toggleDropdown" 
               @blur="closeDropdown" 
               readonly 
               :value="selectedOptionsLabel" />
        <div v-if="isOpen" class="options">
          <div 
            v-for="option in options" 
            :key="option" 
            class="option"
            @click="toggleOption(option)"
          >
            <input 
              type="checkbox" 
              :checked="isSelected(option)" 
            />
            {{ option }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
  value: {
    type: Array,
    default: () => []  // Set default to an empty array
  },
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    required: true
  }
},
    data() {
      return {
        isOpen: false
      };
    },
    computed: {
      selectedOptionsLabel() {
        return this.value.join(', ') || '';
      }
    },
    methods: {
      toggleDropdown() {
        this.isOpen = !this.isOpen;
      },
      closeDropdown() {
        this.isOpen = false;
      },
      toggleOption(option) {
        if (this.isSelected(option)) {
          this.$emit('input', this.value.filter(item => item !== option));
        } else {
          this.$emit('input', [...this.value, option]);
        }
      },
      isSelected(option) {
        return this.value.includes(option);
      }
    }
  };
  </script>
  
  <style scoped>
  .dropdown-multiselect {
    position: relative;
  }
  
  .dropdown {
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .options {
    border: 1px solid #ddd;
    border-radius: 4px;
    position: absolute;
    background-color: white;
    z-index: 1;
  }
  
  .option {
    padding: 8px;
    cursor: pointer;
  }
  
  .option:hover {
    background-color: #f1f1f1;
  }
  </style>
  