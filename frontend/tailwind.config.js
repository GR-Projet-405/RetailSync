/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Indigo + Cyan enterprise theme
        primary: {
          DEFAULT: '#6366f1', // Indigo
          light: '#818cf8',
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#06b6d4', // Cyan
          light: '#22d3ee',
          dark: '#0891b2',
        },
        darkbg: {
          DEFAULT: '#0f172a', // Slate 900
          card: '#1e293b', // Slate 800
          border: '#334155', // Slate 700
          muted: '#64748b', // Slate 500
        },
        success: {
          DEFAULT: '#10b981', // Emerald
          light: '#34d399',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber
          light: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444', // Red
          light: '#f87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
