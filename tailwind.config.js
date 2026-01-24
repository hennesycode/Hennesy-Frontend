/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0A6B38',
          dark: '#053D1B',
          light: '#2BA761',
          lighter: '#7CC09C',
        },
        neutral: {
          darkest: '#040404',
          dark: '#484848',
          medium: '#3C4C44',
          DEFAULT: '#5D7467',
          light: '#709484',
        },
        surface: {
          white: '#FFFFFF',
          lightest: '#E9F2ED',
          lighter: '#D2E4DB',
          light: '#BCD7C9',
          DEFAULT: '#A6C9B7',
          medium: '#90BCA5',
        },
        // Futuristic theme colors
        primary: '#008a75',
        'primary-light': '#00FFB0',
        'secondary-blue': '#00B3FF',
        'background-light': '#e9f2f1',
        'background-dark': '#050b09',
        'nebula-dark': '#081210',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
        'nebula': "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop')",
      },
      animation: {
        'typing': 'typing 2s steps(20) 1s forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-border': 'pulse-border 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'star-fall': 'star-fall 10s linear infinite',
      },
      keyframes: {
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'pulse-border': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(60, 255, 20, 0.2), inset 0 0 5px rgba(60, 255, 20, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(60, 255, 20, 0.5), inset 0 0 10px rgba(60, 255, 20, 0.3)' }
        },
        'star-fall': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
