/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tg-bg': 'var(--tg-theme-bg-color, #111827)',
        'tg-text': 'var(--tg-theme-text-color, #ffffff)',
        'tg-hint': 'var(--tg-theme-hint-color, #9ca3af)',
        'tg-link': 'var(--tg-theme-link-color, #3b82f6)',
        'tg-button': 'var(--tg-theme-button-color, #3b82f6)',
        'tg-button-text': 'var(--tg-theme-button-text-color, #ffffff)',
      },
      backgroundColor: {
        'gray-750': '#2d3748',
      }
    },
  },
  plugins: [],
}
