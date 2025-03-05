/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/@supabase/auth-ui-shared/**/*.{js,ts,jsx,tsx}",
    "node_modules/@supabase/auth-ui-react/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc5ff',
          400: '#36a7ff',
          500: '#0090ff',
          600: '#006fd4',
          700: '#0058ab',
          800: '#004a8c',
          900: '#003e73',
        },
        secondary: {
          50: '#fdf2ff',
          100: '#f6e4ff',
          200: '#edc5ff',
          300: '#e293ff',
          400: '#d354ff',
          500: '#c026ff',
          600: '#a800ef',
          700: '#8f00cc',
          800: '#7600a8',
          900: '#5c0084',
        },
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#262626',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      boxShadow: {
        'centra': '0 2px 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
} 