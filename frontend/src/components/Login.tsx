import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Heart, MessageCircle, Brain } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.sendOTP(phone);
      setStep('otp');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send OTP');
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
      await login(phone, otp);
      // Clear any previous errors on success
      setError('');
      // Redirect to dashboard after successful login
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Heart className="logo-icon" />
            <span className="logo-text">MannMitra</span>
          </div>
          <h1>Welcome to MannMitra</h1>
          <p>Your AI-powered mental wellness companion</p>
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

        <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP} className="login-form">
          {step === 'phone' ? (
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Sending...' : 'Send OTP'}
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
                <small>OTP sent to {phone}</small>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="btn-secondary"
              >
                Change Phone Number
              </button>
            </>
          )}

          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="login-footer">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="link">Terms of Service</a> and{' '}
            <a href="#" className="link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;





