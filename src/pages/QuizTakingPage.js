// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api'; // MỚI: Import api từ '../services/api'
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Button from '../components/Button';
import BookmarkButton from '../components/BookmarkButton';

// Hàm tiện ích để xáo trộn mảng (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Chuyển đổi giây thành định dạng HH:MM:SS
const formatRemainingTime = (seconds) => {
  if (seconds === null) return 'Không giới hạn';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0 || h > 0)
    .join(":");
};


function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();

  const quizMode = searchParams.get('mode') || 'review';
  const shuffleQuestions = searchParams.get('shuffle') === 'true';

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [error, setError] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const startTimeRef = useRef(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [showFeedback, setShowFeedback] = useState(false); 

  const [shuffledOptionsOrder, setShuffledOptionsOrder] = useState({}); 
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);


  const getToken = useCallback(() => localStorage.getItem('token'), []);

  const fetchBookmarks = useCallback(async () => {
      if (!isAuthenticated) return;
      try {
          // MỚI: Sử dụng api.get
          const res = await api.get('/api/users/bookmarks'); 
          setBookmarkedQuestions(res.data.map(q => q.question._id));
      } catch (err) {
          console.error('Lỗi khi tải bookmarks:', err);
          if (err.response?.status === 401) {
              logout();
          }
      }
  }, [isAuthenticated, logout]);

  useEffect(() => {
      fetchBookmarks();
  }, [fetchBookmarks]);

  const handleFinishQuiz = useCallback(() => {
    setQuizFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const finalTimeElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTimeElapsed(finalTimeElapsed);

    setAlert('Bạn đã hoàn thành bài làm!', 'success');

    navigate(`/quiz/result/${id}`, { 
      state: { 
        quizData: quiz, 
        userAnswers: userAnswers, 
        quizMode: quizMode,
        timeTaken: finalTimeElapsed,
        shuffledOptionsOrder: shuffledOptionsOrder
      } 
    });
  }, [id, navigate, quiz, userAnswers, quizMode, setAlert, shuffledOptionsOrder]);


  useEffect(() => {
    if (!id) {
      setAlert('Không tìm thấy ID bộ đề.', 'error');
      navigate('/dashboard');
      return;
    }

    const fetchQuiz = async () => {
      try {
        setLoadingQuiz(true);
        setError(null);
        // MỚI: Sử dụng api.get
        const res = await api.get(`/api/quizzes/${id}`); 

        let fetchedQuiz = res.data;
        let tempShuffledOptionsOrder = {};

        if (fetchedQuiz.questions) {
          fetchedQuiz.questions = fetchedQuiz.questions.map(q => {
            if (q.questionType !== 'true-false') {
                const shuffledOptionIds = shuffleArray([...q.options.map(opt => opt._id)]);
                tempShuffledOptionsOrder[q._id] = shuffledOptionIds;
                q.options = shuffledOptionIds.map(optId => q.options.find(o => o._id === optId));
            }
            return q;
          });

          if (shuffleQuestions) {
            fetchedQuiz.questions = shuffleArray([...fetchedQuiz.questions]);
          }
        }

        setQuiz(fetchedQuiz);
        setShuffledOptionsOrder(tempShuffledOptionsOrder);

        if (fetchedQuiz.duration) {
          const durationRegex = /(\d+)h|(\d+)m|(\d+)s/g;
          let totalSeconds = 0;
          let match;
          while ((match = durationRegex.exec(fetchedQuiz.duration)) !== null) {
            if (match[1]) totalSeconds += parseInt(match[1]) * 3600;
            if (match[2]) totalSeconds += parseInt(match[2]) * 60;
            if (match[3]) totalSeconds += parseInt(match[3]);
          }
          setTimeLeft(totalSeconds);
        } else {
          setTimeLeft(null);
        }

        startTimeRef.current = Date.now();
        setQuizStarted(true);

      } catch (err) {
        console.error('Lỗi khi tải bộ đề:', err);
        if (err.response && err.response.status === 404) {
          setError('Bộ đề không tìm thấy hoặc bạn không có quyền truy cập.');
          setAlert('Bộ đề không tìm thấy hoặc bạn không có quyền truy cập.', 'error');
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, navigate, setAlert, getToken, shuffleQuestions]);

  useEffect(() => {
    if (quizStarted && timeLeft !== null && !quizFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setQuizFinished(true);
            setAlert('Hết giờ! Bài làm của bạn đã kết thúc.', 'info');
            handleFinishQuiz();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (quizFinished && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, timeLeft, quizFinished, setAlert, handleFinishQuiz]);


  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  const handleToggleBookmark = async (questionId) => {
      if (!isAuthenticated) {
          setAlert('Vui lòng đăng nhập để đánh dấu sao câu hỏi.', 'warning');
          return;
      }
      try {
          // MỚI: Sử dụng api.put
          const res = await api.put(`/api/users/bookmark/${questionId}`, {});
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


  const handleAnswerChange = (questionId, optionId, questionType) => {
    setShowFeedback(false); 
    setUserAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || [];
      let newAnswers;

      if (questionType === 'single-choice' || questionType === 'true-false') {
        newAnswers = [optionId];
      } else if (questionType === 'multi-select') {
        if (currentAnswers.includes(optionId)) {
          newAnswers = currentAnswers.filter((id) => id !== optionId);
        } else {
          newAnswers = [...currentAnswers, optionId];
        }
      } else {
        newAnswers = [optionId];
      }
      return {
        ...prevAnswers,
        [questionId]: newAnswers,
      };
    });
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };


  if (authLoading || loadingQuiz) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang tải bộ đề...</p>
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
        <p className="text-xl text-gray-700">Bộ đề này không có câu hỏi nào hoặc không tìm thấy bộ đề.</p>
        <Button primary className="mt-4" onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-soft-gray p-4 flex flex-col items-center">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-4 text-center">{quiz.title}</h1>
        <p className="text-gray-700 text-lg mb-6 text-center">{quiz.description}</p>

        {/* Thông tin bài làm: Thời gian, Tiến trình */}
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg mb-6 shadow-sm">
          <div className="text-lg font-semibold text-blue-800">
            Thời gian: <span className="font-bold">{formatRemainingTime(timeLeft)}</span>
          </div>
          <div className="text-lg font-semibold text-blue-800">
            Câu hỏi: {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
        </div>

        {/* Khối hiển thị câu hỏi */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex-1">
              Câu {currentQuestionIndex + 1}: {currentQuestion.questionText}
            </h3>
            {isAuthenticated && (
              <BookmarkButton
                questionId={currentQuestion._id}
                isBookmarked={bookmarkedQuestions.includes(currentQuestion._id)}
                onClick={handleToggleBookmark}
                className="ml-4"
              />
            )}
          </div>

          {currentQuestion.questionImage && (
            <div className="mb-4 flex justify-center">
              <img src={currentQuestion.questionImage} alt="Question" className="max-w-full h-auto rounded-md shadow-sm" />
            </div>
          )}

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => (
              <label key={option._id} className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ease-out">
                <input
                  type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                  name={`question-${currentQuestion._id}`}
                  value={option._id}
                  checked={userAnswers[currentQuestion._id]?.includes(option._id) || false}
                  onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType)}
                  className={`mt-1 h-5 w-5 ${currentQuestion.questionType === 'multi-select' ? 'form-checkbox text-primary-blue rounded' : 'form-radio text-primary-blue'}`}
                  disabled={quizFinished}
                />
                <span className="ml-3 text-gray-800 text-base flex-1">
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option.text}
                  {option.image && (
                    <img src={option.image} alt="Option" className="mt-2 max-w-[150px] h-auto rounded-md shadow-sm" />
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* Hiển thị feedback */}
          {quizMode === 'review' && userAnswers[currentQuestion._id] && ( 
              (currentQuestion.questionType !== 'multi-select' || showFeedback) && (
                  <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-md">
                    <h4 className="font-bold mb-2">Phản hồi:</h4>
                    {currentQuestion.options.map((option, idx) => {
                      const isUserSelected = userAnswers[currentQuestion._id]?.includes(option._id);
                      const isCorrect = option.isCorrect;
                      const optionLetter = String.fromCharCode(65 + idx);

                      if (isUserSelected || isCorrect) {
                        return (
                          <div key={option._id} className="mb-2">
                            {isUserSelected && (
                              <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                Lựa chọn của bạn: <span className="font-semibold">{optionLetter}.</span> {isCorrect ? '(Đúng)' : '(Sai)'}
                              </p>
                            )}
                            {isCorrect && !isUserSelected && (
                              <p className="text-green-700">
                                Đáp án đúng: <span className="font-semibold">{optionLetter}.</span>
                              </p>
                            )}
                            {option.feedback && <p className="text-sm italic">{option.feedback}</p>}
                          </div>
                        );
                      }
                      return null;
                    })}
                    {currentQuestion.generalExplanation && (
                      <p className="mt-2 text-sm">Giải thích chung: {currentQuestion.generalExplanation}</p>
                    )}
                  </div>
              )
          )}
        </div>

        {/* Nút điều hướng */}
        <div className="flex justify-between items-center mt-6">
          <Button
            secondary
            onClick={() => navigate('/dashboard')}
            className="py-2 px-4"
            disabled={quizFinished}
          >
            Thoát
          </Button>

          <div className="flex space-x-3">
            <Button
              secondary
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0 || quizFinished}
            >
              Câu trước
            </Button>

            {currentQuestion.questionType === 'multi-select' && quizMode === 'review' && userAnswers[currentQuestion._id] && !showFeedback ? (
                <Button primary onClick={() => setShowFeedback(true)} disabled={quizFinished}>
                    Xong
                </Button>
            ) : currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button primary onClick={handleNextQuestion} disabled={quizFinished}>
                  Câu tiếp theo
                </Button>
            ) : (
                <Button primary onClick={handleFinishQuiz} disabled={quizFinished}>
                  Nộp bài
                </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTakingPage;