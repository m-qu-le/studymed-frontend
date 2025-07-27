// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import StudyMedIcon from '../components/StudyMedIcon'; // MỚI: Import icon

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

        const res = await api.post('/api/auth/register', newUser);

        console.log('Đăng ký thành công:', res.data.token);
        setAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        navigate('/login');
      } catch (err) {
        console.error('Lỗi đăng ký:', err.response && err.response.data.msg);
        setAlert(err.response && err.response.data.msg ? err.response.data.msg : 'Đăng ký thất bại!', 'error');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-soft-gray p-4"> {/* min-h-screen thay vì calc(100vh-80px) để nó bao trùm toàn bộ */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"> {/* Thêm text-center */}
        {/* MỚI: Hình minh họa và tên ứng dụng */}
        <div className="flex flex-col items-center mb-6">
          <StudyMedIcon className="w-20 h-20 text-primary-blue mb-2" /> {/* Kích thước icon */}
          <h1 className="text-4xl font-bold text-primary-blue">StudyMed</h1> {/* Tên ứng dụng */}
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tạo Tài Khoản Mới</h2> {/* Thay đổi tiêu đề chính */}

        <form onSubmit={onSubmit}>
          <InputField
            // label="Tên đăng nhập" // ĐÃ BỎ LABEL
            type="text"
            name="username"
            value={username}
            onChange={onChange}
            placeholder="Tên đăng nhập" // MỚI: Placeholder làm label
            required
          />
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
            minLength="6"
          />
          <InputField
            // label="Xác nhận mật khẩu" // ĐÃ BỎ LABEL
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            placeholder="Xác nhận mật khẩu" // MỚI: Placeholder làm label
            required
          />
          <Button primary type="submit" className="w-full mt-6 py-3 text-lg"> {/* Điều chỉnh kích thước nút */}
            Đăng Ký
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm"> {/* Điều chỉnh font size */}
          Bạn đã có tài khoản?{' '}
          <a href="/login" className="text-primary-blue hover:underline font-medium"> {/* Điều chỉnh màu và font-weight */}
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;