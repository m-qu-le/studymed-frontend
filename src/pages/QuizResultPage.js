// src/pages/QuizResultPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

function QuizResultPage() {
  const location = useLocation(); // Lấy state được truyền từ navigate
  const navigate = useNavigate();
  const { setAlert } = useAlert();

  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [timeTaken, setTimeTaken] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizMode, setQuizMode] = useState('');
  const [quizId, setQuizId] = useState(null);
  const [userAnswersData, setUserAnswersData] = useState({}); // Để lưu userAnswers cho việc xem lại

  useEffect(() => {
    // Kiểm tra xem dữ liệu có được truyền qua state không
    if (location.state && location.state.quizData && location.state.userAnswers && location.state.quizMode) {
      const { quizData, userAnswers, quizMode, timeTaken } = location.state;
      setQuizId(quizData._id);
      setQuizTitle(quizData.title);
      setQuizMode(quizMode);
      setTimeTaken(timeTaken);
      setUserAnswersData(userAnswers); // Lưu userAnswers để xem lại

      let correct = 0;
      let incorrect = 0;
      const total = quizData.questions.length;

      quizData.questions.forEach(q => {
        const userAnswerIds = userAnswers[q._id] || [];

        // Lấy các đáp án đúng của câu hỏi này
        const correctOptionIds = q.options
                                .filter(opt => opt.isCorrect)
                                .map(opt => opt._id);

        // Kiểm tra xem câu trả lời của người dùng có khớp với đáp án đúng không
        // Đối với single-choice / true-false: chỉ cần 1 lựa chọn khớp
        // Đối với multi-select: tất cả các lựa chọn đúng phải được chọn và không có lựa chọn sai nào được chọn thêm
        const isCorrectAnswer = (userAnswerIds.length === correctOptionIds.length) &&
                                userAnswerIds.every(id => correctOptionIds.includes(id));

        if (isCorrectAnswer && userAnswerIds.length > 0) { // Phải có trả lời và đúng
          correct++;
        } else if (userAnswerIds.length > 0) { // Có trả lời nhưng sai
          incorrect++;
        }
        // Nếu không trả lời thì không tính đúng sai, có thể thêm logic cho "bỏ qua"
      });

      setCorrectAnswersCount(correct);
      setIncorrectAnswersCount(incorrect);
      setTotalQuestions(total);
      // Điểm có thể tính theo phần trăm
      setScore(total > 0 ? ((correct / total) * 100).toFixed(2) : 0);

    } else {
      setAlert('Không có dữ liệu kết quả bài làm. Vui lòng làm bài lại.', 'error');
      navigate('/dashboard'); // Điều hướng về dashboard nếu không có dữ liệu
    }
  }, [location.state, navigate, setAlert]);

  // Chuyển đổi giây thành định dạng HH:MM:SS
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
    if (quizId && userAnswersData) {
      navigate(`/quiz/review/${quizId}`, { state: { userAnswers: userAnswersData, quizMode: quizMode } }); // Chuyển đến trang xem lại
    } else {
      setAlert('Không có dữ liệu để xem lại.', 'warning');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-primary-blue mb-4">Kết Quả Bài Làm</h1>
        <p className="text-gray-700 text-xl mb-6">Bộ đề: <span className="font-semibold">{quizTitle}</span></p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Tổng số câu</p>
            <p className="text-3xl font-bold text-blue-700">{totalQuestions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Số câu đúng</p>
            <p className="text-3xl font-bold text-green-700">{correctAnswersCount}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Số câu sai</p>
            <p className="text-3xl font-bold text-red-700">{incorrectAnswersCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Điểm số</p>
            <p className="text-3xl font-bold text-purple-700">{score}%</p>
          </div>
        </div>

        <p className="text-lg text-gray-700 mb-6">Thời gian hoàn thành: <span className="font-semibold">{formatTime(timeTaken)}</span></p>

        <div className="flex justify-center space-x-4">
          <Button secondary onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>
          <Button primary onClick={handleReviewMistakes} disabled={incorrectAnswersCount === 0 && correctAnswersCount === totalQuestions}>
            Xem lại đáp án
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizResultPage;