// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // MỚI: Import api từ '../services/api'
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [error, setError] = useState(null); // Giữ nguyên error state cho lỗi tải quiz
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading: authLoading, user } = useAuth(); // Lấy user từ AuthContext
  const { setAlert } = useAlert();

  // States cho modal tùy chọn làm bài
  const [showQuizOptionsModal, setShowQuizOptionsModal] = useState(false);
  const [selectedQuizIdForOptions, setSelectedQuizIdForOptions] = useState(null);
  const [quizMode, setQuizMode] = useState('review'); // 'review' (ôn tập) hoặc 'test' (kiểm tra)
  const [shuffleQuestions, setShuffleQuestions] = useState(true); // Trộn câu hỏi

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      setError(null);
      // MỚI: Sử dụng api.get. Interceptor sẽ tự thêm Authorization header
      const response = await api.get('/api/quizzes'); 
      setQuizzes(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bộ đề:', err);
      if (err.response) {
          const msg = err.response.data.msg;
          if (msg) {
            setAlert(msg, 'error');
          }
          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            err.response.data.errors.forEach(error => setAlert(error.msg, 'error'));
          } else {
            setAlert('Lỗi khi tải bộ đề. Vui lòng thử lại.', 'error');
          }
        if (err.response.status === 401) {
          setAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
          logout();
        }
      } else {
        setAlert('Lỗi mạng hoặc server không phản hồi. Vui lòng thử lại.', 'error');
      }
    } finally {
      setLoadingQuizzes(false);
    }
  }, [getToken, logout, setAlert]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchQuizzes();
    } else if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [fetchQuizzes, isAuthenticated, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    setAlert('Bạn đã đăng xuất thành công!', 'success');
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ đề này không?')) {
      try {
        // MỚI: Sử dụng api.delete. Interceptor sẽ tự thêm Authorization header
        await api.delete(`/api/quizzes/${quizId}`); 
        setAlert('Bộ đề đã được xóa thành công!', 'success');
        fetchQuizzes();
      } catch (err) {
        console.error('Lỗi khi xóa bộ đề:', err);
        if (err.response) {
          const msg = err.response.data.msg;
          if (msg) {
            setAlert(msg, 'error');
          }
          if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
            err.response.data.errors.forEach(error => setAlert(error.msg, 'error'));
          } else {
            setAlert('Xóa bộ đề thất bại! Lỗi không xác định.', 'error');
          }
          if (err.response.status === 401) {
            logout();
          }
        } else {
          setAlert('Lỗi mạng hoặc server không phản hồi. Vui lòng thử lại.', 'error');
        }
      }
    }
  };

  const handleCreateNewQuiz = () => {
    navigate('/quiz/new');
  };

  const handleManageQuiz = (quizId) => {
    navigate(`/quiz/edit/${quizId}`);
  };

  const handleStartQuizClick = (quizId) => {
    setSelectedQuizIdForOptions(quizId);
    setShowQuizOptionsModal(true);
  };

  const handleConfirmStartQuiz = () => {
    setShowQuizOptionsModal(false);
    navigate(`/quiz/take/${selectedQuizIdForOptions}?mode=${quizMode}&shuffle=${shuffleQuestions}`);
  };

  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
          <p className="text-xl text-gray-700">Đang kiểm tra xác thực...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loadingQuizzes) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang tải bộ đề...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Bảng Điều Khiển Của Bạn</h1>
          <div className="space-x-4">
            {user && user.role === 'admin' && (
              <Button primary onClick={() => navigate('/bulk-upload')}>
                Nhập Bộ Đề Hàng Loạt
              </Button>
            )}
            <Button primary onClick={handleCreateNewQuiz}>
              Tạo Bộ Đề Mới
            </Button>
            {isAuthenticated && (
                <Button secondary onClick={() => navigate('/bookmarks')}>
                    Câu Hỏi Đã Lưu
                </Button>
            )}
            <Button secondary onClick={handleLogout}>
              Đăng Xuất
            </Button>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">Bạn chưa có bộ đề nào. Hãy tạo một cái mới!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-out">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 truncate">{quiz.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>Môn: {quiz.subject}</span>
                  <span>Chủ đề: {quiz.topic || 'N/A'}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Tạo bởi: {quiz.createdBy ? quiz.createdBy.username : 'Ẩn danh'}
                </p>
                <div className="flex justify-end space-x-2">
                  <Button secondary onClick={() => handleManageQuiz(quiz._id)} className="text-xs py-1 px-3">
                    Quản lý
                  </Button>
                  <Button primary onClick={() => handleStartQuizClick(quiz._id)} className="text-xs py-1 px-3">
                    Làm Bài
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3" onClick={() => handleDeleteQuiz(quiz._id)}>
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tùy chọn làm bài */}
      {showQuizOptionsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Tùy Chọn Làm Bài</h2>

            <div className="mb-6">
              <p className="font-semibold text-gray-700 mb-2">Chế độ làm bài:</p>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="quizMode"
                  value="review"
                  checked={quizMode === 'review'}
                  onChange={(e) => setQuizMode(e.target.value)}
                  className="form-radio h-5 w-5 text-primary-blue"
                />
                <span className="ml-2 text-gray-700">Ôn tập (Xem đáp án sau mỗi câu)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="quizMode"
                  value="test"
                  checked={quizMode === 'test'}
                  onChange={(e) => setQuizMode(e.target.value)}
                  className="form-radio h-5 w-5 text-primary-blue"
                />
                <span className="ml-2 text-gray-700">Kiểm tra (Chỉ xem đáp án khi hoàn thành)</span>
              </label>
            </div>

            <div className="mb-6">
              <p className="font-semibold text-gray-700 mb-2">Thứ tự câu hỏi:</p>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="shuffleQuestions"
                  value="true"
                  checked={shuffleQuestions === true}
                  onChange={() => setShuffleQuestions(true)}
                  className="form-radio h-5 w-5 text-primary-blue"
                />
                <span className="ml-2 text-gray-700">Trộn ngẫu nhiên</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="shuffleQuestions"
                  value="false"
                  checked={shuffleQuestions === false}
                  onChange={() => setShuffleQuestions(false)}
                  className="form-radio h-5 w-5 text-primary-blue"
                />
                <span className="ml-2 text-gray-700">Thứ tự gốc</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Button secondary onClick={() => setShowQuizOptionsModal(false)}>
                Hủy
              </Button>
              <Button primary onClick={handleConfirmStartQuiz}>
                Bắt Đầu Làm Bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;