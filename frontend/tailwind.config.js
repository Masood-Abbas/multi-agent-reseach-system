/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0F14',
        sidebar: '#11131B',
        card: '#161922',
        'card-border': 'rgba(255, 255, 255, 0.08)',
        accent: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          hover: '#4F46E5',
        },
        text: {
          main: '#FFFFFF',
          muted: '#9CA3AF',
          dim: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

