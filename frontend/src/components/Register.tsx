import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Heart, MessageCircle, Brain, ArrowLeft } from 'lucide-react';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    location: '',
    education_level: '',
    occupation: '',
    preferred_language: 'hindi',
    comfort_level: 'text',
    emergency_contact: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'age', 'gender', 'location', 'education_level', 'occupation'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
      setError('Age must be between 13 and 120');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.register(formData);
      setStep('otp');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData.name, formData.phone, otp);
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <button 
            onClick={() => navigate('/login')} 
            className="back-btn"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="logo">
            <Heart className="logo-icon" />
            <span className="logo-text">MannMitra</span>
          </div>
          <h1>Create Your Account</h1>
          <p>Join MannMitra and start your mental wellness journey</p>
        </div>

        <div className="features">
          <div className="feature">
            <MessageCircle className="feature-icon" />
            <span>24/7 AI Chat Support</span>
          </div>
          <div className="feature">
            <Brain className="feature-icon" />
            <span>Personalized Mental Health</span>
          </div>
        </div>

        <form onSubmit={step === 'form' ? handleRegister : handleVerifyOTP} className="register-form">
          {step === 'form' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="13"
                    max="120"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="education_level">Education Level *</label>
                  <select
                    id="education_level"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Education</option>
                    <option value="none">No formal education</option>
                    <option value="primary">Primary (1-5)</option>
                    <option value="secondary">Secondary (6-10)</option>
                    <option value="higher_secondary">Higher Secondary (11-12)</option>
                    <option value="graduate">Graduate</option>
                    <option value="post_graduate">Post Graduate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="occupation">Occupation *</label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Occupation</option>
                    <option value="student">Student</option>
                    <option value="homemaker">Homemaker</option>
                    <option value="daily_wage_worker">Daily Wage Worker</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="employed">Employed</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="preferred_language">Preferred Language</label>
                  <select
                    id="preferred_language"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleInputChange}
                  >
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                    <option value="bengali">Bengali</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="marathi">Marathi</option>
                    <option value="gujarati">Gujarati</option>
                    <option value="punjabi">Punjabi</option>
                    <option value="urdu">Urdu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="comfort_level">Communication Preference</label>
                  <select
                    id="comfort_level"
                    name="comfort_level"
                    value={formData.comfort_level}
                    onChange={handleInputChange}
                  >
                    <option value="text">Text Only</option>
                    <option value="voice">Voice Only</option>
                    <option value="both">Both Text & Voice</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact">Emergency Contact (Optional)</label>
                <input
                  type="tel"
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <small>OTP sent to {formData.phone}</small>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Verifying...' : 'Complete Registration'}
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="btn-secondary"
              >
                Back to Form
              </button>
            </>
          )}

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="link"
            >
              Login here
            </button>
          </p>
          <p className="terms">
            By creating an account, you agree to our{' '}
            <a href="#" className="link">Terms of Service</a> and{' '}
            <a href="#" className="link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;



