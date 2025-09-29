import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { Heart, MessageCircle, Brain } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Please enter both name and phone number');
      return;
    }

    setIsLoading(true);
    setError('');
    setRequiresRegistration(false);

    try {
      const resp = await authAPI.login(name.trim(), phone.trim());
      // Backend returns requiresRegistration=false when user exists and OTP sent
      if (resp.data?.success && resp.data?.requiresRegistration === false) {
        setStep('otp');
        return;
      }
      // Fallback
      setStep('otp');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No account found with this name and phone number. Please register first.';
      setRequiresRegistration(true);
      setError(message);
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
      await login(name, phone, otp);
      setError('');
      navigate('/');
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Invalid OTP');
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

        <form onSubmit={step === 'login' ? handleLogin : handleVerifyOTP} className="login-form">
          {step === 'login' ? (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Checking...' : 'Login'}
              </button>
              {requiresRegistration && (
                <div className="registration-prompt">
                  <p>Don't have an account?</p>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="btn-secondary"
                  >
                    Register Here
                  </button>
                </div>
              )}
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
                onClick={() => setStep('login')}
                className="btn-secondary"
              >
                Change Details
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





