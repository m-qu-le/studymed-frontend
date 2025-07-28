// src/pages/RegisterPage.js
import React, { useState } from 'react'; // ĐÃ SỬA: Dấu ' thành ;
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import AuthBackground from '../assets/auth-background.jpg'; // Dùng chung ảnh nền

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
      {/* Logo góc trên trái */}
      <Link to="/" className="absolute top-0 left-0 p-8 text-xl font-bold text-white tracking-wider">
        STUDYMED
      </Link>

      {/* Khung Register */}
      <div className="absolute top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Tạo tài khoản
          </h2>
          <form onSubmit={onSubmit}>
            <InputField name="username" value={username} onChange={onChange} placeholder="Tên đăng nhập" required className="bg-white/50 text-gray-800 placeholder-gray-600 border-none" />
            <InputField type="email" name="email" value={email} onChange={onChange} placeholder="Email" required className="bg-white/50 text-gray-800 placeholder-gray-600 border-none" />
            <InputField type="password" name="password" value={password} onChange={onChange} placeholder="Mật khẩu" required minLength="6" className="bg-white/50 text-gray-800 placeholder-gray-600 border-none" />
            <InputField type="password" name="password2" value={password2} onChange={onChange} placeholder="Xác nhận mật khẩu" required className="bg-white/50 text-gray-800 placeholder-gray-600 border-none" />
            
            <Button primary type="submit" className="w-full mt-4 py-3 text-base">
              Đăng Ký
            </Button>
          </form>
          <p className="mt-6 text-center text-gray-200 text-sm">
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