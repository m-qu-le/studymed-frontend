// src/pages/BulkUploadPage.js
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false); // State cho hiệu ứng kéo thả
  const { setAlert } = useAlert();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user.role !== 'admin')) {
      setAlert('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản admin.', 'error');
      navigate('/login'); // Điều hướng về trang login nếu không phải admin
    }
  }, [isAuthenticated, user, authLoading, navigate, setAlert]);

  // Xử lý khi chọn file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ chọn file JSON.', 'error');
    }
  };

  // Xử lý kéo thả file
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ kéo thả file JSON.', 'error');
    }
  }, [setAlert]);

  // Xử lý tải lên file
  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert('Vui lòng chọn một file JSON để tải lên.', 'warning');
      return;
    }

    // Đảm bảo người dùng là admin
    if (!isAuthenticated || user.role !== 'admin') {
      setAlert('Bạn không có quyền tải lên file. (Chỉ admin).', 'error');
      return;
    }

    try {
      const fileContent = await selectedFile.text(); // Đọc nội dung file
      const quizzesData = JSON.parse(fileContent); // Parse JSON

      const token = localStorage.getItem('token'); // Lấy token

      const res = await axios.post('http://localhost:5001/api/quizzes/bulk-upload', quizzesData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setAlert(res.data.msg || 'Tải lên bộ đề thành công!', 'success');
      setSelectedFile(null); // Reset trạng thái
      setFileName('');
      // Có thể điều hướng về dashboard hoặc hiển thị danh sách quiz mới
      // navigate('/dashboard');
    } catch (err) {
      console.error('Lỗi khi tải lên bộ đề:', err);
      if (err.response) {
        const msg = err.response.data.msg;
        if (msg) {
          setAlert(msg, 'error');
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach(error => setAlert(error.msg, 'error'));
        } else {
          setAlert('Lỗi từ server khi tải lên. Vui lòng kiểm tra định dạng JSON.', 'error');
        }
      } else if (err.message === 'JSON.parse') { // Lỗi khi file không phải JSON hợp lệ
         setAlert('Định dạng file JSON không hợp lệ. Vui lòng kiểm tra lại.', 'error');
      } else {
        setAlert('Lỗi mạng hoặc không thể tải lên file.', 'error');
      }
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }
  // Component này chỉ render nếu user là admin
  if (!isAuthenticated || user.role !== 'admin') {
    return null; // Đã điều hướng trong useEffect
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full"> {/* Tăng max-w */}
        <h1 className="text-3xl font-bold text-primary-blue mb-6 text-center">Nhập Bộ Đề Hàng Loạt</h1>
        <p className="text-gray-600 text-sm mb-4 text-center">
          Vui lòng tải lên một file JSON chứa một mảng các bộ đề. Mỗi bộ đề phải tuân thủ cấu trúc mới (bao gồm `questionType` và `options` chi tiết).
          Xem <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); alert('Hướng dẫn cấu trúc JSON sẽ được cung cấp tại đây.'); }}>hướng dẫn định dạng</a>.
        </p>

        {/* Khu vực kéo thả */}
        <div
          className={`border-2 border-dashed ${isDragOver ? 'border-primary-blue-active bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer transition-all duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            type="file"
            id="fileInput"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-gray-500 mb-2">
            Kéo và thả file JSON vào đây, hoặc nhấp để chọn file
          </p>
          {fileName && (
            <p className="text-gray-700 font-semibold">File đã chọn: {fileName}</p>
          )}
        </div>

        <Button primary onClick={handleUpload} className="w-full mt-6" disabled={!selectedFile}>
          Tải Lên Bộ Đề
        </Button>
      </div>
    </div>
  );
}

export default BulkUploadPage;