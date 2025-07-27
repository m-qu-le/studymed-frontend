// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // MỚI: Import api từ '../services/api'
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { email, password } = formData;

  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const { login } = useAuth();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredentials = {
        email,
        password
      };

      const res = await api.post('/api/auth/login', userCredentials); // MỚI: Sử dụng api.post

      localStorage.setItem('token', res.data.token);
      console.log('Đăng nhập thành công! Token:', res.data.token);
      setAlert('Đăng nhập thành công!', 'success');
      login(res.data.token); // Gọi hàm login từ AuthContext để lưu token và cập nhật trạng thái
      navigate('/dashboard');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.response && err.response.data.msg);
      setAlert(err.response && err.response.data.msg ? err.response.data.msg : 'Đăng nhập thất bại!', 'error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-purple-600 mb-6 text-center">Đăng Nhập</h1>
        <form onSubmit={onSubmit}>
          <InputField
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Nhập email của bạn"
            required
          />
          <InputField
            label="Mật khẩu"
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Nhập mật khẩu"
            required
          />
          <Button primary type="submit" className="w-full mt-4">
            Đăng Nhập
          </Button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;