// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
// MỚI: Import thêm useLocation
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import MobileMenu from './MobileMenu';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation(); // MỚI: Lấy thông tin đường dẫn hiện tại

  // MỚI: State để quản lý việc ẩn/hiện navbar và vị trí cuộn cuối cùng
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // MỚI: Logic kiểm soát Navbar
  const controlNavbar = () => {
    // Chỉ áp dụng logic này trên trang dashboard
    if (location.pathname === '/dashboard') {
      if (window.scrollY > lastScrollY && window.scrollY > 100) { // Nếu cuộn xuống và đã cuộn qua 100px
        setShowNav(false);
      } else { // Nếu cuộn lên
        setShowNav(true);
      }
    } else {
      // Trên các trang khác, luôn hiển thị navbar
      setShowNav(true);
    }
    setLastScrollY(window.scrollY);
  };

  // MỚI: Thêm và xóa event listener khi component mount/unmount hoặc khi vị trí cuộn thay đổi
  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, location.pathname]);


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
    // MỚI: Thêm class 'transition-transform' và class điều kiện để ẩn/hiện navbar
    <nav className={`fixed top-0 left-0 right-0 p-4 text-white z-50 backdrop-blur-lg bg-black bg-opacity-30 transition-transform duration-300 ease-in-out ${showNav ? 'translate-y-0' : '-translate-y-full'}`}> 
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          StudyMed
        </Link>
        <div className="hidden md:flex items-center">
          {isAuthenticated ? authLinks : guestLinks}
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
}

export default Navbar;