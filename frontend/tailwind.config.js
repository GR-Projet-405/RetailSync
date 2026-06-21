/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RetailSync Enterprise — Blue primary design system
        primary: {
          DEFAULT: '#2563EB', // Blue-600
          hover:   '#1D4ED8', // Blue-700
          light:   '#DBEAFE', // Blue-100
          dark:    '#1E40AF', // Blue-800
        },
        secondary: {
          DEFAULT: '#0EA5E9', // Sky-500
          light:   '#BAE6FD', // Sky-200
          dark:    '#0369A1', // Sky-700
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F8FAFC', // Slate-50
          subtle:  '#F1F5F9', // Slate-100
        },
        border: {
          DEFAULT: '#E2E8F0', // Slate-200
          strong:  '#CBD5E1', // Slate-300
        },
        text: {
          DEFAULT:   '#0F172A', // Slate-900
          secondary: '#64748B', // Slate-500
          muted:     '#94A3B8', // Slate-400
        },
        // Dark shell — sidebar stays dark
        darkbg: {
          DEFAULT: '#0F172A', // Slate-950
          card:    '#1E293B', // Slate-800
          border:  '#334155', // Slate-700
          muted:   '#64748B', // Slate-500
        },
        success: {
          DEFAULT: '#10B981',
          light:   '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#FEE2E2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
