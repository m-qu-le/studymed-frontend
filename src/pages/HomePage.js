// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeBackground from '../assets/home-background.jpg'; // Hãy đảm bảo file ảnh nền của bạn vẫn nằm ở đây

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    // MỚI: Thay "min-h-screen" thành "h-screen" và thêm "overflow-hidden"
    <div 
      className="relative w-full h-screen bg-cover bg-center text-white font-sans overflow-hidden" 
      style={{ backgroundImage: `url(${HomeBackground})` }}
    >
      {/* Header riêng cho trang chủ */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
        <div className="text-xl font-bold tracking-wider">
          STUDYMED
        </div>
        
        <nav className="flex space-x-6 text-sm">
          {isAuthenticated ? (
            <Link to="/dashboard" className="hover:text-gray-300 transition-colors duration-200">
              Dashboard
            </Link>
          ) : (
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
      <main className="absolute bottom-24 left-8 right-8 md:bottom-20 md:left-20 md:right-auto max-w-lg">
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