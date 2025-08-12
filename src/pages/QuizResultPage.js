// src/pages/QuizResultPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';

const formatTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [h, m, s].map(v => v < 10 ? "0" + v : v);
    return h > 0 ? parts.join(":") : `${parts[1]}:${parts[2]}`;
};

function QuizResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const { setAlert } = useAlert();

    const [results, setResults] = useState({
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        totalQuestions: 0,
        quizTitle: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { quizData, userAnswers } = location.state || {};

        if (!quizData || !userAnswers) {
            setAlert('Không có dữ liệu kết quả để hiển thị.', 'error');
            navigate('/dashboard');
            return;
        }

        // BƯỚC 1: "Làm phẳng" danh sách câu hỏi, giống như các trang khác
        const flatQuestions = [];
        quizData.questions.forEach(item => {
            if (item.type === 'single') {
                flatQuestions.push(item);
            } else if (item.type === 'group' && item.childQuestions) {
                flatQuestions.push(...item.childQuestions);
            }
        });

        // BƯỚC 2: Tính toán điểm dựa trên danh sách đã làm phẳng
        let correctCounter = 0;
        flatQuestions.forEach(question => {
            const userAnswerIds = userAnswers[question._id] || [];
            const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(o => o._id);

            // Áp dụng logic chấm điểm "tất cả hoặc không có gì"
            const isCorrect = userAnswerIds.length === correctOptionIds.length &&
                              userAnswerIds.every(id => correctOptionIds.includes(id));

            if (isCorrect) {
                correctCounter++;
            }
        });

        const total = flatQuestions.length;
        const score = total > 0 ? (correctCounter / total) * 10 : 0;

        setResults({
            score: score.toFixed(1),
            correctCount: correctCounter,
            incorrectCount: total - correctCounter,
            totalQuestions: total,
            quizTitle: quizData.title,
        });

        setLoading(false);

    }, [location.state, navigate, setAlert]);

    const handleReview = () => {
        navigate(`/quiz/review/${id}`, { 
            state: { 
                quizData: location.state.quizData, 
                userAnswers: location.state.userAnswers 
            } 
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Đang tính toán kết quả...</div>;
    }

    return (
        <div className="min-h-screen bg-soft-gray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                <h1 className="text-3xl font-bold text-primary-blue mb-2">Kết Quả Bài Làm</h1>
                <p className="text-gray-600 mb-6">Bộ đề: <span className="font-semibold">{results.quizTitle}</span></p>

                <div className="mb-8">
                    <p className="text-6xl font-bold text-indigo-600">{results.score}</p>
                    <p className="text-gray-500">(thang điểm 10)</p>
                </div>

                <div className="flex justify-around items-center mb-8 text-center">
                    <div>
                        <p className="text-3xl font-bold text-blue-600">{results.totalQuestions}</p>
                        <p className="text-sm text-gray-500">Tổng số câu</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600">{results.correctCount}</p>
                        <p className="text-sm text-gray-500">Số câu đúng</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-red-600">{results.incorrectCount}</p>
                        <p className="text-sm text-gray-500">Số câu sai</p>
                    </div>
                </div>

                {location.state.timeTaken !== undefined && (
                     <p className="text-gray-600 mb-8">Thời gian hoàn thành: <span className="font-semibold">{formatTime(location.state.timeTaken)}</span></p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button secondary onClick={() => navigate('/dashboard')} className="w-full">Về Dashboard</Button>
                    <Button primary onClick={handleReview} className="w-full">Xem lại bài làm</Button>
                </div>
            </div>
        </div>
    );
}

export default QuizResultPage;