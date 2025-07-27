// src/pages/HomePage.js
import React from 'react';

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4"> {/* Đã thay đổi bg-gray-100 thành bg-soft-gray */}
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg w-full">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
          Chào mừng đến với StudyMed!
        </h1>
        <p className="text-gray-600 text-lg">
          Nền tảng học tập y khoa dành riêng cho sinh viên.
        </p>
      </div>
    </div>
  );
}

export default HomePage;