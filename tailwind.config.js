/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          purple: '#8B5CF6',
          blue: '#1E293B',
          dark: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}