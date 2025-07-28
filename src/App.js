// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          {/* Navbar được cố định */}
          <Navbar />
          {/* AlertMessage cũng cố định, không cần padding */}
          <AlertMessage />

          {/* MỚI: Thêm padding-top cho nội dung chính để không bị Navbar che */}
          {/* Navbar cao khoảng 64px (h-16), pt-16 (64px) là hợp lý */}
          <div className="pt-16"> {/* Padding top để nội dung không bị che */}
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
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;