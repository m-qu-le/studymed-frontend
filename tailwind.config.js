/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Thêm các màu tùy chỉnh
      colors: {
        'primary-blue': '#0381fe', // Màu xanh chủ đạo
        'primary-blue-active': '#3e91ff', // Màu xanh khi được kích hoạt/chọn
        'soft-gray': '#f5f5f5', // Xám rất nhạt cho nền
        'dark-gray-text': '#333333', // Màu văn bản cho dark mode (chúng ta sẽ dùng sau)
      },
      // Thêm easing curve tùy chỉnh cho chuyển động mượt mà
      transitionTimingFunction: {
        'one-ui-ease-out': 'cubic-bezier(0.22, 0.25, 0.00, 1.00)',
      },
    },
  },
  plugins: [],
}