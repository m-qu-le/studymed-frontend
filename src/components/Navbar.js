// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import MobileMenu from './MobileMenu'; // Import MobileMenu

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => { // Giữ lại hàm logout ở đây nếu cần gọi trực tiếp
    logout();
  };

  const guestLinks = (
    <>
      <Link to="/register" className="ml-4 hover:text-blue-200 transition-colors duration-200">
        Đăng Ký
      </Link>
      <Link to="/login" className="ml-4 hover:text-blue-200 transition-colors duration-200">
        Đăng Nhập
      </Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard" className="ml-4 hover:text-blue-200 transition-colors duration-200">
        Dashboard
      </Link>
      {user && (
        <span className="ml-4 text-blue-200 text-sm">Chào, {user.username || 'Bạn'}</span>
      )}
      <Button onClick={handleLogout} className="ml-4 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-200">
        Đăng Xuất
      </Button>
    </>
  );

  return (
    <nav className="bg-blue-500 p-4 text-white shadow-lg rounded-b-xl mx-2 mt-2 relative z-10"> {/* Thêm relative z-10 */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo hoặc tên ứng dụng */}
        <Link to="/" className="text-2xl font-bold">
          StudyMed
        </Link>

        {/* Các liên kết điều hướng cho màn hình lớn */}
        <div className="hidden md:flex items-center"> {/* Ẩn trên mobile, hiển thị trên md */}
          {isAuthenticated ? authLinks : guestLinks}
        </div>

        {/* Menu cho màn hình nhỏ */}
        <MobileMenu /> {/* Hiển thị MobileMenu */}
      </div>
    </nav>
  );
}

export default Navbar;