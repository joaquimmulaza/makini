/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        makini: {
          earth: '#5A3E2B',     // Terra Profunda
          clay: '#8C6239',      // Argila Natural
          green: '#2E7D32',     // Verde Técnico
          lightGreen: '#A5D6A7',// Verde Claro Suporte
          sand: '#F4F1ED',      // Cinza Solo Seco
          black: '#1C1C1C',     // Preto Técnico
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
