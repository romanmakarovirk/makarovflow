import { create } from 'zustand';
import { settings } from '../db/database';

export const useStore = create((set, get) => ({
  // Language
  language: 'ru',
  setLanguage: async (lang) => {
    await settings.setLanguage(lang);
    set({ language: lang });
  },

  // Theme
  theme: 'dark',
  setTheme: async (newTheme) => {
    try {
      await settings.setTheme(newTheme);
      set({ theme: newTheme });

      // Apply theme to document.documentElement
      const html = document.documentElement;
      if (newTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      console.log('Theme changed to:', newTheme, 'Has dark class:', html.classList.contains('dark'));
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
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
    const theme = settingsData.theme || 'dark';

    set({
      language: settingsData.language,
      theme,
      isPremium: await settings.checkPremium()
    });

    // Apply theme on init
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    console.log('App initialized with theme:', theme, 'Has dark class:', html.classList.contains('dark'));
  }
}));
