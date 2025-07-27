// src/components/StudyMedIcon.js
import React from 'react';

function StudyMedIcon({ className = 'w-24 h-24 text-primary-blue' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Đây là một icon đơn giản tượng trưng cho cuốn sách hoặc học tập */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.208 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.792 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.792 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.523 18.208 18 16.5 18s-3.332.477-4.5 1.253"></path>
    </svg>
  );
}

export default StudyMedIcon;