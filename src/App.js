// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Navbar đã được xóa, không import nữa

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

// MỚI: Vì không còn Navbar, component AppContent không còn cần thiết, chúng ta gộp lại cho đơn giản
function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <AlertMessage />

          {/* Không còn div với padding-top nữa */}
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
            <Route path="/study-by-tag" element={<StudyByTagPage />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;