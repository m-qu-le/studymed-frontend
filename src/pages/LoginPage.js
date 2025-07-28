// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../assets/auth-background.jpg';

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
      <Link to="/" className="absolute top-0 left-0 p-8 text-xl font-bold text-white tracking-wider">
        STUDYMED
      </Link>

      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-black/30 backdrop-blur-lg rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Chào mừng bạn trở lại
          </h2>
          <form onSubmit={onSubmit}>
            <label className="block text-white text-sm font-semibold mb-1 text-left">Email</label>
            {/* MỚI: Đã xóa placeholder */}
            <InputField type="email" name="email" value={email} onChange={onChange} required />
            
            <label className="block text-white text-sm font-semibold mb-1 mt-4 text-left">Mật khẩu</label>
            {/* MỚI: Đã xóa placeholder */}
            <InputField type="password" name="password" value={password} onChange={onChange} required />
            
            <Button primary type="submit" className="w-full mt-6 py-3 text-base">
              Đăng Nhập
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-300 text-sm">
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