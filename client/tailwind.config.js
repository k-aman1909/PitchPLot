/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark & Light AI Workspace Color System
        ai: {
          bg: '#070B14',
          bgSecondary: '#0B1120',
          card: '#0F172A',
          cardElevated: '#111827',
          border: 'rgba(255, 255, 255, 0.08)',
          borderActive: 'rgba(139, 92, 246, 0.4)',
          purple: '#7C3AED',
          indigo: '#6366F1',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          textMain: '#F8FAFC',
          textMuted: '#94A3B8',
          textSubtle: '#64748B',

          // Light Mode Overrides
          lightBg: '#F7F8FC',
          lightBgSecondary: '#FFFFFF',
          lightCard: '#FFFFFF',
          lightBorder: '#E5E7EB',
          lightTextMain: '#111827',
          lightTextMuted: '#64748B',
          lightPrimary: '#6D4AFF',
        },
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D4AFF',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764',
        },
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D4AFF',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Geist', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
