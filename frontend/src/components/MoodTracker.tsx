import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import './MoodTracker.css';

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad' },
    { value: 2, emoji: '😔', label: 'Sad' },
    { value: 3, emoji: '😕', label: 'Down' },
    { value: 4, emoji: '😐', label: 'Neutral' },
    { value: 5, emoji: '🙂', label: 'Okay' },
    { value: 6, emoji: '😊', label: 'Good' },
    { value: 7, emoji: '😄', label: 'Happy' },
    { value: 8, emoji: '😁', label: 'Very Happy' },
    { value: 9, emoji: '🤩', label: 'Excited' },
    { value: 10, emoji: '🥳', label: 'Amazing' },
  ];

  const emotions = [
    'Happy', 'Sad', 'Anxious', 'Angry', 'Excited', 'Calm', 
    'Frustrated', 'Grateful', 'Lonely', 'Confident', 'Worried', 'Peaceful'
  ];

  const handleLogMood = () => {
    if (selectedMood && selectedEmotion) {
      // TODO: Implement mood logging API call
      console.log('Logging mood:', { mood: selectedMood, emotion: selectedEmotion });
      alert('Mood logged successfully!');
      setSelectedMood(null);
      setSelectedEmotion('');
    }
  };

  return (
    <div className="mood-tracker">
      <header className="mood-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
        </Link>
        <h1>Mood Tracker</h1>
        <div className="header-actions">
          <button className="action-btn">
            <Calendar size={20} />
          </button>
          <button className="action-btn">
            <BarChart3 size={20} />
          </button>
        </div>
      </header>

      <main className="mood-main">
        <div className="mood-section">
          <h2>How are you feeling right now?</h2>
          <div className="mood-grid">
            {moods.map((mood) => (
              <button
                key={mood.value}
                className={`mood-btn ${selectedMood === mood.value ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="mood-value">{mood.value}</span>
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="emotion-section">
          <h3>What emotion best describes how you feel?</h3>
          <div className="emotion-grid">
            {emotions.map((emotion) => (
              <button
                key={emotion}
                className={`emotion-btn ${selectedEmotion === emotion ? 'selected' : ''}`}
                onClick={() => setSelectedEmotion(emotion)}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div className="mood-actions">
          <button
            className="log-mood-btn"
            onClick={handleLogMood}
            disabled={!selectedMood || !selectedEmotion}
          >
            <TrendingUp size={20} />
            Log My Mood
          </button>
        </div>

        <div className="mood-history">
          <h3>Recent Mood Entries</h3>
          <div className="history-placeholder">
            <p>Your mood history will appear here</p>
            <small>Start logging your moods to see patterns and insights</small>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MoodTracker;






