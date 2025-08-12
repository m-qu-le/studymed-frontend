// src/pages/BookmarkedQuestionsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Button from '../components/Button';
import BookmarkButton from '../components/BookmarkButton';

function BookmarkedQuestionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { setAlert } = useAlert();

  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarkedQuestions = useCallback(async () => {
    if (!isAuthenticated) {
      setLoadingBookmarks(false);
      return;
    }
    try {
      setLoadingBookmarks(true);
      setError(null);
      const res = await api.get('/api/users/bookmarks');
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
  }, [isAuthenticated, logout, setAlert]);

  useEffect(() => {
    if (!authLoading) {
      fetchBookmarkedQuestions();
    }
  }, [fetchBookmarkedQuestions, authLoading]);

  const handleToggleBookmark = async (questionId) => {
    try {
      await api.put(`/api/users/bookmark/${questionId}`, {});
      setAlert('Đã xóa câu hỏi khỏi bookmark.', 'info');
      setBookmarkedItems(prev => prev.filter(item => item.question._id !== questionId));
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi cập nhật bookmark.', 'error');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  if (authLoading || loadingBookmarks) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-xl text-red-600 mb-4">{error}</p><Button primary onClick={fetchBookmarkedQuestions}>Thử lại</Button></div>;
  }
  
  return (
    <div className="min-h-screen bg-soft-gray p-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-6 text-center">Câu Hỏi Đã Đánh Dấu Sao</h1>

        {bookmarkedItems.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <p className="text-gray-600 text-lg">Bạn chưa đánh dấu sao câu hỏi nào.</p>
            <Button primary onClick={() => navigate('/dashboard')} className="mt-4">Về Dashboard</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {bookmarkedItems.map((item, index) => (
              // Đây là thẻ chứa toàn bộ một câu hỏi, giờ có shadow và nền trắng
              <div key={item.question._id} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                
                {/* Hiển thị Case Stem nếu có */}
                {item.question.caseStem && (
                   <div className="mb-6 p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
                     <h3 className="font-semibold text-indigo-800 mb-2">Tình huống lâm sàng:</h3>
                     <p className="text-gray-700 whitespace-pre-wrap">{item.question.caseStem}</p>
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1">
                    Câu hỏi {index + 1}: {item.question.questionText}
                  </h3>
                  <BookmarkButton
                    questionId={item.question._id}
                    isBookmarked={true}
                    onClick={() => handleToggleBookmark(item.question._id)}
                    className="ml-4 flex-shrink-0"
                  />
                </div>
                
                {/* BỐ CỤC 2 CỘT MỚI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

                  {/* CỘT 1: HIỂN THỊ CÂU HỎI NHƯ KHI LÀM BÀI */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Các lựa chọn:</h4>
                    {item.question.options.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      return (
                        <div key={option._id} className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <span className="font-semibold text-gray-500 mr-3">{optionLetter}.</span>
                          <span className="text-gray-800">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* CỘT 2: ĐÁP ÁN & GIẢI THÍCH CHI TIẾT */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-3">Đáp án & Giải thích:</h4>
                    <div className="space-y-3">
                      {item.question.options.map((option, idx) => (
                        <div key={option._id}>
                          <div className="flex items-center">
                            <span className="font-bold mr-2">{option.isCorrect ? '✅' : '❌'}</span>
                            <p className={`font-semibold ${option.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                              Lựa chọn {String.fromCharCode(65 + idx)}
                            </p>
                          </div>
                          {option.feedback && (
                            <p className="text-sm text-gray-600 italic pl-7">{option.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {item.question.generalExplanation && (
                      <div className="mt-4 pt-3 border-t border-blue-200">
                        <p className="font-semibold text-blue-800">Giải thích chung:</p>
                        <p className="text-sm text-gray-700 italic">{item.question.generalExplanation}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
         <div className="flex justify-center mt-8">
          <Button secondary onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkedQuestionsPage;