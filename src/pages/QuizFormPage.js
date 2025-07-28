// src/pages/QuizFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
// MỚI: Import component CustomTagInput của chúng ta
import CustomTagInput from '../components/CustomTagInput';

function QuizFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState({
    title: '', description: '', subject: '', topic: '',
    questions: [], isSystemQuiz: false,
  });
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await api.get(`/api/quizzes/${id}`);
      setQuiz(res.data);
    } catch (err) {
      setAlert('Không thể tải bộ đề.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, setAlert]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchQuiz();
    } else {
      setLoading(false);
    }
  }, [id, fetchQuiz]);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setAlert('Bạn cần đăng nhập để truy cập trang này.', 'error');
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, setAlert]);


  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [name]: value };
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };
  
  const handleTagsChange = (qIndex, newTags) => {
    const newQuestions = [...quiz.questions];
    if (!newQuestions[qIndex]) newQuestions[qIndex] = {};
    newQuestions[qIndex].tags = newTags;
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...quiz.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = { ...newOptions[oIndex], [name]: type === 'checkbox' ? checked : value };
    
    if (newQuestions[qIndex].questionType === 'single-choice' && type === 'radio') {
        newOptions.forEach((option, index) => {
            option.isCorrect = index === oIndex;
        });
    }

    newQuestions[qIndex].options = newOptions;
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  const handleAddQuestion = () => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: [
        ...prevQuiz.questions,
        {
          questionText: '', questionType: 'single-choice',
          tags: [], difficulty: 'Thông hiểu',
          options: [
            { text: '', isCorrect: true, feedback: '' },
            { text: '', isCorrect: false, feedback: '' }
          ],
          generalExplanation: ''
        }
      ]
    }));
  };

  const handleDeleteQuestion = (index) => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: prevQuiz.questions.filter((_, i) => i !== index)
    }));
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options.push({ text: '', isCorrect: false, feedback: '' });
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/api/quizzes/${id}`, quiz);
        setAlert('Cập nhật bộ đề thành công!', 'success');
      } else {
        await api.post('/api/quizzes', quiz);
        setAlert('Tạo bộ đề mới thành công!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Lưu bộ đề thất bại!', 'error');
    }
  };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-gray p-4">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-8 text-center">
          {isEditMode ? 'Chỉnh Sửa Bộ Đề' : 'Tạo Bộ Đề Mới'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin Bộ đề</h2>
            <InputField label="Tiêu đề Bộ đề" name="title" value={quiz.title} onChange={handleQuizChange} required />
            <InputField label="Môn học" name="subject" value={quiz.subject} onChange={handleQuizChange} required />
            <InputField label="Chủ đề (Tùy chọn)" name="topic" value={quiz.topic} onChange={handleQuizChange} />
            <textarea name="description" value={quiz.description} onChange={handleQuizChange} placeholder="Mô tả" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mt-4" />
            {user?.role === 'admin' && (
              <label className="inline-flex items-center mt-3">
                <input type="checkbox" name="isSystemQuiz" checked={quiz.isSystemQuiz} onChange={handleQuizChange} className="form-checkbox h-5 w-5 text-primary-blue"/>
                <span className="ml-2">Bộ đề hệ thống</span>
              </label>
            )}
          </div>

          <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Các câu hỏi</h2>
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Câu hỏi {qIndex + 1}</h3>
                  <Button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="bg-red-500 hover:bg-red-600 py-1 px-3">Xóa Câu Hỏi</Button>
                </div>
                
                <textarea name="questionText" value={question.questionText} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded" placeholder="Nội dung câu hỏi" required />
                
                {/* MỚI: Sử dụng component CustomTagInput */}
                <div className="mb-4 mt-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tags (nhấn Enter để thêm)</label>
                    <CustomTagInput
                        tags={question.tags || []}
                        setTags={(newTags) => handleTagsChange(qIndex, newTags)}
                        placeholder="Nhập tag và nhấn Enter"
                    />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Độ khó</label>
                  <select name="difficulty" value={question.difficulty || 'Thông hiểu'} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded bg-white">
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mt-4">Các lựa chọn đáp án:</h4>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center mt-2">
                      <input 
                        type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'} 
                        name={`correctOption-${qIndex}`} 
                        checked={option.isCorrect} 
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                        className={`${question.questionType === 'multi-select' ? 'form-checkbox' : 'form-radio'} h-5 w-5 text-primary-blue`}
                      />
                      <InputField name="text" value={option.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} className="ml-2 flex-grow" required />
                      <Button type="button" onClick={() => handleDeleteOption(qIndex, oIndex)} className="ml-2 bg-gray-300 py-1 px-2">Xóa</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => handleAddOption(qIndex)} className="mt-2 bg-green-500 hover:bg-green-600">Thêm Lựa Chọn</Button>
                </div>

                 <textarea name="generalExplanation" value={question.generalExplanation} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded mt-4" placeholder="Giải thích chung (tùy chọn)" />
              </div>
            ))}
            <Button type="button" onClick={handleAddQuestion} className="w-full bg-primary-blue hover:bg-primary-blue-active">Thêm Câu Hỏi Mới</Button>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" secondary onClick={() => navigate('/dashboard')}>Hủy</Button>
            <Button type="submit" primary>{isEditMode ? 'Cập Nhật' : 'Lưu'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizFormPage;