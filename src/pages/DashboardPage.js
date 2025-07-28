// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { FiMenu } from 'react-icons/fi';

function DashboardPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading: authLoading, user } = useAuth();
  const { setAlert } = useAlert();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State cho modal tùy chọn làm bài
  const [showQuizOptionsModal, setShowQuizOptionsModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizMode, setQuizMode] = useState('review');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  // MỚI: State cho tùy chọn thời gian
  const [timeLimitOption, setTimeLimitOption] = useState('unlimited');
  const [customTimeLimit, setCustomTimeLimit] = useState(30); // Giá trị mặc định là 30 phút

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoadingQuizzes(true);
      const response = await api.get('/api/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách bộ đề:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi tải bộ đề.', 'error');
      if (err.response?.status === 401) logout();
    } finally {
      setLoadingQuizzes(false);
    }
  }, [logout, setAlert]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchQuizzes();
    } else if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [fetchQuizzes, isAuthenticated, authLoading, navigate]);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    setAlert('Bạn đã đăng xuất thành công!', 'success');
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ đề này không?')) {
      try {
        await api.delete(`/api/quizzes/${quizId}`);
        setAlert('Bộ đề đã được xóa thành công!', 'success');
        fetchQuizzes();
      } catch (err) {
        setAlert(err.response?.data?.msg || 'Xóa bộ đề thất bại!', 'error');
        if (err.response?.status === 401) logout();
      }
    }
  };

  const handleStartQuizClick = (quizId) => {
    setSelectedQuizId(quizId);
    setShowQuizOptionsModal(true);
    setTimeLimitOption('unlimited'); // Reset lại tùy chọn thời gian khi mở modal
    setCustomTimeLimit(30);
  };

  const handleConfirmStartQuiz = () => {
    if (selectedQuizId) {
      setShowQuizOptionsModal(false);
      let timeLimit = null;
      if (timeLimitOption === 'limited') {
        timeLimit = customTimeLimit * 60; // Chuyển sang giây
      }
      navigate(`/quiz/take/${selectedQuizId}?mode=${quizMode}&shuffle=${shuffleQuestions}${timeLimit ? `&timeLimit=${timeLimit}` : ''}`);
    }
  };

  if (authLoading || loadingQuizzes) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh bg-gray-100 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white flex flex-col border-r z-30
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold tracking-wider text-primary-blue">STUDYMED</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/quiz/new" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Tạo bộ đề mới
          </Link>
          {user && user.role === 'admin' && (
            <Link to="/bulk-upload" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Nhập bộ đề
            </Link>
          )}
          <Link to="/bookmarks" className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Câu hỏi đã lưu
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64">
        <header className="h-16 bg-white border-b flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 text-2xl lg:hidden"
          >
            <FiMenu />
          </button>
          <span className="text-gray-700 ml-auto">Chào bạn!</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 capitalize">{currentDate}</p>
          </div>

          {quizzes.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">Bạn chưa có bộ đề nào. Hãy tạo một cái mới!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <h2 className="text-xl font-semibold text-blue-700 mb-2 truncate">{quiz.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{quiz.description || "Không có mô tả."}</p>
                  <div className="text-xs text-gray-500 mb-4">
                    <span>Môn: {quiz.subject}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-auto flex-wrap">
                    <Button secondary onClick={() => navigate(`/quiz/edit/${quiz._id}`)} className="text-xs py-1 px-3">
                      Quản lý
                    </Button>
                    <Button primary onClick={() => handleStartQuizClick(quiz._id)} className="text-xs py-1 px-3">
                      Làm Bài
                    </Button>
                    <Button onClick={() => handleDeleteQuiz(quiz._id)} className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3">
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Xác nhận Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi StudyMed không?"
      />

      {showQuizOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Tùy Chọn Làm Bài</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Chế độ làm bài:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="quizMode" value="review" checked={quizMode === 'review'} onChange={(e) => setQuizMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Ôn tập (Xem đáp án sau mỗi câu)</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="quizMode" value="test" checked={quizMode === 'test'} onChange={(e) => setQuizMode(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Kiểm tra (Chấm điểm cuối cùng)</span>
                  </label>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Thứ tự câu hỏi:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="shuffleQuestions" checked={shuffleQuestions === true} onChange={() => setShuffleQuestions(true)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Trộn ngẫu nhiên</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="shuffleQuestions" checked={shuffleQuestions === false} onChange={() => setShuffleQuestions(false)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Thứ tự gốc</span>
                  </label>
                </div>
              </div>
              {/* MỚI: Thêm tùy chọn thời gian */}
              <div>
                <p className="font-semibold text-gray-700 mb-2">Thời gian làm bài:</p>
                <div className="flex flex-col space-y-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="timeLimit" value="unlimited" checked={timeLimitOption === 'unlimited'} onChange={(e) => setTimeLimitOption(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Không giới hạn</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="radio" name="timeLimit" value="limited" checked={timeLimitOption === 'limited'} onChange={(e) => setTimeLimitOption(e.target.value)} className="form-radio h-5 w-5 text-primary-blue"/>
                    <span className="ml-2 text-gray-700">Đếm ngược</span>
                  </label>
                  {timeLimitOption === 'limited' && (
                    <div className="mt-2">
                      <label htmlFor="customTimeLimit" className="block text-gray-700 text-sm font-semibold mb-1">Chọn số phút:</label>
                      <input
                        type="number"
                        id="customTimeLimit"
                        value={customTimeLimit}
                        onChange={(e) => setCustomTimeLimit(Math.max(1, parseInt(e.target.value)))}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <Button secondary onClick={() => setShowQuizOptionsModal(false)}>
                Hủy
              </Button>
              <Button primary onClick={handleConfirmStartQuiz}>
                Bắt Đầu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;