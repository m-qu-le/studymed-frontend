// src/App.js
import React from 'react';
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

const AppContent = () => {
  const location = useLocation();
  const isQuizTakingPage = location.pathname.startsWith('/quiz/take/');
  const isHomePage = location.pathname === '/';
  
  // Chỉ áp dụng padding nếu Navbar hiển thị
  const shouldApplyPadding = !isQuizTakingPage && !isHomePage;

  return (
    <>
      {/* MỚI: Thêm điều kiện !isHomePage để ẩn Navbar cả ở trang chủ */}
      {!isQuizTakingPage && !isHomePage && <Navbar />}
      
      <AlertMessage />

      <div className={shouldApplyPadding ? "pt-16" : ""}>
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
          <AppContent />
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;