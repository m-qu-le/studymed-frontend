// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const { username, email, password, password2 } = formData;

  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setAlert('Mật khẩu xác nhận không khớp!', 'error');
    } else {
      try {
        const newUser = {
          username,
          email,
          password
        };

        const res = await axios.post('http://localhost:5001/api/auth/register', newUser);

        console.log('Đăng ký thành công:', res.data.token);
        setAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        navigate('/login');
      } catch (err) {
        console.error('Lỗi đăng ký:', err); // Log toàn bộ đối tượng lỗi
        // Kiểm tra nếu có phản hồi lỗi từ backend
        if (err.response) {
          // Lấy thông báo lỗi chung
          const msg = err.response.data.msg;
          if (msg) {
            setAlert(msg, 'error');
          }
          // Nếu backend trả về mảng lỗi (ví dụ từ express-validator)
          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            err.response.data.errors.forEach(error => setAlert(error.msg, 'error'));
          }
        } else {
          setAlert('Đăng ký thất bại! Lỗi không xác định.', 'error');
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Đăng Ký Tài Khoản Mới</h1>
        <form onSubmit={onSubmit}>
          <InputField
            label="Tên đăng nhập"
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="Nhập tên đăng nhập của bạn"
            required
          />
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
            minLength="6"
          />
          <InputField
            label="Xác nhận mật khẩu"
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            placeholder="Nhập lại mật khẩu"
            required
          />
          <Button primary type="submit" className="w-full mt-4">
            Đăng Ký
          </Button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Bạn đã có tài khoản?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;