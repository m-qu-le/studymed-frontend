// src/components/InputField.js
import React from 'react';

function InputField({ label, type = 'text', name, value, onChange, placeholder, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-gray-700 text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
        {...props}
      />
    </div>
  );
}

export default InputField;