// src/pages/BulkUploadPage.js
import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

// ĐÃ SỬA: Hướng dẫn định dạng JSON chi tiết và đầy đủ hơn
const jsonFormatGuide = `[
  {
    "title": "Bộ đề Hướng dẫn Chi tiết",
    "description": "Mô tả: Bộ đề này minh họa tất cả các cấu trúc và trường dữ liệu hợp lệ.",
    "subject": "Môn học (Bắt buộc)",
    "topic": "Chủ đề (Tùy chọn)",
    "questions": [
      {
        "type": "single",
        "questionText": "Đây là câu hỏi ĐƠN loại MỘT ĐÁP ÁN (single-choice). Tất cả các trường tùy chọn đều được điền.",
        "questionType": "single-choice",
        "generalExplanation": "Đây là giải thích chung cho toàn bộ câu hỏi, sẽ hiện ra sau khi người dùng trả lời.",
        "tags": ["minh-hoa", "cau-hoi-don", "day-du-truong"],
        "difficulty": "Thông hiểu",
        "options": [
          { "text": "Lựa chọn 1 (Sai)", "isCorrect": false, "feedback": "Giải thích chi tiết tại sao lựa chọn này sai." },
          { "text": "Lựa chọn 2 (Đúng)", "isCorrect": true, "feedback": "Giải thích chi tiết tại sao đây là đáp án đúng." },
          { "text": "Lựa chọn 3 (Sai)", "isCorrect": false, "feedback": "Giải thích chi tiết tại sao lựa chọn này cũng sai." }
        ]
      },
      {
        "type": "single",
        "questionText": "Đây là câu hỏi ĐƠN loại NHIỀU ĐÁP ÁN (multi-select). Có thể có nhiều 'isCorrect: true'.",
        "questionType": "multi-select",
        "tags": ["multi-select"],
        "difficulty": "Vận dụng",
        "options": [
          { "text": "Lựa chọn A (Đáp án đúng 1/2)", "isCorrect": true },
          { "text": "Lựa chọn B (Sai)", "isCorrect": false },
          { "text": "Lựa chọn C (Đáp án đúng 2/2)", "isCorrect": true },
          { "text": "Lựa chọn D (Sai)", "isCorrect": false }
        ]
      },
      {
        "type": "single",
        "questionText": "Đây là câu hỏi ĐƠN loại ĐÚNG/SAI (true-false). Các lựa chọn là cố định.",
        "questionType": "true-false",
        "difficulty": "Nhận biết",
        "options": [
          { "text": "Đúng", "isCorrect": true },
          { "text": "Sai", "isCorrect": false }
        ]
      },
      {
        "type": "group",
        "caseStem": "Đây là phần mô tả tình huống lâm sàng chung (case stem). Nội dung này sẽ được hiển thị cùng với tất cả các câu hỏi con bên dưới.",
        "tags": ["case-study", "lam-sang"],
        "difficulty": "Vận dụng cao",
        "childQuestions": [
          {
            "questionText": "Dựa vào case study trên, đây là câu hỏi con số 1 (loại một đáp án).",
            "questionType": "single-choice",
            "tags": ["chan-doan"],
            "difficulty": "Vận dụng",
            "generalExplanation": "Giải thích chung cho câu hỏi con này.",
            "options": [
              { "text": "Lựa chọn cho câu hỏi con 1 (Đúng)", "isCorrect": true, "feedback": "Feedback cho lựa chọn này." },
              { "text": "Lựa chọn cho câu hỏi con 1 (Sai)", "isCorrect": false }
            ]
          },
          {
            "questionText": "Dựa vào case study trên, đây là câu hỏi con số 2 (loại nhiều đáp án).",
            "questionType": "multi-select",
            "tags": ["dieu-tri"],
            "difficulty": "Vận dụng cao",
            "options": [
              { "text": "Lựa chọn cho câu hỏi con 2 (Đúng)", "isCorrect": true },
              { "text": "Lựa chọn cho câu hỏi con 2 (Cũng đúng)", "isCorrect": true },
              { "text": "Lựa chọn cho câu hỏi con 2 (Sai)", "isCorrect": false }
            ]
          }
        ]
      }
    ]
  }
]`;


function BulkUploadPage() {
  const [inputType, setInputType] = useState('file');
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText('');
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ chọn file JSON.', 'error');
    }
  };

  const handleTextChange = (event) => {
    setJsonText(event.target.value);
    if (selectedFile) {
      setSelectedFile(null);
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

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setFileName(file.name);
      setJsonText('');
    } else {
      setSelectedFile(null);
      setFileName('');
      setAlert('Vui lòng chỉ kéo thả file JSON.', 'error');
    }
  }, [setAlert]);

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
      } else {
        if (jsonText.trim() === '') {
          setAlert('Vui lòng dán nội dung JSON vào ô text.', 'warning');
          return;
        }
        quizzesData = JSON.parse(jsonText);
      }
    } catch (parseError) {
      console.error('Lỗi cú pháp JSON:', parseError);
      setAlert('Nội dung JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.', 'error');
      return;
    }

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