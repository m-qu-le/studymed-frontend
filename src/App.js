// src/App.js
import React from 'react';
// MỚI: Import thêm useLocation
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import AlertMessage from './components/AlertMessage';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BulkUploadPage from './pages/BulkUploadPage';
import QuizFormPage from './pages/QuizFormPage';
import QuizTakingPage from './pages/QuizTakingPage';
import QuizResultPage from './pages/QuizResultPage';
import QuizReviewPage from './pages/QuizReviewPage';
import BookmarkedQuestionsPage from './pages/BookmarkedQuestionsPage';

import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';

// MỚI: Tạo một component con để có thể sử dụng hook useLocation
const AppContent = () => {
  const location = useLocation();
  // Kiểm tra xem có đang ở trang làm bài không
  const isQuizTakingPage = location.pathname.startsWith('/quiz/take/');

  return (
    <>
      {/* Chỉ hiển thị Navbar nếu KHÔNG phải trang làm bài */}
      {!isQuizTakingPage && <Navbar />}
      
      <AlertMessage />

      {/* Chỉ thêm padding top nếu Navbar được hiển thị */}
      <div className={!isQuizTakingPage ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bulk-upload" element={<BulkUploadPage />} />
          <Route path="/quiz/new" element={<QuizFormPage />} />
          <Route path="/quiz/edit/:id" element={<QuizFormPage />} />
          <Route path="/quiz/take/:id" element={<QuizTakingPage />} />
          <Route path="/quiz/result/:id" element={<QuizResultPage />} />
          <Route path="/quiz/review/:id" element={<QuizReviewPage />} />
          <Route path="/bookmarks" element={<BookmarkedQuestionsPage />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          {/* MỚI: Sử dụng AppContent để quản lý hiển thị Navbar */}
          <AppContent />
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;