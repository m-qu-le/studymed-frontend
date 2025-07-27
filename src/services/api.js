// src/services/api.js
import axios from 'axios';

// Sử dụng biến môi trường REACT_APP_API_URL
// Khi chạy cục bộ, biến này sẽ không tồn tại, nên nó sẽ dùng http://localhost:5001
// Khi deploy lên Vercel, Vercel sẽ cung cấp giá trị này
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Tạo một instance Axios tùy chỉnh
const api = axios.create({
  baseURL: API_URL, // Đặt URL cơ sở cho tất cả các yêu cầu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm Authorization header cho các request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;