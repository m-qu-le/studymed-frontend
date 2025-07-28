// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import Button from '../components/Button';
import BookmarkButton from '../components/BookmarkButton';

const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const formatTime = (seconds) => {
  if (seconds === null) return 'Không giới hạn';
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map(v => v < 10 ? "0" + v : v)
    .join(":");
};

function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();

  const quizMode = searchParams.get('mode') || 'review';
  const shuffleQuestions = searchParams.get('shuffle') === 'true';
  const timeLimit = searchParams.get('timeLimit') ? parseInt(searchParams.get('timeLimit'), 10) : null;

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [shuffledOptionsOrder, setShuffledOptionsOrder] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  
  // State cho timer
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  
  const timerRef = useRef(null);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/users/bookmarks');
      setBookmarkedQuestions(res.data.map(q => q.question._id));
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleSubmitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = localStorage.getItem('quizStartTime');
    const timeTaken = startTime ? Math.floor((Date.now() - parseInt(startTime, 10)) / 1000) : 0;
    
    navigate(`/quiz/result/${id}`, {
      state: {
        quizData: quiz,
        userAnswers: userAnswers,
        quizMode: quizMode,
        timeTaken: timeTaken,
        shuffledOptionsOrder: shuffledOptionsOrder
      }
    });
    localStorage.removeItem('quizStartTime');
  }, [id, navigate, quiz, userAnswers, quizMode, shuffledOptionsOrder]);

  useEffect(() => {
    const fetchQuizAndSetup = async () => {
      try {
        setLoadingQuiz(true);
        const res = await api.get(`/api/quizzes/${id}`);
        let fetchedQuiz = res.data;
        let tempShuffledOptionsOrder = {};
  
        if (fetchedQuiz.questions) {
          fetchedQuiz.questions.forEach(q => {
            if (q.questionType !== 'true-false') {
              const shuffledOpts = shuffleArray([...q.options]);
              tempShuffledOptionsOrder[q._id] = shuffledOpts.map(opt => opt._id);
              q.options = shuffledOpts;
            }
          });
  
          if (shuffleQuestions) {
            fetchedQuiz.questions = shuffleArray([...fetchedQuiz.questions]);
          }
        }
  
        setQuiz(fetchedQuiz);
        setShuffledOptionsOrder(tempShuffledOptionsOrder);
        localStorage.setItem('quizStartTime', Date.now().toString());
      } catch (err) {
        setAlert('Không thể tải bộ đề.', 'error');
        navigate('/dashboard');
      } finally {
        setLoadingQuiz(false);
      }
    };
    fetchQuizAndSetup();
  }, [id, navigate, setAlert, shuffleQuestions]);
  
  useEffect(() => {
    if (timeLeft === null || isTimerPaused || loadingQuiz) {
      if(timerRef.current) clearInterval(timerRef.current);
      return;
    }
  
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      setAlert('Đã hết giờ làm bài!', 'warning');
      if(timerRef.current) clearInterval(timerRef.current);
      return;
    }
  
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
  
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isTimerPaused, loadingQuiz, setAlert]);

  const handleToggleBookmark = async (questionId) => {
    // ... logic giữ nguyên
  };

  const handleAnswerChange = (questionId, optionId, questionType) => {
    // ... logic giữ nguyên
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };
  
  // ĐÃ SỬA: Logic lấy câu hỏi hiện tại, an toàn và hiệu quả hơn
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  if (loadingQuiz) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải bộ đề...</div>;
  }
  
  if (!quiz || !currentQuestion) {
    return <div className="flex items-center justify-center min-h-screen">Bộ đề không có câu hỏi hoặc đã xảy ra lỗi.</div>;
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex flex-col items-center">
      {/* MỚI: Pop-up thông báo hết giờ */}
      {isTimeUp && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Đã Hết Giờ!</h2>
            <p className="text-gray-700 mb-6">Thời gian làm bài của bạn đã kết thúc.</p>
            <div className="flex justify-center space-x-4">
              <Button secondary onClick={() => { setIsTimeUp(false); setIsTimerPaused(true); }}>
                Làm tiếp
              </Button>
              <Button primary onClick={handleSubmitQuiz}>
                Xem kết quả
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-blue mb-4 text-center">{quiz.title}</h1>
        {/* Phần mô tả đã được xóa */}

        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg mb-6 shadow-sm">
          <div className={`text-lg font-semibold ${isTimerPaused && timeLeft <= 0 ? 'text-red-500' : 'text-blue-800'}`}>
            Thời gian: <span className="font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-lg font-semibold text-blue-800">
            Câu hỏi: {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex-1">
              Câu {currentQuestionIndex + 1}: {currentQuestion.questionText}
            </h3>
            {isAuthenticated && (
              <BookmarkButton
                questionId={currentQuestion._id}
                isBookmarked={bookmarkedQuestions.includes(currentQuestion._id)}
                onClick={() => handleToggleBookmark(currentQuestion._id)}
                className="ml-4"
              />
            )}
          </div>
          <div className="space-y-4">
            {/* Logic render các lựa chọn giữ nguyên */}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-8 gap-3 w-full">
          <Button secondary onClick={() => navigate('/dashboard')}>
            Thoát
          </Button>
          <div className="flex w-full sm:w-auto gap-3">
            <Button secondary onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              Câu trước
            </Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button primary onClick={handleNextQuestion}>
                Câu tiếp theo
              </Button>
            ) : (
              <Button primary onClick={handleSubmitQuiz}>
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