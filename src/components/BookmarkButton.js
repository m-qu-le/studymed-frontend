// src/components/BookmarkButton.js
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa'; // Import icon ngôi sao

function BookmarkButton({ questionId, isBookmarked, onClick, className = '' }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Ngăn sự kiện click lan truyền ra các phần tử cha (nếu có)
        onClick(questionId);
      }}
      className={`focus:outline-none transition-colors duration-200 ease-in-out ${className}`}
      title={isBookmarked ? "Xóa khỏi bookmark" : "Thêm vào bookmark"}
    >
      {isBookmarked ? (
        <FaStar className="text-yellow-400 hover:text-yellow-500 text-xl" /> // Ngôi sao đầy (đã bookmark)
      ) : (
        <FaRegStar className="text-gray-400 hover:text-gray-500 text-xl" /> // Ngôi sao rỗng (chưa bookmark)
      )}
    </button>
  );
}

export default BookmarkButton;