// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // MỚI: Import useNavigate
import Button from '../components/Button'; // MỚI: Import Button component
import StudyMedIcon from '../components/StudyMedIcon'; // MỚI: Import icon

function HomePage() {
  const navigate = useNavigate(); // MỚI: Sử dụng useNavigate hook

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4 overflow-hidden" // MỚI: Các lớp Tailwind cho hình nền
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/92/8f/05/928f051c49228a90b1b8718b2244f23f.jpg')" }} // MỚI: Hình nền từ URL bạn cung cấp
    >
      {/* Lớp phủ (overlay) để văn bản dễ đọc hơn */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div> {/* MỚI: Lớp phủ đen trong suốt */}

      <div className="relative z-10 text-center max-w-2xl mx-auto"> {/* MỚI: Nội dung chính, z-index để nổi lên trên overlay */}
        {/* Icon và Tên ứng dụng */}
        <StudyMedIcon className="w-24 h-24 text-white mx-auto mb-4" /> {/* MỚI: Icon trắng cho nền này */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg"> {/* MỚI: Tiêu đề lớn, font-extrabold, drop-shadow */}
          Chào mừng đến với StudyMed!
        </h1>
        <p className="text-lg md:text-xl mb-8 leading-relaxed drop-shadow-md"> {/* MỚI: Mô tả, leading-relaxed, drop-shadow */}
          Nền tảng học tập y khoa toàn diện, được thiết kế để nâng cao kiến thức và kỹ năng của bạn
          qua các bộ đề ôn tập chuyên sâu, làm bài trắc nghiệm thông minh, và tính năng theo dõi tiến độ.
        </p>

        {/* Các nút kêu gọi hành động */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            primary 
            onClick={() => navigate('/register')} 
            className="py-3 px-8 text-lg bg-white text-primary-blue hover:bg-gray-100 shadow-xl rounded-full" // MỚI: Nút sáng, bo tròn hết cỡ
          >
            Đăng Ký Ngay
          </Button>
          <Button 
            secondary 
            onClick={() => navigate('/login')} 
            className="py-3 px-8 text-lg border-2 border-white text-white hover:bg-white hover:text-primary-blue shadow-xl rounded-full" // MỚI: Nút viền, bo tròn hết cỡ
          >
            Đăng Nhập
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;