// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import StudyMedIcon from '../components/StudyMedIcon';

function HomePage() {
  const navigate = useNavigate();

  // MỚI: Thay đổi ảnh nền theo yêu cầu của bạn
  const backgroundImageUrl = "https://i.pinimg.com/originals/0c/33/c9/0c33c94bf6f3458913615a65c1945789.jpg";

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4 overflow-hidden" 
      style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
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
          {/* MỚI: Thay đổi style của nút Đăng Nhập */}
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