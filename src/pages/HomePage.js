// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import StudyMedIcon from '../components/StudyMedIcon';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4 overflow-hidden" 
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/92/8f/05/928f051c49228a90b1b8718b2244f23f.jpg')" }}
    >
      {/* Lớp phủ (overlay) để văn bản dễ đọc hơn và tạo chiều sâu */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div> 

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Icon và Tên ứng dụng */}
        {/* MỚI: Màu icon và tên ứng dụng sẽ là màu trắng để nổi bật trên nền tối */}
        <StudyMedIcon className="w-20 h-20 text-white mx-auto mb-4 drop-shadow-md" /> 
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg text-white"> {/* MỚI: Đảm bảo text-white */}
          Chào mừng đến với StudyMed!
        </h1>
        <p className="text-lg md:text-xl mb-8 leading-relaxed drop-shadow-md text-white"> {/* MỚI: Đảm bảo text-white */}
          Nền tảng học tập y khoa toàn diện, được thiết kế để nâng cao kiến thức và kỹ năng của bạn
          qua các bộ đề ôn tập chuyên sâu, làm bài trắc nghiệm thông minh, và tính năng theo dõi tiến độ.
        </p>

        {/* Các nút kêu gọi hành động */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            primary 
            onClick={() => navigate('/register')} 
            // MỚI: Nút chính với màu nền xanh đậm, chữ trắng, hòa hợp với tông màu tối của nền
            className="py-3 px-8 text-lg bg-blue-700 text-white hover:bg-blue-800 shadow-xl rounded-full transition-all duration-300" 
          >
            Đăng Ký Ngay
          </Button>
          <Button 
            secondary 
            onClick={() => navigate('/login')} 
            // MỚI: Nút phụ với viền trắng, chữ trắng, nền trong suốt, hòa hợp với nền
            className="py-3 px-8 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-700 shadow-xl rounded-full transition-all duration-300" 
          >
            Đăng Nhập
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;