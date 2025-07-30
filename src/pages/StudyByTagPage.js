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
  
  // State cho các lựa chọn của người dùng
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [questionCount, setQuestionCount] = useState('10');
  const [customQuestionCount, setCustomQuestionCount] = useState(50);
  const [tagFilterMode, setTagFilterMode] = useState('any'); // 'any' hoặc 'all'

  const fetchFilters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/study/filters');
      setFilters(res.data);
      // Mặc định chọn tất cả độ khó khi vừa tải xong
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalQuestionCount = questionCount === 'custom' ? customQuestionCount : parseInt(questionCount);
    
    console.log("Chuẩn bị bắt đầu buổi học với các lựa chọn:");
    console.log("Chủ đề:", selectedTags);
    console.log("Độ khó:", selectedDifficulties);
    console.log("Chế độ lọc:", tagFilterMode);
    console.log("Số lượng câu hỏi:", finalQuestionCount);
    setAlert("Chức năng này sẽ được hoàn thiện ở bước sau!", "info");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải dữ liệu...</div>;
  }

  // Component Chip để tái sử dụng
  const SelectionChip = ({ value, isSelected, onToggle }) => (
    <div
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm font-semibold border ${
        isSelected
          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
      }`}
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
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có chủ đề nào trong hệ thống.</p>
            )}
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
                />
              ))}
            </div>
          </div>

          {/* 3. Chế độ lọc */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Chế độ lọc</h2>
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="tagFilterMode" value="any" checked={tagFilterMode === 'any'} onChange={(e) => setTagFilterMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue" />
                <span className="ml-2 text-gray-700">Chứa <strong>bất kỳ</strong> chủ đề đã chọn</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="tagFilterMode" value="all" checked={tagFilterMode === 'all'} onChange={(e) => setTagFilterMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue" />
                <span className="ml-2 text-gray-700">Chứa <strong>tất cả</strong> các chủ đề đã chọn</span>
              </label>
            </div>
          </div>
          
          {/* 4. Chọn Số lượng câu hỏi */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Chọn Số lượng câu hỏi</h2>
            <div className="flex items-center gap-4">
              <select 
                value={questionCount} 
                onChange={(e) => setQuestionCount(e.target.value)}
                className="shadow-sm border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="10">10 câu</option>
                <option value="20">20 câu</option>
                <option value="30">30 câu</option>
                <option value="45">45 câu</option>
                <option value="custom">Khác...</option>
              </select>
              {questionCount === 'custom' && (
                <InputField
                  type="number"
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(Math.max(1, parseInt(e.target.value)))}
                  min="1"
                  className="max-w-xs"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6 mt-4">
            <Button secondary onClick={() => navigate('/dashboard')}>
              Quay về
            </Button>
            <Button primary type="submit">
              Bắt đầu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudyByTagPage;