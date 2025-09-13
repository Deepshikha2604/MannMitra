import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Settings, Bell, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="profile">
      <header className="profile-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
        </Link>
        <h1>Profile</h1>
        <div className="header-actions">
          <button className="action-btn">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'User'}</h2>
            <p>{user?.phone}</p>
            <span className="profile-status">Active</span>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{user?.name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{user?.phone}</span>
              </div>
              <div className="info-item">
                <label>Age</label>
                <span>{user?.age || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{user?.location || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Preferred Language</label>
                <span>{user?.preferred_language || 'Hindi'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Preferences</h3>
            <div className="preference-item">
              <div className="preference-info">
                <Bell size={20} />
                <span>Notifications</span>
              </div>
              <button className="toggle-btn">On</button>
            </div>
            <div className="preference-item">
              <div className="preference-info">
                <Shield size={20} />
                <span>Privacy Mode</span>
              </div>
              <button className="toggle-btn">Off</button>
            </div>
          </div>

          <div className="profile-section">
            <h3>Support</h3>
            <button className="support-btn">
              <HelpCircle size={20} />
              <span>Help & Support</span>
            </button>
            <button className="support-btn">
              <Shield size={20} />
              <span>Privacy Policy</span>
            </button>
            <button className="support-btn">
              <Settings size={20} />
              <span>Terms of Service</span>
            </button>
          </div>

          <div className="profile-section">
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;










