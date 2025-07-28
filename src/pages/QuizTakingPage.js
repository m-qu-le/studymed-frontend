// src/pages/QuizTakingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

function QuizTakingPage() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'review';
  const shuffle = searchParams.get('shuffle') === 'true';
  const timeLimitParam = searchParams.get('timeLimit');
  const timeLimit = timeLimitParam ? parseInt(timeLimitParam, 10) : null;

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // MỚI: State cho thời gian
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/quizzes/${quizId}`);
      let questions = [...res.data.questions];
      if (shuffle) {
        questions = shuffleArray(questions);
      }
      setQuiz({ ...res.data, questions });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Không thể tải bộ đề.');
      setLoading(false);
    }
  }, [quizId, shuffle]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (timeLimit > 0 && !loading && !isTimeUp && !isPaused) {
      const intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    } else if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true);
      setAlert('Đã hết thời gian làm bài!', 'warning');
    }
  }, [timeLimit, loading, isTimeUp, isPaused, setAlert, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return 'Không giới hạn';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array.questions ? { ...array.questions.find((_, idx) => idx === i) } : { ...array.find((_, idx) => idx === i) };
      if (array.questions) {
        array.questions.splice(i, 1, array.questions.find((_, idx) => idx === j));
        array.questions.splice(j, 1, temp);
      } else {
        array.splice(i, 1, array.find((_, idx) => idx === j));
        array.splice(j, 1, temp);
      }
    }
    return array;
  };

  const currentQuestion = quiz?.questions && quiz.questions.length > 0 ? quiz.questions.find((_, index) => index === currentQuestionIndex) : null;
  const questionNumber = currentQuestionIndex + 1;
  const totalQuestions = quiz?.questions?.length || 0;

  const handleAnswerSelect = (answer) => {
    setUserAnswers({ ...userAnswers, [currentQuestion?._id]: answer });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    navigate(`/quiz/result/${quizId}`, { state: { userAnswers, quiz } });
  };

  const handleTimeUpSubmit = () => {
    navigate(`/quiz/result/${quizId}`, { state: { userAnswers, quiz, timeUp: true } });
  };

  const handleContinueQuiz = () => {
    setIsPaused(false);
  };

  const handlePauseQuiz = () => {
    setIsPaused(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Đang tải câu hỏi...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!currentQuestion) {
    return <div className="flex justify-center items-center min-h-screen">Không có câu hỏi nào.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative px-6 pt-10 pb-8 bg-white shadow-xl ring-1 ring-gray-900/5 sm:max-w-lg sm:mx-auto sm:rounded-lg sm:px-10">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{quiz?.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Thời gian: {formatTime(timeLeft)}</p>
            <p className="text-sm text-gray-500">Câu hỏi: {questionNumber} / {totalQuestions}</p>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <p className="font-bold">Câu {questionNumber}: {currentQuestion?.questionText}</p>
              <ul>
                {currentQuestion?.options?.map((option, index) => (
                  <li key={index} className="py-1">
                    <label className="inline-flex items-center w-full">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-primary-blue focus:ring-primary-blue border-gray-300"
                        name={`question-${currentQuestion._id}`}
                        value={option}
                        checked={userAnswers?.[currentQuestion._id] === option}
                        onChange={() => handleAnswerSelect(option)}
                        disabled={mode === 'review' && quiz?.correctAnswers?.[currentQuestion._id]}
                      />
                      <span className="ml-2">{String.fromCharCode(65 + index)}. {option}</span>
                      {mode === 'review' && quiz?.correctAnswers?.[currentQuestion._id] === option && (
                        <span className="ml-2 text-green-500">(Đúng)</span>
                      )}
                      {mode === 'review' && userAnswers?.[currentQuestion._id] === option && quiz?.correctAnswers?.[currentQuestion._id] !== option && (
                        <span className="ml-2 text-red-500">(Sai)</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 flex justify-between">
              <Button onClick={navigate(-1)}>Thoát</Button>
              <div className="space-x-4">
                {currentQuestionIndex > 0 && (
                  <Button secondary onClick={goToPreviousQuestion}>Câu trước</Button>
                )}
                {!isTimeUp ? (
                  currentQuestionIndex < totalQuestions - 1 ? (
                    <Button primary onClick={goToNextQuestion}>Câu tiếp theo</Button>
                  ) : (
                    <Button primary onClick={handleSubmitQuiz}>Hoàn thành</Button>
                  )
                ) : (
                  <>
                    <Button onClick={handleTimeUpSubmit} className="bg-yellow-500 hover:bg-yellow-600 text-white">Xem kết quả</Button>
                    <Button onClick={handleContinueQuiz} className="bg-gray-400 hover:bg-gray-500 text-white">Làm tiếp</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTakingPage;