import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Clock, Star } from 'lucide-react';
import './Activities.css';

const Activities: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: '5-Minute Breathing Exercise',
      duration: '5 min',
      category: 'Mindfulness',
      description: 'A simple breathing exercise to help you relax and center yourself.',
      difficulty: 'Easy'
    },
    {
      id: 2,
      title: 'Gratitude Journaling',
      duration: '10 min',
      category: 'Reflection',
      description: 'Write down three things you are grateful for today.',
      difficulty: 'Easy'
    },
    {
      id: 3,
      title: 'Body Scan Meditation',
      duration: '15 min',
      category: 'Mindfulness',
      description: 'A guided meditation to help you connect with your body.',
      difficulty: 'Medium'
    },
    {
      id: 4,
      title: 'Creative Drawing',
      duration: '20 min',
      category: 'Creative',
      description: 'Express your emotions through art and creativity.',
      difficulty: 'Easy'
    }
  ];

  return (
    <div className="activities">
      <header className="activities-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
        </Link>
        <h1>Wellness Activities</h1>
        <div className="header-actions">
          <button className="action-btn">
            <Clock size={20} />
          </button>
        </div>
      </header>

      <main className="activities-main">
        <div className="activities-intro">
          <h2>Discover activities tailored for you</h2>
          <p>Choose from a variety of wellness activities designed to support your mental health journey.</p>
        </div>

        <div className="activities-grid">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-header">
                <div className="activity-icon">
                  <Activity size={24} />
                </div>
                <div className="activity-meta">
                  <span className="activity-duration">{activity.duration}</span>
                  <span className="activity-difficulty">{activity.difficulty}</span>
                </div>
              </div>
              
              <div className="activity-content">
                <h3>{activity.title}</h3>
                <p className="activity-category">{activity.category}</p>
                <p className="activity-description">{activity.description}</p>
              </div>
              
              <div className="activity-actions">
                <button className="start-activity-btn">
                  Start Activity
                </button>
                <button className="favorite-btn">
                  <Star size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-activities">
          <h3>Quick Activities (5 minutes or less)</h3>
          <div className="quick-grid">
            <button className="quick-activity">Deep Breathing</button>
            <button className="quick-activity">Stretching</button>
            <button className="quick-activity">Gratitude List</button>
            <button className="quick-activity">Mindful Walking</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Activities;










