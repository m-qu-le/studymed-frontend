// src/pages/BulkUploadPage.js
import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

// MỚI: Cập nhật lại hướng dẫn để bao gồm "tags" và "difficulty"
const jsonFormatGuide = `[
  {
    "title": "Tên bộ đề mẫu",
    "description": "Mô tả ngắn gọn cho bộ đề.",
    "subject": "Môn học (ví dụ: Sinh học)",
    "topic": "Chủ đề (ví dụ: Tế bào)",
    "questions": [
      {
        "questionText": "Nội dung câu hỏi ở đây?",
        "questionType": "single-choice",
        "generalExplanation": "Giải thích chung cho câu hỏi.",
        "tags": ["tim mạch", "điện tâm đồ"],
        "difficulty": "Vận dụng",
        "options": [
          { "text": "Lựa chọn A (Sai)", "isCorrect": false, "feedback": "Giải thích tại sao A sai." },
          { "text": "Lựa chọn B (Đúng)", "isCorrect": true, "feedback": "Giải thích tại sao B đúng." },
          { "text": "Lựa chọn C (Sai)", "isCorrect": false, "feedback": "Giải thích tại sao C sai." }
        ]
      }
    ]
  }
]`;


function BulkUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const { setAlert } = useAlert();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showFormatGuide, setShowFormatGuide] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user.role !== 'admin')) {
      setAlert('Bạn không có quyền truy cập trang này.', 'error');
      navigate('/login');
    }
  }, [isAuthenticated, user, authLoading, navigate, setAlert]);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setAlert('Vui lòng chọn một file JSON để tải lên.', 'warning');
      return;
    }

    try {
      const fileContent = await selectedFile.text();
      const quizzesData = JSON.parse(fileContent);

      await api.post('/api/quizzes/bulk-upload', quizzesData);

      setAlert(`Đã nhập thành công ${quizzesData.length} bộ đề.`, 'success');
      setSelectedFile(null);
      setFileName('');
    } catch (err) {
      console.error('Lỗi khi tải lên bộ đề:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi tải lên file.', 'error');
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-700">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 text-center">Nhập Bộ Đề Hàng Loạt</h1>
        
        <div className="text-gray-600 text-sm mb-4 text-center">
          <p>Vui lòng tải lên một file JSON chứa một mảng các bộ đề.</p>
          <button 
            onClick={() => setShowFormatGuide(!showFormatGuide)} 
            className="text-blue-600 hover:underline font-semibold"
          >
            {showFormatGuide ? 'Ẩn hướng dẫn định dạng' : 'Xem hướng dẫn định dạng'}
          </button>
        </div>

        {showFormatGuide && (
          <div className="bg-gray-800 text-white rounded-lg p-4 mb-4 text-left text-xs overflow-x-auto">
            <pre><code>{jsonFormatGuide}</code></pre>
          </div>
        )}

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

        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
            <Button primary onClick={handleUpload} className="w-full" disabled={!selectedFile}>
                Tải Lên Bộ Đề
            </Button>
            <Button secondary onClick={() => navigate('/dashboard')} className="w-full">
                Về Dashboard
            </Button>
        </div>
      </div>
    </div>
  );
}

export default BulkUploadPage;