// src/context/AlertContext.js
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Để tạo ID duy nhất cho mỗi alert (chúng ta sẽ cài đặt thư viện này)

// Tạo Context
const AlertContext = createContext();

// Custom hook để sử dụng alert
export const useAlert = () => useContext(AlertContext);

// Alert Provider component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Hàm để thiết lập alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = uuidv4(); // Tạo ID duy nhất
    setAlerts((prevAlerts) => [...prevAlerts, { id, msg, type }]);

    // Tự động xóa alert sau một khoảng thời gian
    setTimeout(() => removeAlert(id), timeout);
  };

  // Hàm để xóa alert
  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, setAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};