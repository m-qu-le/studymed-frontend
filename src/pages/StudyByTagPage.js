// src/pages/StudyByTagPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import InputField from '../components/InputField';

function StudyByTagPage() {
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const [filters, setFilters] = useState({ tags: [], difficulties: [] });
  const [loading, setLoading] = useState(true);
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [questionCount, setQuestionCount] = useState('10');
  const [customQuestionCount, setCustomQuestionCount] = useState(50);
  const [tagFilterMode, setTagFilterMode] = useState('any');

  // MỚI: Định nghĩa map màu cho các mức độ khó
  const difficultyColorMap = {
    'Nhận biết': { normal: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200', selected: 'bg-green-500 text-white border-green-500' },
    'Thông hiểu': { normal: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200', selected: 'bg-blue-500 text-white border-blue-500' },
    'Vận dụng': { normal: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200', selected: 'bg-yellow-500 text-white border-yellow-500' },
    'Vận dụng cao': { normal: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200', selected: 'bg-red-500 text-white border-red-500' }
  };

  const fetchFilters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/study/filters');
      setFilters(res.data);
      if (res.data.difficulties) {
        setSelectedDifficulties(res.data.difficulties);
      }
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Không thể tải các bộ lọc.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [setAlert, navigate]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleToggleSelection = (item, selectedItems, setSelectedItems) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalQuestionCount = questionCount === 'custom' ? customQuestionCount : parseInt(questionCount);
    
    try {
      const criteria = {
        tags: selectedTags,
        difficulties: selectedDifficulties,
        numberOfQuestions: finalQuestionCount,
        tagFilterMode,
      };
      const res = await api.post('/api/study/session', criteria);
      navigate('/quiz/take/virtual', { state: { virtualQuiz: res.data } });
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Không thể tạo buổi ôn tập.', 'error');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải dữ liệu...</div>;
  }

  const SelectionChip = ({ value, isSelected, onToggle, className = '' }) => (
    <div
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm font-semibold border ${className}`}
    >
      {value}
    </div>
  );

  return (
    <div className="min-h-screen bg-soft-gray p-4 md:p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 border-b pb-4">Tùy chọn ôn tập</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Chọn Chủ đề */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Chọn Chủ đề</h2>
            {filters.tags.length > 0 ? (
              <div className="max-h-48 overflow-y-auto border p-3 rounded-lg bg-gray-50 flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                   <SelectionChip
                    key={tag}
                    value={tag}
                    isSelected={selectedTags.includes(tag)}
                    onToggle={() => handleToggleSelection(tag, selectedTags, setSelectedTags)}
                    className={selectedTags.includes(tag) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}
                  />
                ))}
              </div>
            ) : <p className="text-gray-500">Chưa có chủ đề nào trong hệ thống.</p>}
          </div>

          {/* 2. Chọn Độ khó */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Chọn Độ khó</h2>
            <div className="flex flex-wrap gap-2">
              {filters.difficulties.map(difficulty => (
                <SelectionChip
                  key={difficulty}
                  value={difficulty}
                  isSelected={selectedDifficulties.includes(difficulty)}
                  onToggle={() => handleToggleSelection(difficulty, selectedDifficulties, setSelectedDifficulties)}
                  className={selectedDifficulties.includes(difficulty) ? difficultyColorMap[difficulty]?.selected : difficultyColorMap[difficulty]?.normal}
                />
              ))}
            </div>
          </div>

          {/* 3. Chế độ lọc */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Chế độ lọc</h2>
            {/* ĐÃ SỬA: Responsive cho các lựa chọn */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="tagFilterMode" value="any" checked={tagFilterMode === 'any'} onChange={(e) => setTagFilterMode(e.target.value)} className="form-radio h-5 w-5 text-red-500 focus:ring-red-500" />
                <span className="ml-2 text-gray-700">Chứa <strong>bất kỳ</strong> chủ đề đã chọn</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="tagFilterMode" value="all" checked={tagFilterMode === 'all'} onChange={(e) => setTagFilterMode(e.target.value)} className="form-radio h-5 w-5 text-red-500 focus:ring-red-500" />
                <span className="ml-2 text-gray-700">Chứa <strong>tất cả</strong> các chủ đề đã chọn</span>
              </label>
            </div>
          </div>
          
          {/* 4. Chọn Số lượng câu hỏi */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Chọn Số lượng câu hỏi</h2>
            <div className="flex items-center gap-4">
              {/* ĐÃ SỬA: Cải thiện giao diện select box */}
              <select 
                value={questionCount} 
                onChange={(e) => setQuestionCount(e.target.value)}
                className="shadow-sm border border-gray-300 rounded-lg py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue w-full md:w-auto md:min-w-[200px]"
              >
                <option value="10">10 câu</option>
                <option value="20">20 câu</option>
                <option value="30">30 câu</option>
                <option value="45">45 câu</option>
                <option value="custom">Khác...</option>
              </select>
              {questionCount === 'custom' && (
                <InputField type="number" value={customQuestionCount} onChange={(e) => setCustomQuestionCount(Math.max(1, parseInt(e.target.value)))} min="1" className="max-w-xs"/>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6 mt-4">
            <Button secondary onClick={() => navigate('/dashboard')}>Quay về</Button>
            <Button primary type="submit">Bắt đầu</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudyByTagPage;