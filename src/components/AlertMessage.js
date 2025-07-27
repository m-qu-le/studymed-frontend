// src/components/AlertMessage.js
import React from 'react';
import { useAlert } from '../context/AlertContext'; // Import custom hook useAlert

function AlertMessage() {
  const { alerts } = useAlert(); // Lấy danh sách alerts từ context

  // Nếu không có alert nào, không hiển thị gì cả
  if (alerts === null || alerts.length === 0) {
    return null;
  }

  // Render các alert
  return (
    <div className="fixed top-20 right-4 z-50 space-y-3"> {/* Đặt alert ở góc trên bên phải */}
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-lg text-white text-sm font-semibold max-w-xs transition-opacity duration-300 ease-out transform ${
            alert.type === 'success' ? 'bg-green-500' :
            alert.type === 'error' ? 'bg-red-500' :
            alert.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500' // Default type
          }`}
        >
          {alert.msg}
        </div>
      ))}
    </div>
  );
}

export default AlertMessage;