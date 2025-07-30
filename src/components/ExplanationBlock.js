// src/components/ExplanationBlock.js
import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function ExplanationBlock({ question, userAnswers = [], mode = 'review' }) {
  // --- Phần Logic ---
  // 1. Tìm ra các đáp án đúng
  const correctOptionIds = question.options
    .filter(opt => opt.isCorrect)
    .map(opt => opt._id);

  // 2. Kiểm tra xem câu trả lời của người dùng có đúng hoàn toàn không
  const isAnswerCorrect = userAnswers.length === correctOptionIds.length &&
                          userAnswers.every(id => correctOptionIds.includes(id));

  return (
    // --- Phần Giao diện ---
    // Khung bo tròn bên ngoài, không có viền xanh
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-bold text-gray-800 mb-3">Giải thích chi tiết:</h4>
      
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isUserSelected = userAnswers.includes(option._id);

          // 3. Logic hiển thị: Quyết định xem có nên hiển thị giải thích của lựa chọn này không
          let shouldShow = false;
          if (mode === 'reviewPage') { // Chế độ trang Xem lại: luôn hiển thị
            shouldShow = true;
          } else { // Chế độ Ôn tập
            if (isAnswerCorrect) {
              // Nếu làm đúng, chỉ hiện giải thích của đáp án đúng
              if (option.isCorrect) shouldShow = true;
            } else {
              // Nếu làm sai, hiện giải thích của đáp án đúng VÀ đáp án sai đã chọn
              if (option.isCorrect || isUserSelected) shouldShow = true;
            }
          }

          if (!shouldShow) return null;

          return (
            <div key={option._id} className="flex items-start text-sm">
              {/* Icon Trực quan */}
              <div className="w-5 mt-0.5">
                {option.isCorrect && <FiCheckCircle className="text-green-500" />}
                {isUserSelected && !option.isCorrect && <FiXCircle className="text-red-500" />}
              </div>

              {/* Nội dung giải thích */}
              <div className="flex-1">
                <span className={`font-semibold ${option.isCorrect ? 'text-green-700' : ''}`}>
                  {String.fromCharCode(65 + idx)}.
                </span>
                {/* Bỏ font in nghiêng */}
                <span className="ml-2 text-gray-700">{option.feedback || 'Không có giải thích cho lựa chọn này.'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Giải thích chung */}
      {question.generalExplanation && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h5 className="font-semibold text-gray-800 text-sm">Giải thích chung:</h5>
          <p className="text-sm text-gray-700 mt-1">{question.generalExplanation}</p>
        </div>
      )}
    </div>
  );
}

export default ExplanationBlock;