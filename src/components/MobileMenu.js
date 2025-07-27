// src/components/MobileMenu.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false); // State để quản lý việc mở/đóng menu
  const { isAuthenticated, logout, user } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogoutAndClose = () => {
    logout();
    setIsOpen(false); // Đóng menu sau khi đăng xuất
  };

  const MenuLinks = () => (
    <>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className="block p-3 hover:bg-blue-600 rounded-lg transition-colors duration-200" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          {user && (
            <span className="block p-3 text-blue-200 text-sm">Chào, {user.username || 'Bạn'}</span>
          )}
          <Button onClick={handleLogoutAndClose} className="w-full text-left p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-200 mt-2">
            Đăng Xuất
          </Button>
        </>
      ) : (
        <>
          <Link to="/register" className="block p-3 hover:bg-blue-600 rounded-lg transition-colors duration-200" onClick={() => setIsOpen(false)}>
            Đăng Ký
          </Link>
          <Link to="/login" className="block p-3 hover:bg-blue-600 rounded-lg transition-colors duration-200" onClick={() => setIsOpen(false)}>
            Đăng Nhập
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="md:hidden flex items-center"> {/* Chỉ hiển thị trên màn hình nhỏ hơn md */}
      <button onClick={toggleMenu} className="text-white focus:outline-none">
        {/* Icon Hamburger hoặc X */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          )}
        </svg>
      </button>

      {/* Menu dropdown khi mở */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-blue-700 rounded-lg shadow-xl py-2 z-50">
          <MenuLinks />
        </div>
      )}
    </div>
  );
}

export default MobileMenu;