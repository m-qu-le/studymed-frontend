// src/pages/QuizReviewPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import BookmarkButton from '../components/BookmarkButton';
import ExplanationBlock from '../components/ExplanationBlock';

function QuizReviewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, logout } = useAuth();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState(null);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/users/bookmarks');
      setBookmarkedQuestions(new Set(res.data.map(q => q.question._id)));
    } catch (err) {
      console.error('Lỗi khi tải bookmarks:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    const setupQuizData = (data) => {
      setQuiz(data);
      if (location.state?.userAnswers) {
        setUserAnswers(location.state.userAnswers);
      }
      
      const flatQuestions = [];
      if (data && data.questions) {
        data.questions.forEach(item => {
          if (item.type === 'single') {
            flatQuestions.push(item);
          } else if (item.type === 'group' && item.childQuestions) {
            item.childQuestions.forEach(child => {
              flatQuestions.push({
                ...child,
                caseStem: item.caseStem
              });
            });
          }
        });
      }
      setDisplayQuestions(flatQuestions);
      setLoading(false);
    };

    const fetchQuizById = async () => {
      try {
        const res = await api.get(`/api/quizzes/${id}`);
        setupQuizData(res.data);
      } catch (err) {
        setAlert('Không thể tải bộ đề để xem lại.', 'error');
        navigate('/dashboard');
      }
    };

    if (location.state?.quizData) {
      setupQuizData(location.state.quizData);
    } else if (id && id !== 'virtual') {
      fetchQuizById();
    } else {
      setAlert('Không có dữ liệu để xem lại.', 'error');
      navigate('/dashboard');
    }
  }, [id, location.state, navigate, setAlert]);


  const handleToggleBookmark = async (questionId) => {
    if (!isAuthenticated) {
      setAlert('Vui lòng đăng nhập để đánh dấu sao câu hỏi.', 'warning');
      return;
    }
    try {
      const res = await api.put(`/api/users/bookmark/${questionId}`, {});
      if (res.data.bookmarked) {
        setAlert('Đã thêm câu hỏi vào bookmark.', 'success');
        setBookmarkedQuestions(prev => new Set(prev).add(questionId));
      } else {
        setAlert('Đã xóa câu hỏi khỏi bookmark.', 'info');
        setBookmarkedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật bookmark:', err);
      setAlert(err.response?.data?.msg || 'Lỗi khi cập nhật bookmark.', 'error');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };
  
  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  }

  if (!quiz) {
    return <div className="flex justify-center items-center min-h-screen">Không tìm thấy dữ liệu bộ đề.</div>;
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex flex-col items-center">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-primary-blue mb-4 text-center">Xem Lại Bài Làm: {quiz.title}</h1>
        <p className="text-gray-700 text-lg mb-6 text-center">{quiz.description}</p>

        <div className="space-y-8">
          {displayQuestions.map((question, qIndex) => {
            const prevQuestion = displayQuestions[qIndex - 1];
            const userAnswerIds = userAnswers[question._id] || [];
            const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(o => o._id);
            const isCorrectQuestion = (userAnswerIds.length === correctOptionIds.length) &&
                                       userAnswerIds.every(id => correctOptionIds.includes(id));
            const questionBorderClass = isCorrectQuestion ? 'border-green-500' : 'border-red-500';

            return (
              <div key={question._id || qIndex}>
                {/* Hiển thị CaseStem nếu có */}
                {question.caseStem && (question.caseStem !== prevQuestion?.caseStem) && (
                  <div className="mb-4 p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
                    <h3 className="font-semibold text-indigo-800 mb-2">Tình huống lâm sàng:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{question.caseStem}</p>
                  </div>
                )}
                
                {/* Phần hiển thị chi tiết câu hỏi (đã khôi phục) */}
                <div className={`bg-gray-50 p-6 rounded-lg shadow-md border-l-4 ${questionBorderClass}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex-1">
                      Câu {qIndex + 1}: {question.questionText}
                    </h3>
                    {isAuthenticated && (
                      <BookmarkButton
                        questionId={question._id}
                        isBookmarked={bookmarkedQuestions.has(question._id)}
                        onClick={() => handleToggleBookmark(question._id)}
                        className="ml-4"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    {question.options.map((option, idx) => {
                      const isUserSelected = userAnswerIds.includes(option._id);
                      const isCorrect = option.isCorrect;
                      const optionLetter = String.fromCharCode(65 + idx);

                      let optionClass = 'p-3 rounded-lg border flex items-start';
                      if (isUserSelected && isCorrect) {
                        optionClass += ' bg-green-100 border-green-500';
                      } else if (isUserSelected && !isCorrect) {
                        optionClass += ' bg-red-100 border-red-500';
                      } else if (isCorrect) {
                        optionClass += ' bg-green-50 border-green-300';
                      } else {
                        optionClass += ' border-gray-300';
                      }

                      return (
                        <div key={option._id} className={optionClass}>
                          <input
                            type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                            checked={isUserSelected}
                            disabled
                            className={`mt-1 h-5 w-5 ${isUserSelected && isCorrect ? 'text-green-600' : isUserSelected && !isCorrect ? 'text-red-600' : 'text-gray-400'} ${question.questionType === 'multi-select' ? 'form-checkbox rounded' : 'form-radio'}`}
                          />
                          <span className="ml-3 text-gray-800 text-base flex-1">
                            <span className="font-semibold mr-2">{optionLetter}.</span>
                            {option.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <ExplanationBlock
                    question={question}
                    userAnswers={userAnswers[question._id]}
                    mode="reviewPage" 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <Button primary onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizReviewPage;