import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import MoodTracker from './components/MoodTracker';
import Activities from './components/Activities';
import Profile from './components/Profile';
import Programs from './components/Programs';
import Assessments from './components/Assessments';
import Resources from './components/Resources';
import Helpline from './components/Helpline';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/mood" element={
                <ProtectedRoute>
                  <MoodTracker />
                </ProtectedRoute>
              } />
              <Route path="/activities" element={
                <ProtectedRoute>
                  <Activities />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/programs" element={
                <ProtectedRoute>
                  <Programs />
                </ProtectedRoute>
              } />
              <Route path="/assessments" element={
                <ProtectedRoute>
                  <Assessments />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <Resources />
                </ProtectedRoute>
              } />
              <Route path="/helpline" element={<Helpline />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
