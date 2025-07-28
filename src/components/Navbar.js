// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import MobileMenu from './MobileMenu';

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // MỚI: Xác định xem có phải trang chủ không
  const isHomePage = location.pathname === '/';

  const controlNavbar = () => {
    // Logic ẩn/hiện khi cuộn chỉ áp dụng cho trang dashboard
    if (location.pathname === '/dashboard') {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
    } else {
      // Trên các trang khác, luôn hiển thị navbar
      setShowNav(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, location.pathname]);


  const handleLogout = () => {
    logout();
  };

  // MỚI: Tùy chỉnh màu chữ dựa trên trang chủ
  const linkColor = isHomePage ? "text-white hover:text-gray-300" : "text-white hover:text-blue-200";

  const guestLinks = (
    <>
      <Link to="/register" className={`ml-4 ${linkColor} transition-colors duration-200`}>
        Đăng Ký
      </Link>
      <Link to="/login" className={`ml-4 ${linkColor} transition-colors duration-200`}>
        Đăng Nhập
      </Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard" className={`ml-4 ${linkColor} transition-colors duration-200`}>
        Dashboard
      </Link>
      {user && (
        <span className={`ml-4 ${isHomePage ? 'text-gray-300' : 'text-blue-200'} text-sm`}>Chào, {user.username || 'Bạn'}</span>
      )}
      <Button onClick={handleLogout} className="ml-4 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-200">
        Đăng Xuất
      </Button>
    </>
  );
  
  // MỚI: Tạo class động cho navbar
  const navBaseClasses = "fixed top-0 left-0 right-0 p-4 z-50 transition-all duration-300 ease-in-out";
  const navStyleClasses = isHomePage
    ? "bg-transparent" // Trong suốt trên trang chủ
    : "backdrop-blur-lg bg-black bg-opacity-30"; // Nền mờ trên các trang khác
  const navVisibilityClass = showNav ? 'translate-y-0' : '-translate-y-full';

  return (
    <nav className={`${navBaseClasses} ${navStyleClasses} ${navVisibilityClass}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
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