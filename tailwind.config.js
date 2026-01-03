/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // این خط باعث می‌شود دکمه تغییر تم کار کند
  content: [
    "./index.html",
    "./index.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'], // فونت وزیر را اینجا هم اضافه کردیم
      },
    },
  },
  plugins: [],
}
