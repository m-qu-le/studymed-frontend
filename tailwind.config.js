/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // MỚI: Thêm font Roboto vào font-family mặc định của Tailwind
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      // Thêm các màu tùy chỉnh (giữ nguyên)
      colors: {
        'primary-blue': '#0381fe',
        'primary-blue-active': '#3e91ff',
        'soft-gray': '#f5f5f5',
        'dark-gray-text': '#333333',
      },
      // Thêm easing curve tùy chỉnh (giữ nguyên)
      transitionTimingFunction: {
        'one-ui-ease-out': 'cubic-bezier(0.22, 0.25, 0.00, 1.00)',
      },
    },
  },
  plugins: [
    // MỚI: Thêm plugin để hỗ trợ backdrop-filter
    function ({ addUtilities }) {
      const newUtilities = {
        '.backdrop-blur-sm': {
          'backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur-md': {
          'backdrop-filter': 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          'backdrop-filter': 'blur(12px)',
        },
        '.backdrop-blur-xl': {
          'backdrop-filter': 'blur(16px)',
        },
        '.backdrop-blur-2xl': {
          'backdrop-filter': 'blur(24px)',
        },
        '.backdrop-blur-3xl': {
          'backdrop-filter': 'blur(32px)',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
}