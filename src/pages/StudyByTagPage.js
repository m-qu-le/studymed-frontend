// src/pages/StudyByTagPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import InputField from '../components/InputField'; // MỚI: Thêm import bị thiếu

function StudyByTagPage() {
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const [filters, setFilters] = useState({ tags: [], difficulties: [] });
  const [loading, setLoading] = useState(true);
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  const fetchFilters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/study/filters');
      setFilters(res.data);
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

  const handleTagChange = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDifficultyChange = (difficulty) => {
    // ĐÃ SỬA: Lỗi typo 'd' thành 'difficulty'
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Chuẩn bị bắt đầu buổi học với các lựa chọn:");
    console.log("Tags:", selectedTags);
    console.log("Difficulties:", selectedDifficulties);
    console.log("Number of Questions:", numberOfQuestions);
    setAlert("Chức năng này sẽ được hoàn thiện ở bước sau!", "info");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4 md:p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 border-b pb-4">Ôn tập theo Tag</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Phần chọn Tags */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Chọn Tags</h2>
            {filters.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: selectedTags.includes(tag) ? '#e0f2fe' : '#f9fafb', borderColor: selectedTags.includes(tag) ? '#0381fe' : '#d1d5db' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      className="form-checkbox h-5 w-5 text-primary-blue rounded"
                    />
                    <span className="text-gray-800">{tag}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có tag nào trong hệ thống. Hãy thêm tag khi tạo/sửa câu hỏi.</p>
            )}
          </div>

          {/* Phần chọn Độ khó */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Chọn Độ khó</h2>
            <div className="flex flex-wrap gap-2">
              {filters.difficulties.map(difficulty => (
                <label key={difficulty} className="flex items-center space-x-2 cursor-pointer p-2 border rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: selectedDifficulties.includes(difficulty) ? '#e0f2fe' : '#f9fafb', borderColor: selectedDifficulties.includes(difficulty) ? '#0381fe' : '#d1d5db' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDifficulties.includes(difficulty)}
                    onChange={() => handleDifficultyChange(difficulty)}
                    className="form-checkbox h-5 w-5 text-primary-blue rounded"
                  />
                  <span className="text-gray-800">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phần chọn Số lượng câu hỏi */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Chọn Số lượng câu hỏi</h2>
            <InputField
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Math.max(1, parseInt(e.target.value)))}
              min="1"
              className="max-w-xs"
            />
          </div>

          <div className="flex justify-end gap-4">
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