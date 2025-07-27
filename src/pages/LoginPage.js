// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import StudyMedIcon from '../components/StudyMedIcon'; // MỚI: Import icon

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

      const res = await api.post('/api/auth/login', userCredentials);

      localStorage.setItem('token', res.data.token);
      console.log('Đăng nhập thành công! Token:', res.data.token);
      setAlert('Đăng nhập thành công!', 'success');
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err.response && err.response.data.msg);
      setAlert(err.response && err.response.data.msg ? err.response.data.msg : 'Đăng nhập thất bại!', 'error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-soft-gray p-4"> {/* min-h-screen thay vì calc(100vh-80px) */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"> {/* Thêm text-center */}
        {/* MỚI: Hình minh họa và tên ứng dụng */}
        <div className="flex flex-col items-center mb-6">
          <StudyMedIcon className="w-20 h-20 text-primary-blue mb-2" /> {/* Kích thước icon */}
          <h1 className="text-4xl font-bold text-primary-blue">StudyMed</h1> {/* Tên ứng dụng */}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Đăng Nhập Tài Khoản</h2> {/* Thay đổi tiêu đề chính */}

        <form onSubmit={onSubmit}>
          <InputField
            // label="Email" // ĐÃ BỎ LABEL
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email" // MỚI: Placeholder làm label
            required
          />
          <InputField
            // label="Mật khẩu" // ĐÃ BỎ LABEL
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Mật khẩu" // MỚI: Placeholder làm label
            required
          />
          <Button primary type="submit" className="w-full mt-6 py-3 text-lg"> {/* Điều chỉnh kích thước nút */}
            Đăng Nhập
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm"> {/* Điều chỉnh font size */}
          Bạn chưa có tài khoản?{' '}
          <a href="/register" className="text-primary-blue hover:underline font-medium"> {/* Điều chỉnh màu và font-weight */}
            Đăng ký ngay
          </a>
        </p>
        {/* Có thể thêm link Quên mật khẩu sau này */}
        {/* <p className="mt-2 text-center text-gray-600 text-sm">
            Quên mật khẩu? <a href="/forgot-password" className="text-primary-blue hover:underline font-medium">Nhấp vào đây</a>
        </p> */}
      </div>
    </div>
  );
}

export default LoginPage;