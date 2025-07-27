// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Bắt đầu với true
  const navigate = useNavigate();

  // Sử dụng useCallback để đảm bảo hàm logout ổn định
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false); // Đảm bảo loading là false khi logout
    navigate('/login');
  }, [navigate]); // navigate là dependency của logout

  // useEffect này sẽ chạy MỘT LẦN khi component được mount
  // và mỗi khi hàm `logout` thay đổi (do `Maps` thay đổi)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Kiểm tra token hết hạn
        if (decodedUser.exp * 1000 < Date.now()) {
          console.log('AuthContext: Token hết hạn, đang đăng xuất...');
          logout(); // Gọi hàm logout đã được useCallback
        } else {
          setUser(decodedUser.user);
          setLoading(false); // Đã tải xong và có user
        }
      } catch (error) {
        console.error('AuthContext: Lỗi giải mã token hoặc token không hợp lệ:', error);
        logout(); // Xóa token và đăng xuất
      }
    } else {
      setLoading(false); // Không có token, tải xong và không có user
    }
  }, [logout]); // logout là dependency ở đây

  // Hàm đăng nhập (gọi từ LoginPage)
  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser.user);
    setLoading(false); // Sau khi login, đảm bảo loading là false
  };

  const authContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  // Chỉ render children khi trạng thái loading đã kết thúc
  // (hoặc hiển thị một màn hình loading toàn cục)
  return (
    <AuthContext.Provider value={authContextValue}>
      {loading ? ( // Nếu đang tải, hiển thị một thông báo tải
        <div className="flex items-center justify-center min-h-screen bg-soft-gray">
          <p className="text-xl text-gray-700">Đang kiểm tra xác thực...</p>
        </div>
      ) : (
        children // Nếu không tải, hiển thị nội dung ứng dụng
      )}
    </AuthContext.Provider>
  );
};