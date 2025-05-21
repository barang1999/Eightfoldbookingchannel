/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#A58E63", // Elegant gold-like primary color
        secondary: "#EFE9E1", // Soft neutral background
        accent: "#264653", // Deep accent color
        'text-primary': "#333333", // Clean dark text
        'bg-soft': "#FAF8F6", // Soft background
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}