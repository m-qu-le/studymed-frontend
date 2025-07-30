// src/pages/QuizFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
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

    // Nếu đổi sang true-false, tự động tạo 2 đáp án Đúng/Sai
    if (name === 'questionType' && value === 'true-false') {
      newQuestions[index].options = [
        { text: 'Đúng', isCorrect: true, feedback: '' },
        { text: 'Sai', isCorrect: false, feedback: '' },
      ];
    }
    
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
    
    // Logic cho radio button (single-choice & true-false)
    if ((newQuestions[qIndex].questionType === 'single-choice' || newQuestions[qIndex].questionType === 'true-false') && type === 'radio') {
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
          {/* Thông tin chung của bộ đề */}
          <div className="mb-8 p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin chung</h2>
            <InputField label="Tiêu đề Bộ đề" name="title" value={quiz.title} onChange={handleQuizChange} required />
            <InputField label="Môn học" name="subject" value={quiz.subject} onChange={handleQuizChange} required />
            <InputField label="Chủ đề (Tùy chọn)" name="topic" value={quiz.topic} onChange={handleQuizChange} />
            <textarea name="description" value={quiz.description} onChange={handleQuizChange} placeholder="Mô tả" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mt-4" />
          </div>

          {/* Các câu hỏi */}
          <div className="mb-8 p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Các câu hỏi</h2>
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-6 rounded-2xl shadow-md mb-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">Câu hỏi {qIndex + 1}</h3>
                  <Button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="bg-red-500 hover:bg-red-600 py-1 px-3">Xóa Câu Hỏi</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* MỚI: Thêm lựa chọn Loại câu hỏi */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Loại câu hỏi</label>
                    <select name="questionType" value={question.questionType} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded bg-white">
                      <option value="single-choice">Một đáp án</option>
                      <option value="multi-select">Nhiều đáp án</option>
                      <option value="true-false">Đúng / Sai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Độ khó</label>
                    <select name="difficulty" value={question.difficulty || 'Thông hiểu'} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded bg-white">
                      <option value="Nhận biết">Nhận biết</option>
                      <option value="Thông hiểu">Thông hiểu</option>
                      <option value="Vận dụng">Vận dụng</option>
                      <option value="Vận dụng cao">Vận dụng cao</option>
                    </select>
                  </div>
                </div>
                
                <label className="block text-gray-700 text-sm font-bold mb-2">Nội dung câu hỏi</label>
                <textarea name="questionText" value={question.questionText} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded" required />
                
                <div className="my-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
                  <CustomTagInput tags={question.tags || []} setTags={(newTags) => handleTagsChange(qIndex, newTags)} placeholder="Nhập tag và nhấn Enter" />
                </div>

                <div>
                  <h4 className="font-semibold mt-6 mb-2">Các lựa chọn đáp án:</h4>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="bg-white p-3 rounded-lg border shadow-sm mb-3">
                      <div className="flex items-start gap-3">
                        {/* MỚI: Gom radio/checkbox và nút xóa vào một cột */}
                        <div className="flex flex-col items-center gap-2 mt-1">
                           <input 
                              type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'} 
                              name={`correctOption-${qIndex}`} 
                              checked={option.isCorrect} 
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                              className={`${question.questionType === 'multi-select' ? 'form-checkbox' : 'form-radio'} h-5 w-5 text-primary-blue`}
                            />
                           <label className="text-xs text-gray-600">Đáp án đúng</label>
                        </div>
                        
                        {/* MỚI: Gom 2 ô input vào một cột */}
                        <div className="flex-grow">
                          <InputField name="text" value={option.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} placeholder={`Nội dung lựa chọn ${String.fromCharCode(65 + oIndex)}`} required />
                          <InputField name="feedback" value={option.feedback} onChange={(e) => handleOptionChange(qIndex, oIndex, e)} placeholder="Giải thích cho lựa chọn này (tùy chọn)" />
                        </div>
                         <Button type="button" onClick={() => handleDeleteOption(qIndex, oIndex)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 text-xs self-center">Xóa</Button>
                      </div>
                    </div>
                  ))}
                  {question.questionType !== 'true-false' && (
                    <Button type="button" onClick={() => handleAddOption(qIndex)} className="mt-2 bg-green-500 hover:bg-green-600 text-sm">Thêm Lựa Chọn</Button>
                  )}
                </div>

                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Giải thích chung (tùy chọn)</label>
                <textarea name="generalExplanation" value={question.generalExplanation} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded" />
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