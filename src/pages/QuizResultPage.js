// src/pages/QuizResultPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { setAlert } = useAlert();

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [quizTitle, setQuizTitle] = useState('');

  useEffect(() => {
    if (location.state?.quizData) {
      const { quizData, userAnswers, timeTaken } = location.state;
      setQuizTitle(quizData.title);
      setTimeTaken(timeTaken);

      let correct = 0;
      const total = quizData.questions.length;

      quizData.questions.forEach(q => {
        const userAnswerIds = userAnswers[q._id] || [];
        const correctOptionIds = q.options.filter(opt => opt.isCorrect).map(opt => opt._id);
        const isCorrectAnswer = userAnswerIds.length === correctOptionIds.length && userAnswerIds.every(id => correctOptionIds.includes(id)) && userAnswerIds.length > 0;
        if (isCorrectAnswer) {
          correct++;
        }
      });

      setCorrectAnswersCount(correct);
      setTotalQuestions(total);
      const newScore = total > 0 ? ((correct / total) * 10).toFixed(1) : 0;
      setScore(newScore);
    } else {
      setAlert('Không có dữ liệu kết quả bài làm.', 'error');
      navigate('/dashboard');
    }
  }, [location.state, navigate, setAlert]);

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const handleReviewMistakes = () => {
    if (id && id !== 'virtual' && location.state) {
      navigate(`/quiz/review/${id}`, { state: location.state }); 
    } else {
      setAlert('Chỉ có thể xem lại đáp án của các bộ đề cố định.', 'info');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-primary-blue mb-2">Kết Quả Bài Làm</h1>
        <p className="text-gray-700 text-lg mb-6">Bộ đề: <span className="font-semibold">{quizTitle}</span></p>

        <div className="mb-6">
            <p className="text-5xl font-bold text-purple-700">{score}</p>
            <p className="text-sm text-gray-600">Điểm của bạn (thang 10)</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div>
                <p className="text-2xl font-bold text-blue-700">{totalQuestions}</p>
                <p className="text-sm text-gray-600">Tổng số câu</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-green-700">{correctAnswersCount}</p>
                <p className="text-sm text-gray-600">Số câu đúng</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-red-700">{totalQuestions - correctAnswersCount}</p>
                <p className="text-sm text-gray-600">Số câu sai</p>
            </div>
        </div>

        <p className="text-lg text-gray-700 mb-6">Thời gian hoàn thành: <span className="font-semibold">{formatTime(timeTaken)}</span></p>

        <div className="flex justify-center space-x-4">
          <Button secondary onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
          <Button primary onClick={handleReviewMistakes}>
            Xem lại bài làm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizResultPage;