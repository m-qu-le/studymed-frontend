// src/pages/BulkUploadPage.js
import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

// Hướng dẫn định dạng JSON giữ nguyên
const jsonFormatGuide = `[
  {
    "title": "Bộ đề Hướng dẫn Chi tiết",
    "description": "Mô tả: Bộ đề này minh họa tất cả các cấu trúc và trường dữ liệu hợp lệ.",
    "subject": "Môn học (Bắt buộc)",
    "topic": "Chủ đề (Tùy chọn)",
    "questions": [
      {
        "type": "single",
        "questionText": "Đây là câu hỏi ĐƠN loại MỘT ĐÁP ÁN (single-choice).",
        "questionType": "single-choice",
        "generalExplanation": "Giải thích chung cho câu hỏi.",
        "tags": ["minh-hoa", "cau-hoi-don"],
        "difficulty": "Thông hiểu",
        "options": [
          { "text": "Lựa chọn 1 (Đúng)", "isCorrect": true, "feedback": "Feedback cho đáp án đúng." },
          { "text": "Lựa chọn 2 (Sai)", "isCorrect": false, "feedback": "Feedback cho đáp án sai." }
        ]
      },
      {
        "type": "group",
        "caseStem": "Đây là phần mô tả tình huống lâm sàng chung (case stem).",
        "tags": ["case-study", "lam-sang"],
        "difficulty": "Vận dụng cao",
        "childQuestions": [
          {
            "questionText": "Dựa vào case study trên, đây là câu hỏi con số 1.",
            "questionType": "multi-select",
            "options": [
              { "text": "Lựa chọn cho câu hỏi con (Đúng)", "isCorrect": true },
              { "text": "Lựa chọn khác (Cũng đúng)", "isCorrect": true }
            ]
          }
        ]
      }
    ]
  }
]`;


function BulkUploadPage() {
  // STATE MỚI: Thêm state để quản lý loại nhập liệu và nội dung text
  const [inputType, setInputType] = useState('file'); // 'file' hoặc 'paste'
  const [jsonText, setJsonText] = useState('');
  
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

  // CẬP NHẬT: Khi chọn file, xóa nội dung trong ô text
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText(''); // Xóa text đã dán
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ chọn file JSON.', 'error');
    }
  };

  // HÀM MỚI: Xử lý khi dán text
  const handleTextChange = (event) => {
    setJsonText(event.target.value);
    if (selectedFile) {
      setSelectedFile(null); // Xóa file đã chọn
      setFileName('');
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);
  
  // CẬP NHẬT: Khi kéo thả file, xóa nội dung trong ô text
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText(''); // Xóa text đã dán
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ kéo thả file JSON.', 'error');
    }
  }, [setAlert]);

  // CẬP NHẬT: Logic upload xử lý cả hai trường hợp
  const handleUpload = async () => {
    let quizzesData;

    try {
      if (inputType === 'file') {
        if (!selectedFile) {
          setAlert('Vui lòng chọn một file JSON để tải lên.', 'warning');
          return;
        }
        const fileContent = await selectedFile.text();
        quizzesData = JSON.parse(fileContent);
      } else { // inputType === 'paste'
        if (jsonText.trim() === '') {
          setAlert('Vui lòng dán nội dung JSON vào ô text.', 'warning');
          return;
        }
        quizzesData = JSON.parse(jsonText); // Thêm try-catch ở đây để báo lỗi JSON không hợp lệ
      }
    } catch (parseError) {
      console.error('Lỗi cú pháp JSON:', parseError);
      setAlert('Nội dung JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.', 'error');
      return;
    }
    
    // Gửi dữ liệu đã được parse lên API
    try {
      await api.post('/api/quizzes/bulk-upload', quizzesData);
      setAlert(`Đã nhập thành công ${Array.isArray(quizzesData) ? quizzesData.length : 1} bộ đề.`, 'success');
      setSelectedFile(null);
      setFileName('');
      setJsonText('');
    } catch (apiError) {
      console.error('Lỗi khi tải lên bộ đề:', apiError);
      setAlert(apiError.response?.data?.msg || 'Lỗi khi tải lên file.', 'error');
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
          <p>Vui lòng tải lên một file JSON hoặc dán trực tiếp nội dung.</p>
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

        {/* UI MỚI: Giao diện Tab để chọn phương thức nhập */}
        <div className="flex border-b border-gray-200 mb-4">
            <button 
                onClick={() => setInputType('file')}
                className={`py-2 px-4 font-semibold text-sm ${inputType === 'file' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Tải lên từ File
            </button>
            <button 
                onClick={() => setInputType('paste')}
                className={`py-2 px-4 font-semibold text-sm ${inputType === 'paste' ? 'border-b-2 border-primary-blue text-primary-blue' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                Dán trực tiếp
            </button>
        </div>

        {/* Hiển thị UI tương ứng với Tab được chọn */}
        {inputType === 'file' && (
            <div
                className={`border-2 border-dashed ${isDragOver ? 'border-primary-blue-active bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer transition-all duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input type="file" id="fileInput" accept="application/json" onChange={handleFileChange} className="hidden" />
                <p className="text-gray-500 mb-2">Kéo và thả file JSON vào đây, hoặc nhấp để chọn file</p>
                {fileName && (<p className="text-gray-700 font-semibold">File đã chọn: {fileName}</p>)}
            </div>
        )}

        {inputType === 'paste' && (
            <div>
                <textarea
                    value={jsonText}
                    onChange={handleTextChange}
                    placeholder="Dán nội dung JSON của bạn vào đây..."
                    className="w-full h-48 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-200 font-mono text-sm"
                />
            </div>
        )}

        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
            <Button 
                primary 
                onClick={handleUpload} 
                className="w-full" 
                // Cập nhật điều kiện disabled
                disabled={(inputType === 'file' && !selectedFile) || (inputType === 'paste' && jsonText.trim() === '')}
            >
                Tải Lên và Xử Lý
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