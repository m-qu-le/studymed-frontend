// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import BookmarkButton from '../components/BookmarkButton';
import ExplanationBlock from '../components/ExplanationBlock';
import QuestionItem from '../components/QuestionItem';

const formatTime = (seconds) => {
  if (seconds === null) return 'Không giới hạn';
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [h, m, s].map(v => v < 10 ? "0" + v : v);
  return h > 0 ? parts.join(":") : `${parts[1]}:${parts[2]}`;
};

function QuizTakingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();

  const quizMode = searchParams.get('mode') || 'review';
  const timeLimit = searchParams.get('timeLimit') ? parseInt(searchParams.get('timeLimit'), 10) : null;

  const [originalQuiz, setOriginalQuiz] = useState(null);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef(null);

  const handleSubmitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = localStorage.getItem('quizStartTime');
    const timeTaken = startTime ? Math.floor((Date.now() - parseInt(startTime, 10)) / 1000) : 0;
    const quizId = id || 'virtual';
    
    navigate(`/quiz/result/${quizId}`, { 
      state: { quizData: originalQuiz, userAnswers, timeTaken, quizMode } 
    });
    localStorage.removeItem('quizStartTime');
  }, [id, navigate, originalQuiz, userAnswers, quizMode]);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/users/bookmarks');
      setBookmarkedQuestions(new Set(res.data.map(q => q.question._id)));
    } catch (err) {
      if (err.response?.status === 401) logout();
    }
  }, [isAuthenticated, logout]);
  
  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  useEffect(() => {
    const setupQuiz = (quizData) => {
      setOriginalQuiz(quizData);
      
      const flatQuestions = [];
      if (quizData && quizData.questions) {
        quizData.questions.forEach(item => {
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
      localStorage.setItem('quizStartTime', Date.now().toString());
      setLoadingQuiz(false);
    };

    const fetchQuizById = async () => {
      try {
        setLoadingQuiz(true);
        const res = await api.get(`/api/quizzes/${id}`);
        setupQuiz(res.data);
      } catch (err) {
        setAlert('Không thể tải bộ đề.', 'error');
        navigate('/dashboard');
      }
    };

    if (location.state?.virtualQuiz) {
      setupQuiz(location.state.virtualQuiz);
    } else if (id && id !== 'virtual') {
      fetchQuizById();
    } else {
      setAlert('Không có dữ liệu bộ đề.', 'error');
      navigate('/dashboard');
    }
  }, [id, location.state, navigate, setAlert]);
  
  useEffect(() => {
    if (timeLeft === null || isTimerPaused || loadingQuiz || isTimeUp) {
      if(timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      setAlert('Đã hết giờ làm bài!', 'warning');
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isTimerPaused, loadingQuiz, isTimeUp, setAlert]);

  const handleToggleBookmark = async (questionId) => {
    if (!isAuthenticated) return;
    try {
        const res = await api.put(`/api/users/bookmark/${questionId}`);
        if (res.data.bookmarked) {
            setBookmarkedQuestions(prev => new Set(prev).add(questionId));
        } else {
            setBookmarkedQuestions(prev => {
                const newSet = new Set(prev);
                newSet.delete(questionId);
                return newSet;
            });
        }
    } catch (err) {
        if (err.response?.status === 401) logout();
    }
  };

  const handleAnswerChange = (questionId, optionId, questionType) => {
    setShowFeedback(false);
    setUserAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || [];
      let newAnswers;

      if (questionType === 'multi-select') {
        newAnswers = currentAnswers.includes(optionId) 
          ? currentAnswers.filter((id) => id !== optionId) 
          : [...currentAnswers, optionId];
      } else {
        newAnswers = [optionId];
      }
      return { ...prevAnswers, [questionId]: newAnswers };
    });

    if (quizMode === 'review' && questionType !== 'multi-select') {
      setShowFeedback(true);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < displayQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  if (loadingQuiz) return <div className="flex items-center justify-center min-h-screen">Đang tải bộ đề...</div>;
  if (!originalQuiz || displayQuestions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Lỗi tải bộ đề hoặc bộ đề không có câu hỏi.</div>;
  }

  const currentQuestion = displayQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex flex-col items-center">
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

      <div className="container mx-auto p-4 md:p-8 bg-white rounded-xl shadow-lg max-w-4xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-blue mb-4 text-center">{originalQuiz.title}</h1>
        
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-4 z-10 border-b mb-6">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg shadow-sm text-sm md:text-base">
            <div className={`font-semibold ${isTimeUp && !isTimerPaused ? 'text-red-500 animate-pulse' : 'text-blue-800'}`}>
              Thời gian: <span className="font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="font-semibold text-blue-800 capitalize">
              Chế độ: {quizMode === 'review' ? 'Ôn tập' : 'Kiểm tra'}
            </div>
            <div className="font-semibold text-blue-800">
              Câu hỏi: <span className="font-bold">{quizMode === 'review' ? currentQuestionIndex + 1 : Object.values(userAnswers).filter(a => a.length > 0).length} / {displayQuestions.length}</span>
            </div>
          </div>
        </div>

        {quizMode === 'test' ? (
          <div>
            {originalQuiz.questions.map((item, index) => {
              if (item.type === 'single') {
                return (
                  <div key={item._id || index} className="mb-8">
                    <QuestionItem
                      question={item}
                      index={index}
                      userAnswer={userAnswers[item._id]}
                      onAnswerChange={handleAnswerChange}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                );
              }
              
              if (item.type === 'group') {
                return (
                  <div key={item._id || index} className="mb-8 p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
                    <div className="mb-6">
                      <h3 className="font-semibold text-indigo-800 mb-2">Tình huống lâm sàng {index + 1}:</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{item.caseStem}</p>
                    </div>
                    
                    {item.childQuestions.map((childQuestion, childIndex) => (
                      <div key={childQuestion._id || childIndex} className="mb-6 pl-4">
                         <QuestionItem
                          question={childQuestion} 
                          index={childIndex} 
                          userAnswer={userAnswers[childQuestion._id]}
                          onAnswerChange={handleAnswerChange}
                          isAuthenticated={isAuthenticated}
                          isChild={true} 
                        />
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })}
            
            <div className="flex justify-end mt-8">
              <Button secondary onClick={() => navigate('/dashboard')} className="mr-4">Thoát</Button>
              <Button primary onClick={handleSubmitQuiz} className="py-3 px-6 text-lg">Nộp bài</Button>
            </div>
          </div>
        ) : (
          // Chế độ ôn tập
          <div>
            {/* ĐÃ SỬA LỖI: Bỏ điều kiện so sánh với câu hỏi trước */}
            {currentQuestion.caseStem && (
              <div className="mb-6 p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-2">Tình huống lâm sàng:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{currentQuestion.caseStem}</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex-1 pr-4">
                  Câu {currentQuestionIndex + 1}: {currentQuestion.questionText}
                </h3>
                {isAuthenticated && (
                  <BookmarkButton
                    questionId={currentQuestion._id}
                    isBookmarked={bookmarkedQuestions.has(currentQuestion._id)}
                    onClick={() => handleToggleBookmark(currentQuestion._id)}
                    className="flex-shrink-0"
                  />
                )}
              </div>
              <div className="space-y-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQuestion._id]?.includes(option._id) || false;
                  const feedbackClass = showFeedback 
                    ? (option.isCorrect ? 'bg-green-100 border-green-400' : (isSelected ? 'bg-red-100 border-red-400' : 'border-gray-300 hover:bg-gray-50'))
                    : 'border-gray-300 hover:bg-gray-50';
                  return (
                    <label key={option._id || idx} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors duration-200 ease-out ${feedbackClass}`}>
                      <input
                        type={currentQuestion.questionType === 'multi-select' ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestion._id}`}
                        value={option._id}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(currentQuestion._id, option._id, currentQuestion.questionType)}
                        className={`mt-1 h-5 w-5 ${currentQuestion.questionType === 'multi-select' ? 'form-checkbox text-primary-blue rounded' : 'form-radio text-primary-blue'}`}
                        disabled={showFeedback}
                      />
                      <span className="ml-3 text-gray-800 text-base flex-1">
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            {showFeedback && (
              <ExplanationBlock
                question={currentQuestion}
                userAnswers={userAnswers[currentQuestion._id]}
                mode="review"
              />
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center mt-8 gap-3 w-full">
              <Button secondary onClick={() => navigate('/dashboard')}>
                Thoát
              </Button>
              <div className="flex w-full sm:w-auto gap-3">
                <Button secondary onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Câu trước
                </Button>
                
                {currentQuestion.questionType === 'multi-select' && !showFeedback && (userAnswers[currentQuestion._id]?.length > 0) ? (
                    <Button primary onClick={() => setShowFeedback(true)}>
                      Xong
                    </Button>
                ) : currentQuestionIndex < displayQuestions.length - 1 ? (
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
        )}
      </div>
    </div>
  );
}

export default QuizTakingPage;