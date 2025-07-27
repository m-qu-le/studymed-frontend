// src/pages/QuizReviewPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import BookmarkButton from '../components/BookmarkButton';

function QuizReviewPage() {
  const { id } = useParams(); // Quiz ID từ URL
  const location = useLocation(); // Lấy state được truyền từ navigate (chứa userAnswers và shuffledOptionsOrder)
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [shuffledOptionsOrder, setShuffledOptionsOrder] = useState({});

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]); // State để lưu danh sách các câu hỏi đã bookmark


  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchBookmarks = useCallback(async () => {
      if (!isAuthenticated) return;
      try {
          const token = getToken();
          const res = await axios.get('http://localhost:5001/api/users/bookmarks', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setBookmarkedQuestions(res.data.map(q => q.question._id));
      } catch (err) {
          console.error('Lỗi khi tải bookmarks:', err);
          if (err.response?.status === 401) {
              logout();
          }
      }
  }, [isAuthenticated, getToken, logout]);

  useEffect(() => {
      fetchBookmarks();
  }, [fetchBookmarks]);


  // Fetch quiz data and user answers
  useEffect(() => {
    if (!id) {
      setAlert('Không tìm thấy ID bộ đề để xem lại.', 'error');
      navigate('/dashboard');
      return;
    }

    if (location.state && location.state.userAnswers) {
      setUserAnswers(location.state.userAnswers);
    } else {
      setAlert('Không có dữ liệu câu trả lời để xem lại.', 'warning');
    }

    // Lấy thứ tự đáp án đã trộn nếu có từ state
    if (location.state && location.state.shuffledOptionsOrder) {
        setShuffledOptionsOrder(location.state.shuffledOptionsOrder);
    }

    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        setError(null);
        const token = getToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await axios.get(`http://localhost:5001/api/quizzes/${id}`, { headers });

        let fetchedQuiz = res.data;
        // Nếu có thứ tự đáp án đã trộn từ trước, áp dụng nó
        if (fetchedQuiz.questions && Object.keys(shuffledOptionsOrder).length > 0) {
            fetchedQuiz.questions = fetchedQuiz.questions.map(q => {
                if (shuffledOptionsOrder[q._id]) {
                    const originalOptions = [...q.options];
                    q.options = shuffledOptionsOrder[q._id].map(optId => originalOptions.find(o => o._id === optId));
                }
                return q;
            });
        }
        setQuiz(fetchedQuiz);
      } catch (err) {
        console.error('Lỗi khi tải bộ đề để xem lại:', err);
        if (err.response && err.response.status === 404) {
          setError('Bộ đề không tìm thấy hoặc bạn không có quyền truy cập.');
          setAlert('Bộ đề không tìm subdocument hoặc bạn không có quyền truy cập.', 'error');
        } else if (err.response && err.response.status === 403) {
          setError('Bạn không có quyền truy cập bộ đề này.');
          setAlert('Bạn không có quyền truy cập bộ đề này.', 'error');
        } else {
          setError('Lỗi khi tải bộ đề. Vui lòng thử lại.');
          setAlert('Lỗi khi tải bộ đề. Vui lòng thử lại.', 'error');
        }
        navigate('/dashboard');
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuiz();
  }, [id, navigate, setAlert, getToken, location.state, shuffledOptionsOrder]);

  // MỚI: Hàm xử lý đánh dấu sao
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

          if (res.data.bookmarked) {
              setAlert('Đã thêm câu hỏi vào bookmark.', 'success');
              setBookmarkedQuestions(prev => [...prev, questionId]);
          } else {
              setAlert('Đã xóa câu hỏi khỏi bookmark.', 'info');
              setBookmarkedQuestions(prev => prev.filter(id => id !== questionId));
          }
      } catch (err) {
          console.error('Lỗi khi cập nhật bookmark:', err);
          setAlert(err.response?.data?.msg || 'Lỗi khi cập nhật bookmark.', 'error');
          if (err.response?.status === 401) {
              logout();
          }
      }
  };


  if (authLoading || loadingQuiz) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang tải bộ đề để xem lại...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <Button primary onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Bộ đề này không có câu hỏi nào hoặc không tìm thấy bộ đề để xem lại.</p>
        <Button primary className="mt-4" onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-soft-gray p-4 flex flex-col items-center">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-4 text-center">Xem Lại Bài Làm: {quiz.title}</h1>
        <p className="text-gray-700 text-lg mb-6 text-center">{quiz.description}</p>

        <div className="space-y-8">
          {quiz.questions.map((question, qIndex) => {
            const userAnswerIds = userAnswers[question._id] || [];
            const isCorrectQuestion = (userAnswerIds.length === question.options.filter(opt => opt.isCorrect).length) &&
                                       userAnswerIds.every(id => question.options.filter(opt => opt.isCorrect).map(o => o._id).includes(id));
            const questionBorderClass = isCorrectQuestion ? 'border-green-500' : 'border-red-500';

            return (
              <div key={question._id} className={`bg-gray-50 p-6 rounded-lg shadow-md border-l-4 ${questionBorderClass}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1">
                    Câu {qIndex + 1}: {question.questionText}
                  </h3>
                  {isAuthenticated && (
                    <BookmarkButton
                      questionId={question._id}
                      isBookmarked={bookmarkedQuestions.includes(question._id)}
                      onClick={handleToggleBookmark}
                      className="ml-4"
                    />
                  )}
                </div>

                {question.questionImage && (
                  <div className="mb-4 flex justify-center">
                    <img src={question.questionImage} alt="Question" className="max-w-full h-auto rounded-md shadow-sm" />
                  </div>
                )}

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
                          {option.image && (
                            <img src={option.image} alt="Option" className="mt-2 max-w-[150px] h-auto rounded-md shadow-sm" />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hiển thị tất cả feedback và giải thích chung */}
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-md">
                  <h4 className="font-bold mb-2">Giải thích chi tiết:</h4>
                  {question.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    return (
                      <div key={option._id} className="mb-2">
                        <p className="text-sm font-medium">
                          <span className={option.isCorrect ? 'text-green-700' : 'text-gray-700'}>
                            {optionLetter}. {option.isCorrect ? '(Đáp án đúng)' : ''} {/* MỚI: Thêm chỉ dẫn đáp án đúng */}
                          </span>
                          <span className="italic ml-2">{option.feedback || 'Không có giải thích.'}</span>
                        </p>
                      </div>
                    );
                  })}
                  {question.generalExplanation && (
                    <p className="mt-2 text-sm font-medium">Giải thích chung: <span className="italic">{question.generalExplanation}</span></p>
                  )}
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