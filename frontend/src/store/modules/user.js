// store/modules/user.js
import { auth } from '@/services/firebase';

export default {
  state: {
    user: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    }
  },
  actions: {
    async login({ commit }, { email, password }) {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      commit('setUser', userCredential.user);
    },
    async logout({ commit }) {
      await auth.signOut();
      commit('clearUser');
    },
    fetchUser({ commit }) {
      auth.onAuthStateChanged(user => {
        if (user) {
          commit('setUser', user);
        } else {
          commit('clearUser');
        }
      });
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    currentUser(state) {
      return state.user;
    }
  }
};