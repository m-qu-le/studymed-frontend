// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../assets/auth-background.jpg'; // Import ảnh nền

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { login } = useAuth();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token);
      setAlert('Đăng nhập thành công!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Đăng nhập thất bại!';
      setAlert(msg, 'error');
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 w-full h-dvh bg-cover bg-center font-sans" 
      style={{ backgroundImage: `url(${AuthBackground})` }}
    >
      {/* Logo góc trên trái */}
      <Link to="/" className="absolute top-0 left-0 p-8 text-xl font-bold text-white tracking-wider">
        STUDYMED
      </Link>

      {/* Khung Login */}
      <div className="absolute top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Chào mừng bạn trở lại
          </h2>
          <form onSubmit={onSubmit}>
            <InputField
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Email"
              required
              className="bg-white/50 text-gray-800 placeholder-gray-600 border-none"
            />
            <InputField
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Mật khẩu"
              required
              className="bg-white/50 text-gray-800 placeholder-gray-600 border-none"
            />
            <Button primary type="submit" className="w-full mt-4 py-3 text-base">
              Đăng Nhập
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-200 text-sm">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-white hover:underline font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;