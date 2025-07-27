// src/components/Button.js
import React from 'react';

function Button({ children, primary, secondary, className, ...props }) {
  const baseStyles = "py-3 px-6 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

  let colorStyles = "";
  if (primary) {
    colorStyles = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
  } else if (secondary) {
    colorStyles = "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400";
  } else {
    // Default style if no primary/secondary is specified
    colorStyles = "bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-500";
  }

  return (
    <button
      className={`${baseStyles} ${colorStyles} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;