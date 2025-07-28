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

      {/* Sidebar */}
      {/* ĐÃ SỬA: Bỏ `lg:fixed` để sidebar luôn `fixed`, giúp transform hoạt động đúng */}
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

      {/* Main Content */}
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
                  {/* ĐÃ SỬA: Thêm `flex-wrap` để các nút tự xuống dòng */}
                  <div className="flex justify-end gap-2 mt-auto flex-wrap">
                    <Button secondary onClick={() => navigate(`/quiz/edit/${quiz._id}`)} className="text-xs py-1 px-3">
                      Quản lý
                    </Button>
                    <Button primary onClick={() => navigate(`/quiz/take/${quiz._id}`)} className="text-xs py-1 px-3">
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
    </div>
  );
}

export default DashboardPage;