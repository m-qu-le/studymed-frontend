// src/pages/BookmarkedQuestionsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Button from '../components/Button';
import BookmarkButton from '../components/BookmarkButton';

function BookmarkedQuestionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { setAlert } = useAlert();

  const [bookmarkedItems, setBookmarkedItems] = useState([]); // Lưu trữ { quizId, quizTitle, question }
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [error, setError] = useState(null);

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchBookmarkedQuestions = useCallback(async () => {
    if (!isAuthenticated) {
      setLoadingBookmarks(false);
      return;
    }
    try {
      setLoadingBookmarks(true);
      setError(null);
      const token = getToken();
      const res = await axios.get('http://localhost:5001/api/users/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookmarkedItems(res.data);
    } catch (err) {
      console.error('Lỗi khi tải câu hỏi đã bookmark:', err);
      setError('Không thể tải các câu hỏi đã bookmark.');
      setAlert(err.response?.data?.msg || 'Lỗi khi tải câu hỏi đã bookmark.', 'error');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoadingBookmarks(false);
    }
  }, [isAuthenticated, getToken, logout, setAlert]);

  useEffect(() => {
    if (!authLoading) {
      fetchBookmarkedQuestions();
    }
  }, [fetchBookmarkedQuestions, authLoading]);

  // Hàm xử lý bật/tắt bookmark từ trang này (sau khi fetch lại)
  const handleToggleBookmark = async (questionId) => {
    if (!isAuthenticated) {
      setAlert('Vui lòng đăng nhập để đánh dấu sao câu hỏi.', 'warning');
      return;
    }
    try {
      const token = getToken();
      const res = await axios.put(`http://localhost:5001/api/users/bookmark/${questionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // MỚI: Cập nhật trạng thái local thay vì fetch lại toàn bộ
      if (res.data.bookmarked) {
        setAlert('Đã thêm câu hỏi vào bookmark.', 'success');
        // Nếu muốn hiển thị ngay thì có thể thêm vào đây
        // setBookmarkedItems(prev => [...prev, { question: { _id: questionId, ... }, quizTitle: ..., quizId: ... }]);
      } else {
        setAlert('Đã xóa câu hỏi khỏi bookmark.', 'info');
        // Lọc bỏ câu hỏi khỏi danh sách hiển thị ngay lập tức
        setBookmarkedItems(prev => prev.filter(item => item.question._id !== questionId));
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi cập nhật bookmark.', 'error');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };


  if (authLoading || loadingBookmarks) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang tải câu hỏi đã bookmark...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Button primary onClick={fetchBookmarkedQuestions}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-soft-gray p-4 flex flex-col items-center">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 text-center">Câu Hỏi Đã Đánh Dấu Sao</h1>

        {bookmarkedItems.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">Bạn chưa đánh dấu sao câu hỏi nào.</p>
        ) : (
          <div className="space-y-8">
            {bookmarkedItems.map((item, index) => (
              <div key={item.question._id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1">
                    Câu hỏi {index + 1} (Bộ đề: {item.quizTitle}): {item.question.questionText}
                  </h3>
                  {isAuthenticated && (
                    <BookmarkButton
                      questionId={item.question._id}
                      isBookmarked={true} // Luôn là true trên trang này
                      onClick={handleToggleBookmark}
                      className="ml-4"
                    />
                  )}
                </div>

                {item.question.questionImage && (
                  <div className="mb-4 flex justify-center">
                    <img src={item.question.questionImage} alt="Question" className="max-w-full h-auto rounded-md shadow-sm" />
                  </div>
                )}

                <div className="space-y-4">
                  {item.question.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    return (
                      <div key={option._id} className="flex items-start p-3 border border-gray-300 rounded-lg">
                        <span className="font-semibold mr-2">{optionLetter}.</span>
                        <span className="ml-3 text-gray-800 text-base flex-1">
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-md">
                  <h4 className="font-bold mb-2">Giải thích chi tiết:</h4>
                  {item.question.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    return (
                      <div key={option._id} className="mb-2">
                        <p className="text-sm font-medium">
                          <span className={option.isCorrect ? 'text-green-700' : 'text-gray-700'}>
                            {optionLetter}. {option.isCorrect ? '(Đáp án đúng)' : ''}
                          </span>
                          <span className="italic ml-2">{option.feedback || 'Không có giải thích.'}</span>
                        </p>
                      </div>
                    );
                  })}
                  {item.question.generalExplanation && (
                    <p className="mt-2 text-sm font-medium">Giải thích chung: <span className="italic">{item.question.generalExplanation}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-8">
          <Button primary onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkedQuestionsPage;