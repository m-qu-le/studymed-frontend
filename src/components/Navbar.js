// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import MobileMenu from './MobileMenu';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
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
    // MỚI: bg-transparent, backdrop-blur-lg, rounded-none, px-8
    <nav className="fixed top-0 left-0 right-0 p-4 text-white z-50 backdrop-blur-lg bg-black bg-opacity-30"> 
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo hoặc tên ứng dụng */}
        <Link to="/" className="text-2xl font-bold">
          StudyMed
        </Link>

        {/* Các liên kết điều hướng cho màn hình lớn */}
        <div className="hidden md:flex items-center">
          {isAuthenticated ? authLinks : guestLinks}
        </div>

        {/* Menu cho màn hình nhỏ */}
        <MobileMenu />
      </div>
    </nav>
  );
}

export default Navbar;