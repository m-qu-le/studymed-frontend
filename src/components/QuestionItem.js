// src/components/QuestionItem.js
import React from 'react';

function QuestionItem({ question, index, userAnswer, onAnswerChange }) {
  const questionId = question._id;
  const questionType = question.questionType;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Câu {index + 1}: {question.questionText}
      </h3>
      <div className="space-y-4">
        {question.options.map((option, idx) => (
          <label key={option._id} className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type={questionType === 'multi-select' ? 'checkbox' : 'radio'}
              name={`question-${questionId}`}
              value={option._id}
              checked={userAnswer?.includes(option._id) || false}
              onChange={() => onAnswerChange(questionId, option._id, questionType)}
              className={`mt-1 h-5 w-5 ${questionType === 'multi-select' ? 'form-checkbox' : 'form-radio'} text-primary-blue`}
            />
            <span className="ml-3 text-gray-800 text-base flex-1">
              <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
              {option.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionItem;