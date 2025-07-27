// src/pages/QuizFormPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import InputField from '../components/InputField'; // Đã đổi tên từ Input thành InputField
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

function QuizFormPage() {
  const { id } = useParams(); // Lấy ID từ URL nếu đang ở chế độ chỉnh sửa
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { setAlert } = useAlert();

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    questions: [],
    isSystemQuiz: false, // Mặc định không phải bộ đề hệ thống khi tạo thủ công
  });
  const [loading, setLoading] = useState(true); // Loading cho việc tải dữ liệu quiz (nếu là chỉnh sửa)
  const [isEditMode, setIsEditMode] = useState(false); // True nếu đang chỉnh sửa, False nếu đang tạo mới

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  // Fetch quiz data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchQuiz = async () => {
        try {
          const token = getToken();
          if (!token) {
            setAlert('Bạn cần đăng nhập để xem bộ đề.', 'error');
            navigate('/login');
            return;
          }
          const res = await axios.get(`http://localhost:5001/api/quizzes/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setQuiz(res.data);
        } catch (err) {
          console.error('Lỗi khi tải bộ đề để chỉnh sửa:', err);
          setAlert('Không thể tải bộ đề. Vui lòng thử lại.', 'error');
          navigate('/dashboard'); // Điều hướng về dashboard nếu không tải được
        } finally {
          setLoading(false);
        }
      };
      fetchQuiz();
    } else {
      setLoading(false); // Not in edit mode, so no loading for fetching data
    }
  }, [id, navigate, setAlert, getToken]);

  // Handle authentication and authorization (kiểm tra người dùng đã đăng nhập và có quyền)
  useEffect(() => {
    // Nếu AuthProvider đã tải xong và người dùng chưa xác thực
    if (!authLoading && !isAuthenticated) {
      setAlert('Bạn cần đăng nhập để truy cập trang này.', 'error');
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate, setAlert]);


  // Handler cho các trường thông tin chung của quiz (title, description, subject, topic, isSystemQuiz)
  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handler cho các trường của từng câu hỏi (questionText, questionType, generalExplanation)
  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [name]: value };
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  // Handler cho các trường của từng lựa chọn đáp án (text, isCorrect, feedback)
  const handleOptionChange = (qIndex, oIndex, e) => {
    const { name, value, type, checked } = e.target;
    const newQuestions = [...quiz.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = { ...newOptions[oIndex], [name]: type === 'checkbox' ? checked : value };
    newQuestions[qIndex].options = newOptions;
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  // Thêm một câu hỏi mới vào danh sách
  const handleAddQuestion = () => {
    setQuiz(prevQuiz => ({
      ...prevQuiz,
      questions: [
        ...prevQuiz.questions,
        {
          questionText: '',
          questionType: 'single-choice', // Mặc định là single-choice
          options: [
            { text: '', isCorrect: false, feedback: '' },
            { text: '', isCorrect: false, feedback: '' }
          ],
          generalExplanation: ''
        }
      ]
    }));
  };

  // Xóa một câu hỏi khỏi danh sách
  const handleDeleteQuestion = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      setQuiz(prevQuiz => ({
        ...prevQuiz,
        questions: prevQuiz.questions.filter((_, i) => i !== index)
      }));
    }
  };

  // Thêm một lựa chọn đáp án vào một câu hỏi cụ thể
  const handleAddOption = (qIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options.push({ text: '', isCorrect: false, feedback: '' });
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  // Xóa một lựa chọn đáp án khỏi một câu hỏi cụ thể
  const handleDeleteOption = (qIndex, oIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
  };

  // Xử lý gửi form (tạo mới hoặc cập nhật quiz)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        setAlert('Bạn cần đăng nhập để lưu bộ đề.', 'error');
        navigate('/login');
        return;
      }

      // Frontend Validation (kiểm tra dữ liệu trước khi gửi lên backend)
      if (!quiz.title || !quiz.subject || quiz.questions.length === 0) {
        setAlert('Vui lòng điền đầy đủ tiêu đề, môn học và thêm ít nhất một câu hỏi.', 'error');
        return;
      }

      for (const q of quiz.questions) {
        if (!q.questionText) {
          setAlert('Tất cả các câu hỏi phải có nội dung.', 'error');
          return;
        }
        if (q.options.length < 2) {
          setAlert('Mỗi câu hỏi phải có ít nhất 2 lựa chọn.', 'error');
          return;
        }
        const correctOptions = q.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          setAlert(`Câu hỏi "${q.questionText}" phải có ít nhất một đáp án đúng.`, 'error');
          return;
        }
        if (q.questionType === 'single-choice' && correctOptions.length > 1) {
          setAlert(`Câu hỏi một lựa chọn "${q.questionText}" chỉ được có một đáp án đúng.`, 'error');
          return;
        }
      }

      let res;
      if (isEditMode) {
        // Chế độ chỉnh sửa: Gửi PUT request
        res = await axios.put(`http://localhost:5001/api/quizzes/${id}`, quiz, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAlert('Cập nhật bộ đề thành công!', 'success');
      } else {
        // Chế độ tạo mới: Gửi POST request
        res = await axios.post('http://localhost:5001/api/quizzes', quiz, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAlert('Tạo bộ đề mới thành công!', 'success');
      }
      navigate('/dashboard'); // Quay về dashboard sau khi lưu
    } catch (err) {
      console.error('Lỗi khi lưu bộ đề:', err);
      if (err.response) {
        const msg = err.response.data.msg;
        if (msg) {
          setAlert(msg, 'error');
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          err.response.data.errors.forEach(error => setAlert(error.msg, 'error'));
        } else {
          setAlert('Lỗi từ server khi lưu bộ đề. Vui lòng kiểm tra dữ liệu.', 'error');
        }
      } else {
        setAlert('Lỗi mạng hoặc không thể kết nối server.', 'error');
      }
    }
  };

  // Hiển thị màn hình tải trong khi AuthProvider đang kiểm tra xác thực
  if (authLoading || loading) { // loading ở đây là loading của việc fetch quiz data
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-soft-gray p-4">
        <p className="text-xl text-gray-700">Đang tải...</p>
      </div>
    );
  }

  // Nếu người dùng không xác thực sau khi authLoading đã hoàn tất, điều hướng về login
  // (AuthProvider đã làm việc này, nhưng đây là một lớp bảo vệ bổ sung)
  if (!isAuthenticated) {
    return null;
  }

  // Kiểm tra quyền: Nếu người dùng không phải admin và đang cố gắng chỉnh sửa một bộ đề hệ thống
  // hoặc đang cố gắng đặt isSystemQuiz = true (nếu isEditMode = false)
  if (isEditMode && quiz.isSystemQuiz && user.role !== 'admin') {
      setAlert('Bạn không có quyền chỉnh sửa bộ đề hệ thống.', 'error');
      navigate('/dashboard');
      return null;
  }
  // Nếu là tạo mới và cố tình bật isSystemQuiz mà không phải admin, checkbox sẽ bị disable
  // Logic kiểm tra quyền tạo isSystemQuiz đã có trong backend.


  return (
    <div className="min-h-[calc(100vh-80px)] bg-soft-gray p-4">
      <div className="container mx-auto p-8 bg-white rounded-xl shadow-lg max-w-4xl"> {/* Tăng max-w */}
        <h1 className="text-3xl font-bold text-primary-blue mb-8 text-center">
          {isEditMode ? 'Chỉnh Sửa Bộ Đề' : 'Tạo Bộ Đề Mới'}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Thông tin chung về Bộ đề */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thông tin Bộ đề</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField // Đã đổi tên từ Input thành InputField
                label="Tiêu đề Bộ đề"
                name="title"
                value={quiz.title}
                onChange={handleQuizChange}
                placeholder="Ví dụ: Giải Phẫu - Hệ Tiêu Hóa"
                required
              />
              <InputField // Đã đổi tên từ Input thành InputField
                label="Môn học"
                name="subject"
                value={quiz.subject}
                onChange={handleQuizChange}
                placeholder="Ví dụ: Giải Phẫu, Dược Lý"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InputField // Đã đổi tên từ Input thành InputField
                label="Chủ đề (Tùy chọn)"
                name="topic"
                value={quiz.topic}
                onChange={handleQuizChange}
                placeholder="Ví dụ: Dạ dày, Thuốc kháng sinh"
              />
              <div className="flex items-center mt-2">
                {/* Chỉ hiển thị và cho phép admin tương tác với checkbox isSystemQuiz */}
                {user && user.role === 'admin' && ( 
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isSystemQuiz"
                      checked={quiz.isSystemQuiz}
                      onChange={handleQuizChange}
                      className="form-checkbox h-5 w-5 text-primary-blue rounded-md transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-gray-700">Bộ đề hệ thống (Chỉ admin)</span>
                  </label>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={quiz.description}
                onChange={handleQuizChange}
                rows="3"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition duration-200 ease-in-out"
                placeholder="Mô tả ngắn gọn về bộ đề này..."
              ></textarea>
            </div>
          </div>

          {/* Phần quản lý Câu hỏi */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Các câu hỏi</h2>
            {quiz.questions.length === 0 && (
              <p className="text-center text-gray-500 mb-4">Chưa có câu hỏi nào. Hãy thêm một câu hỏi!</p>
            )}
            {quiz.questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-700">Câu hỏi {qIndex + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => handleDeleteQuestion(qIndex)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 text-sm"
                  >
                    Xóa Câu Hỏi
                  </Button>
                </div>

                <div className="mb-4">
                  <label htmlFor={`questionText-${qIndex}`} className="block text-gray-700 text-sm font-bold mb-2">Nội dung câu hỏi</label>
                  <textarea
                    id={`questionText-${qIndex}`}
                    name="questionText"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, e)}
                    rows="2"
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition duration-200 ease-in-out"
                    placeholder="Nhập nội dung câu hỏi..."
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor={`questionType-${qIndex}`} className="block text-gray-700 text-sm font-bold mb-2">Loại câu hỏi</label>
                  <select
                    id={`questionType-${qIndex}`}
                    name="questionType"
                    value={question.questionType}
                    onChange={(e) => {
                      const newQuestions = [...quiz.questions];
                      const newType = e.target.value;
                      newQuestions[qIndex].questionType = newType;
                      // Reset options based on type if needed
                      if (newType === 'true-false') {
                        newQuestions[qIndex].options = [
                          { text: 'Đúng', isCorrect: false, feedback: '' },
                          { text: 'Sai', isCorrect: false, feedback: '' }
                        ];
                      } else if (newQuestions[qIndex].options.length < 2) {
                        newQuestions[qIndex].options = [
                          { text: '', isCorrect: false, feedback: '' },
                          { text: '', isCorrect: false, feedback: '' }
                        ];
                      }
                      setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
                    }}
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition duration-200 ease-in-out"
                  >
                    <option value="single-choice">Một lựa chọn</option>
                    <option value="multi-select">Nhiều lựa chọn</option>
                    <option value="true-false">Đúng/Sai</option>
                  </select>
                </div>

                {/* Options for the question */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">Các lựa chọn đáp án:</h4>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-start mb-3 bg-white p-3 rounded-md shadow-sm border border-gray-100">
                      {question.questionType === 'single-choice' ? (
                        <input
                          type="radio"
                          name={`correctOption-${qIndex}`} // name unique for each question's radio group
                          checked={option.isCorrect}
                          onChange={() => {
                            const newQuestions = [...quiz.questions];
                            // Khi chọn 1 radio, các radio khác của câu hỏi đó phải false
                            newQuestions[qIndex].options.forEach((opt, idx) => {
                              opt.isCorrect = (idx === oIndex);
                            });
                            setQuiz(prevQuiz => ({ ...prevQuiz, questions: newQuestions }));
                          }}
                          className="form-radio h-5 w-5 text-primary-blue mt-1 mr-2"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          name="isCorrect" // name generic for checkboxes
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                          className="form-checkbox h-5 w-5 text-primary-blue rounded-md mt-1 mr-2"
                        />
                      )}
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                        <InputField // Đã đổi tên từ Input thành InputField
                          label={`Lựa chọn ${oIndex + 1}`}
                          name="text"
                          value={option.text}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                          placeholder={`Nội dung lựa chọn ${oIndex + 1}`}
                          required
                          className="w-full"
                          labelClassName="sr-only" // Ẩn label trực quan, dùng placeholder
                        />
                        <InputField // Đã đổi tên từ Input thành InputField
                          label={`Giải thích lựa chọn ${oIndex + 1} (Tùy chọn)`}
                          name="feedback"
                          value={option.feedback}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                          placeholder="Giải thích cho lựa chọn này..."
                          className="w-full"
                          labelClassName="sr-only"
                        />
                      </div>
                      {(question.questionType !== 'true-false' || question.options.length > 2) && ( // Không cho xóa nếu là true-false và chỉ có 2 option
                        <Button
                          type="button"
                          onClick={() => handleDeleteOption(qIndex, oIndex)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-2 text-sm ml-2 self-start"
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  ))}
                  {/* Nút thêm lựa chọn chỉ hiển thị nếu không phải là câu hỏi Đúng/Sai (vì True/False luôn có 2 options) */}
                  {question.questionType !== 'true-false' && (
                    <Button
                      type="button"
                      onClick={() => handleAddOption(qIndex)}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 text-sm mt-3"
                    >
                      Thêm Lựa Chọn
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor={`generalExplanation-${qIndex}`} className="block text-gray-700 text-sm font-bold mb-2">Giải thích chung cho câu hỏi (Tùy chọn)</label>
                  <textarea
                    id={`generalExplanation-${qIndex}`}
                    name="generalExplanation"
                    value={question.generalExplanation}
                    onChange={(e) => handleQuestionChange(qIndex, e)}
                    rows="2"
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition duration-200 ease-in-out"
                    placeholder="Giải thích tổng thể về câu hỏi và đáp án đúng..."
                  ></textarea>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={handleAddQuestion}
              className="bg-primary-blue hover:bg-primary-blue-active text-white py-2 px-4 mt-4 w-full"
            >
              Thêm Câu Hỏi Mới
            </Button>
          </div>

          {/* Nút Lưu và Hủy */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              secondary
              onClick={() => navigate('/dashboard')}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              primary
            >
              {isEditMode ? 'Cập Nhật Bộ Đề' : 'Lưu Bộ Đề'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizFormPage;