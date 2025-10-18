import { create } from 'zustand';
import { settings } from '../db/database';

export const useStore = create((set, get) => ({
  // Language
  language: 'ru',
  setLanguage: async (lang) => {
    await settings.setLanguage(lang);
    set({ language: lang });
  },

  // Premium status
  isPremium: false,
  checkPremium: async () => {
    const isPremium = await settings.checkPremium();
    set({ isPremium });
    return isPremium;
  },

  // Loading states
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // Current page
  currentPage: 'journal',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Toast notifications
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },

  // Initialize app
  initialize: async () => {
    const settingsData = await settings.get();
    set({
      language: settingsData.language,
      isPremium: await settings.checkPremium()
    });
  }
}));
