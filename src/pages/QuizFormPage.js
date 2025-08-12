// src/pages/QuizFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import CustomTagInput from '../components/CustomTagInput';

// Component con để sửa câu hỏi, giúp tái sử dụng code
const QuestionEditor = ({ question, qIndex, handleQuestionChange, handleTagsChange, handleOptionChange, handleDeleteOption, handleAddOption, isChild = false, childIndex = 0 }) => {
  return (
    <div className={`p-4 rounded-lg border ${isChild ? 'bg-white' : 'bg-gray-50'}`}>
      <textarea
        name="questionText"
        value={question.questionText}
        onChange={(e) => handleQuestionChange(qIndex, e, childIndex)}
        className="shadow w-full p-2 border rounded"
        placeholder={`Nội dung câu hỏi ${isChild ? `con ${childIndex + 1}` : ''}`}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Loại câu hỏi</label>
          <select name="questionType" value={question.questionType} onChange={(e) => handleQuestionChange(qIndex, e, childIndex)} className="shadow w-full p-2 border rounded bg-white">
            <option value="single-choice">Một đáp án</option>
            <option value="multi-select">Nhiều đáp án</option>
            <option value="true-false">Đúng / Sai</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Độ khó</label>
          <select name="difficulty" value={question.difficulty || 'Thông hiểu'} onChange={(e) => handleQuestionChange(qIndex, e, childIndex)} className="shadow w-full p-2 border rounded bg-white">
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
        <CustomTagInput tags={question.tags || []} setTags={(newTags) => handleTagsChange(qIndex, newTags, childIndex)} placeholder="Nhập tag và nhấn Enter" />
      </div>
      <div>
        <h4 className="font-semibold mt-4 mb-2">Các lựa chọn đáp án:</h4>
        {question.options.map((option, oIndex) => (
          <div key={oIndex} className="flex items-center gap-3 mt-2 bg-gray-100 p-2 rounded-md">
            <input type={question.questionType === 'multi-select' ? 'checkbox' : 'radio'} name={`correctOption-${qIndex}-${childIndex}`} checked={option.isCorrect} onChange={(e) => handleOptionChange(qIndex, oIndex, e, childIndex)} className={`${question.questionType === 'multi-select' ? 'form-checkbox' : 'form-radio'} h-5 w-5 text-primary-blue`} />
            <InputField name="text" value={option.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e, childIndex)} className="flex-grow" placeholder={`Lựa chọn ${String.fromCharCode(65 + oIndex)}`} required />
            <InputField name="feedback" value={option.feedback} onChange={(e) => handleOptionChange(qIndex, oIndex, e, childIndex)} className="flex-grow" placeholder="Giải thích (tùy chọn)" />
            <Button type="button" onClick={() => handleDeleteOption(qIndex, oIndex, childIndex)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-2 text-xs">Xóa</Button>
          </div>
        ))}
        {question.questionType !== 'true-false' && (
          <Button type="button" onClick={() => handleAddOption(qIndex, childIndex)} className="mt-2 bg-green-500 hover:bg-green-600 text-sm">Thêm Lựa Chọn</Button>
        )}
      </div>
      <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Giải thích chung (tùy chọn)</label>
      <textarea name="generalExplanation" value={question.generalExplanation} onChange={(e) => handleQuestionChange(qIndex, e, childIndex)} className="shadow w-full p-2 border rounded" />
    </div>
  );
};


function QuizFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState({ title: '', description: '', subject: '', topic: '', questions: [] });
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
    const { name, value } = e.target;
    setQuiz(prevQuiz => ({ ...prevQuiz, [name]: value }));
  };

  // ĐÃ SỬA: Bổ sung lại logic tự động tạo đáp án cho loại "true-false"
  const handleQuestionChange = (qIndex, e, childIndex = null) => {
    const { name, value } = e.target;
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    
    const targetQuestion = childIndex !== null 
      ? newQuestions[qIndex].childQuestions[childIndex] 
      : newQuestions[qIndex];

    targetQuestion[name] = value;

    // Logic tự động tạo đáp án Đúng/Sai khi thay đổi questionType
    if (name === 'questionType' && value === 'true-false') {
      targetQuestion.options = [
        { text: 'Đúng', isCorrect: true, feedback: '' },
        { text: 'Sai', isCorrect: false, feedback: '' },
      ];
    }
    
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleTagsChange = (qIndex, newTags, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    if (childIndex !== null) {
      newQuestions[qIndex].childQuestions[childIndex].tags = newTags;
    } else {
      newQuestions[qIndex].tags = newTags;
    }
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleOptionChange = (qIndex, oIndex, e, childIndex = null) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    const targetQuestion = childIndex !== null ? newQuestions[qIndex].childQuestions[childIndex] : newQuestions[qIndex];
    
    targetQuestion.options[oIndex] = { ...targetQuestion.options[oIndex], [name]: type === 'checkbox' ? checked : value };
    
    // Logic cho radio button (single-choice & true-false)
    if (targetQuestion.questionType !== 'multi-select' && type === 'radio') {
      targetQuestion.options.forEach((opt, idx) => {
        opt.isCorrect = idx === oIndex;
      });
    }
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAddOption = (qIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    const targetQuestion = childIndex !== null ? newQuestions[qIndex].childQuestions[childIndex] : newQuestions[qIndex];
    targetQuestion.options.push({ text: '', isCorrect: false, feedback: '' });
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleDeleteOption = (qIndex, oIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    const targetQuestion = childIndex !== null ? newQuestions[qIndex].childQuestions[childIndex] : newQuestions[qIndex];
    targetQuestion.options = targetQuestion.options.filter((_, i) => i !== oIndex);
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleDeleteQuestion = (qIndex, childIndex = null) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    if (childIndex !== null) {
      newQuestions[qIndex].childQuestions = newQuestions[qIndex].childQuestions.filter((_, i) => i !== childIndex);
    } else {
      newQuestions.splice(qIndex, 1);
    }
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAddSingleQuestion = () => {
    setQuiz(prev => ({ ...prev, questions: [
      ...prev.questions,
      { type: 'single', questionText: '', questionType: 'single-choice', tags: [], difficulty: 'Thông hiểu', options: [{ text: '', isCorrect: true, feedback: '' }, { text: '', isCorrect: false, feedback: '' }], generalExplanation: '' }
    ]}));
  };
  
  const handleAddGroupQuestion = () => {
    setQuiz(prev => ({ ...prev, questions: [
      ...prev.questions,
      { type: 'group', caseStem: '', childQuestions: [] }
    ]}));
  };

  const handleAddChildQuestion = (qIndex) => {
    const newQuestions = JSON.parse(JSON.stringify(quiz.questions));
    newQuestions[qIndex].childQuestions.push({
      questionText: '', questionType: 'single-choice', tags: [], difficulty: 'Thông hiểu', options: [{ text: '', isCorrect: true, feedback: '' }, { text: '', isCorrect: false, feedback: '' }], generalExplanation: ''
    });
    setQuiz(prev => ({ ...prev, questions: newQuestions }));
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

  if (loading || authLoading) return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-soft-gray p-4">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl">
        <h1 className="text-3xl font-bold text-primary-blue mb-8 text-center">{isEditMode ? 'Chỉnh Sửa Bộ Đề' : 'Tạo Bộ Đề Mới'}</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-8 p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin chung</h2>
            <InputField label="Tiêu đề Bộ đề" name="title" value={quiz.title} onChange={handleQuizChange} required />
            <InputField label="Môn học" name="subject" value={quiz.subject} onChange={handleQuizChange} required />
            <InputField label="Chủ đề (Tùy chọn)" name="topic" value={quiz.topic} onChange={handleQuizChange} />
            <textarea name="description" value={quiz.description} onChange={handleQuizChange} placeholder="Mô tả" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mt-4" />
          </div>
          
          <div className="mb-8 p-6 border border-gray-200 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Các câu hỏi</h2>
            {quiz.questions.map((item, qIndex) => (
              <div key={qIndex} className="bg-gray-100 p-6 rounded-2xl shadow-md mb-6 border">
                {item.type === 'single' ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-700">Câu hỏi đơn {qIndex + 1}</h3>
                      <Button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="bg-red-500 hover:bg-red-600">Xóa</Button>
                    </div>
                    <QuestionEditor question={item} qIndex={qIndex} handleQuestionChange={handleQuestionChange} handleTagsChange={handleTagsChange} handleOptionChange={handleOptionChange} handleDeleteOption={handleDeleteOption} handleAddOption={handleAddOption} />
                  </>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-700">Nhóm câu hỏi {qIndex + 1} (Case Study)</h3>
                      <Button type="button" onClick={() => handleDeleteQuestion(qIndex)} className="bg-red-500 hover:bg-red-600">Xóa Nhóm</Button>
                    </div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Nội dung Case Study</label>
                    <textarea name="caseStem" value={item.caseStem} onChange={(e) => handleQuestionChange(qIndex, e)} className="shadow w-full p-2 border rounded mb-4" required />
                    {item.childQuestions.map((child, childIndex) => (
                      <div key={childIndex} className="mb-4 pl-4 border-l-4 border-primary-blue">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-600">Câu hỏi con {childIndex + 1}</h4>
                          <Button type="button" onClick={() => handleDeleteQuestion(qIndex, childIndex)} className="bg-red-400 hover:bg-red-500 text-xs py-1 px-2">Xóa câu con</Button>
                        </div>
                        <QuestionEditor question={child} qIndex={qIndex} childIndex={childIndex} handleQuestionChange={handleQuestionChange} handleTagsChange={handleTagsChange} handleOptionChange={handleOptionChange} handleDeleteOption={handleDeleteOption} handleAddOption={handleAddOption} isChild={true} />
                      </div>
                    ))}
                    <Button type="button" onClick={() => handleAddChildQuestion(qIndex)} className="w-full bg-blue-300 hover:bg-blue-400 text-sm mt-2">Thêm câu hỏi con</Button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button type="button" onClick={handleAddSingleQuestion} className="w-full bg-primary-blue hover:bg-primary-blue-active">Thêm Câu Hỏi Đơn</Button>
              <Button type="button" onClick={handleAddGroupQuestion} className="w-full bg-indigo-500 hover:bg-indigo-600">Thêm Nhóm Câu Hỏi (Case)</Button>
            </div>
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