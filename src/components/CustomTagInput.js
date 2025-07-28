// src/components/CustomTagInput.js
import React from 'react';

function CustomTagInput({ tags, setTags, placeholder }) {
  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const addTag = (event) => {
    // Khi người dùng nhấn Enter và ô input không trống
    if (event.key === 'Enter' && event.target.value !== "") {
      event.preventDefault(); // Ngăn form submit nếu có
      setTags([...tags, event.target.value]); // Thêm tag mới vào mảng
      event.target.value = ""; // Xóa trắng ô input
    }
  };

  return (
    <div className="custom-tag-input-container">
      <ul className="tags-list">
        {tags.map((tag, index) => (
          <li key={index} className="tag-item">
            <span className="tag-title">{tag}</span>
            <span className="tag-close-icon" onClick={() => removeTag(index)}>
              x
            </span>
          </li>
        ))}
      </ul>
      <input
        type="text"
        onKeyDown={addTag}
        placeholder={placeholder}
        className="tag-input"
      />
    </div>
  );
}

export default CustomTagInput;