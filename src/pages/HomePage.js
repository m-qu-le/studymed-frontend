// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeBackground from '../assets/home-background-2.jpg'; // Import ảnh nền mới

function HomePage() {
  const { isAuthenticated } = useAuth(); // Dùng context để kiểm tra trạng thái đăng nhập

  return (
    <div 
      className="relative w-full min-h-screen bg-cover bg-center text-white font-sans" 
      style={{ backgroundImage: `url(${HomeBackground})` }}
    >
      {/* Header riêng cho trang chủ */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold tracking-wider">
          STUDYMED
        </div>
        
        {/* Các link điều hướng */}
        <nav className="flex space-x-6 text-sm">
          {isAuthenticated ? (
            // Nếu đã đăng nhập
            <Link to="/dashboard" className="hover:text-gray-300 transition-colors duration-200">
              Dashboard
            </Link>
          ) : (
            // Nếu chưa đăng nhập
            <>
              <Link to="/register" className="hover:text-gray-300 transition-colors duration-200">
                Đăng ký
              </Link>
              <Link to="/login" className="hover:text-gray-300 transition-colors duration-200">
                Đăng nhập
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Nội dung chính của trang chủ */}
      <main className="absolute bottom-0 left-0 p-8 md:p-16 max-w-lg">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 lowercase">
          welcome
        </h1>
        <p className="text-base leading-relaxed text-gray-300">
          Nền tảng học tập y khoa toàn diện, được thiết kế để nâng cao kiến thức và kỹ năng của bạn qua các bộ đề ôn tập chuyên sâu, làm bài trắc nghiệm thông minh, và tính năng theo dõi tiến độ.
        </p>
      </main>
    </div>
  );
}

export default HomePage;