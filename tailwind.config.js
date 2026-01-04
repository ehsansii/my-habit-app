/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- این خط حیاتی است! اگر نباشد دکمه کار نمی‌کند
  content: [
    "./index.html",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
