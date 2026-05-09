/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bps: {
          blue:       '#1e40af',
          'blue-light': '#3b82f6',
          'blue-dark':  '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
