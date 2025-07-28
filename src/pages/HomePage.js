// src/pages/HomePage.js
import React, { useEffect } from 'react'; // MỚI: import thêm useEffect
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeBackground from '../assets/home-background.jpg'; 

function HomePage() {
  const { isAuthenticated } = useAuth();

  // MỚI: Thêm hook để điều khiển việc cuộn của trang
  useEffect(() => {
    // Khi component được hiển thị, thêm class để chặn cuộn
    document.body.classList.add('overflow-hidden');

    // Khi component bị ẩn đi (người dùng chuyển trang), xóa class để các trang khác cuộn bình thường
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []); // Mảng rỗng đảm bảo hiệu ứng này chỉ chạy 1 lần khi vào và 1 lần khi rời đi

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-cover bg-center text-white font-sans" 
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
      <main className="absolute bottom-32 left-8 right-8 md:bottom-32 md:left-32 md:right-auto max-w-lg">
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