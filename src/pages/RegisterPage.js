// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import AuthBackground from '../assets/auth-background.jpg';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: ''
  });
  const { username, email, password, password2 } = formData;
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert('Mật khẩu xác nhận không khớp!', 'error');
    } else {
      try {
        await api.post('/api/auth/register', { username, email, password });
        setAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        navigate('/login');
      } catch (err) {
        const msg = err.response?.data?.msg || 'Đăng ký thất bại!';
        setAlert(msg, 'error');
      }
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
            Chào mừng bạn
          </h2>
          <form onSubmit={onSubmit}>
            {/* MỚI: Thêm label và sử dụng InputField với style mặc định */}
            <label className="block text-white text-sm font-semibold mb-1 text-left">Tên đăng nhập</label>
            <InputField name="username" value={username} onChange={onChange} required />
            
            <label className="block text-white text-sm font-semibold mb-1 mt-4 text-left">Email</label>
            <InputField type="email" name="email" value={email} onChange={onChange} required />
            
            <label className="block text-white text-sm font-semibold mb-1 mt-4 text-left">Mật khẩu</label>
            <InputField type="password" name="password" value={password} onChange={onChange} required minLength="6" />

            <label className="block text-white text-sm font-semibold mb-1 mt-4 text-left">Xác nhận mật khẩu</label>
            <InputField type="password" name="password2" value={password2} onChange={onChange} required />
            
            <Button primary type="submit" className="w-full mt-6 py-3 text-base">
              Đăng Ký
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-300 text-sm">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-white hover:underline font-semibold">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;