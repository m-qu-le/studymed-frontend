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
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState('');
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
      
      // ĐÃ SỬA: Thay đổi cách tính điểm sang thang 10
      const newScore = total > 0 ? ((correct / total) * 10).toFixed(1) : 0;
      setScore(newScore);

    } else {
      setAlert('Không có dữ liệu kết quả bài làm. Vui lòng làm bài lại.', 'error');
      navigate('/dashboard');
    }
  }, [location.state, navigate, setAlert]);

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  const handleReviewMistakes = () => {
    // ĐÃ SỬA: Cho phép xem lại cả bài làm "ảo"
    if (location.state) {
      const quizId = id || 'virtual';
      navigate(`/quiz/review/${quizId}`, { state: location.state }); 
    } else {
      setAlert('Không có dữ liệu để xem lại.', 'warning');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-primary-blue mb-2">Kết Quả Bài Làm</h1>
        <p className="text-gray-700 text-lg mb-6">Bộ đề: <span className="font-semibold">{quizTitle}</span></p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tổng số câu</p>
            <p className="text-3xl font-bold text-blue-700">{totalQuestions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Số câu đúng</p>
            <p className="text-3xl font-bold text-green-700">{correctAnswersCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Số câu sai</p>
            <p className="text-3xl font-bold text-red-700">{incorrectAnswersCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            {/* ĐÃ SỬA: Cập nhật hiển thị điểm */}
            <p className="text-sm text-gray-600">Điểm (thang 10)</p>
            <p className="text-3xl font-bold text-purple-700">{score}</p>
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