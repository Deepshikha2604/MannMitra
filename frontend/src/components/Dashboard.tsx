import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, TrendingUp, Activity, User, LogOut } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = () => {};

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <div className="welcome-section">
          <h1>How are you feeling today?</h1>
          <p>Your mental wellness companion is here to support you</p>
        </div>

        <div className="quick-actions">
          <Link to="/chat" className="action-card chat-card">
            <div className="card-icon">
              <MessageCircle size={32} />
            </div>
            <h3>Chat with AI</h3>
            <p>Get instant support and guidance</p>
          </Link>

          <Link to="/mood" className="action-card mood-card">
            <div className="card-icon">
              <TrendingUp size={32} />
            </div>
            <h3>Track Mood</h3>
            <p>Log your daily emotions and progress</p>
          </Link>

          <Link to="/activities" className="action-card activities-card">
            <div className="card-icon">
              <Activity size={32} />
            </div>
            <h3>Activities</h3>
            <p>Discover wellness activities for you</p>
          </Link>

          <Link to="/profile" className="action-card profile-card">
            <div className="card-icon">
              <User size={32} />
            </div>
            <h3>Profile</h3>
            <p>Manage your account and preferences</p>
          </Link>
        </div>

        <div className="daily-tips">
          <h2>Daily Wellness Tip</h2>
          <div className="tip-card">
            <p>
              "Take a moment to breathe deeply. Even just 5 minutes of mindful breathing 
              can help reduce stress and improve your mood."
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;






