// src/pages/QuizResultPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy id từ URL (có thể là 'virtual')
  const { setAlert } = useAlert();

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizTitle, setQuizTitle] = useState('');

  useEffect(() => {
    // Logic chính để xử lý kết quả
    if (location.state?.quizData) {
      const { quizData, userAnswers, timeTaken } = location.state;
      setQuizTitle(quizData.title);
      setTimeTaken(timeTaken);

      let correct = 0;
      const total = quizData.questions.length;

      quizData.questions.forEach(q => {
        const userAnswerIds = userAnswers[q._id] || [];
        const correctOptionIds = q.options.filter(opt => opt.isCorrect).map(opt => opt._id);
        
        const isCorrectAnswer = userAnswerIds.length === correctOptionIds.length &&
                                userAnswerIds.every(id => correctOptionIds.includes(id)) &&
                                userAnswerIds.length > 0;

        if (isCorrectAnswer) {
          correct++;
        }
      });

      setCorrectAnswersCount(correct);
      setIncorrectAnswersCount(total - correct);
      setTotalQuestions(total);
      setScore(total > 0 ? ((correct / total) * 100).toFixed(2) : 0);
    } else {
      setAlert('Không có dữ liệu kết quả bài làm. Vui lòng làm bài lại.', 'error');
      navigate('/dashboard');
    }
  }, [location.state, navigate, setAlert]);

  const formatTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return '00:00:00';
    if (seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  const handleReviewMistakes = () => {
    // Chỉ cho phép xem lại nếu là bộ đề thật (có ID)
    if (id && id !== 'virtual' && location.state) {
      navigate(`/quiz/review/${id}`, { state: location.state }); 
    } else {
      setAlert('Chỉ có thể xem lại đáp án của các bộ đề cố định.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray p-4 flex flex-col items-center justify-center">
      <div className="container mx-auto p-6 md:p-10 bg-white rounded-xl shadow-lg max-w-2xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-blue mb-2">Kết quả bài làm</h1>
        <p className="text-xl font-semibold text-gray-700 mb-6">{quizTitle}</p>

        <div className="mb-8">
          <div className={`text-5xl font-bold ${score >= 50 ? 'text-green-500' : 'text-red-500'}`}>
            {score}%
          </div>
          <p className="text-lg text-gray-600 mt-2">Điểm số của bạn</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-2xl font-bold text-blue-600">{correctAnswersCount}</p>
            <p className="text-sm text-gray-500">Câu trả lời đúng</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{incorrectAnswersCount}</p>
            <p className="text-sm text-gray-500">Câu trả lời sai</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">{totalQuestions}</p>
            <p className="text-sm text-gray-500">Tổng số câu</p>
          </div>
        </div>
        
        <div className="mb-8 text-lg text-gray-800">
          <p>Thời gian hoàn thành: <span className="font-semibold">{formatTime(timeTaken)}</span></p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <Button primary onClick={handleReviewMistakes} disabled={id === 'virtual'}>
            Xem lại bài làm
          </Button>
          <Button secondary onClick={() => navigate('/dashboard')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizResultPage;