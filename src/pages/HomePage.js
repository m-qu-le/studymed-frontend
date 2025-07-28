// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import StudyMedIcon from '../components/StudyMedIcon';
// MỚI: Import ảnh nền từ thư mục assets
import HomeBackground from '../assets/home-background.jpg';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4 overflow-hidden" 
      // MỚI: Sử dụng biến đã import để làm ảnh nền
      style={{ backgroundImage: `url(${HomeBackground})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div> 

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <StudyMedIcon className="w-20 h-20 text-white mx-auto mb-4 drop-shadow-md" /> 
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg text-white">
          Chào mừng đến với StudyMed!
        </h1>
        <p className="text-lg md:text-xl mb-8 leading-relaxed drop-shadow-md text-white">
          Nền tảng học tập y khoa toàn diện, được thiết kế để nâng cao kiến thức và kỹ năng của bạn
          qua các bộ đề ôn tập chuyên sâu, làm bài trắc nghiệm thông minh, và tính năng theo dõi tiến độ.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            primary 
            onClick={() => navigate('/register')} 
            className="py-3 px-8 text-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-full transition-all duration-300" 
          >
            Đăng Ký Ngay
          </Button>
          <Button 
            secondary 
            onClick={() => navigate('/login')} 
            className="py-3 px-8 text-lg bg-white bg-opacity-25 text-white hover:bg-opacity-100 hover:text-blue-700 shadow-xl rounded-full transition-all duration-300" 
          >
            Đăng Nhập
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;