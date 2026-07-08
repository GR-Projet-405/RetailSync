import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Mail, Loader2, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId and email from location state
  const { userId, email } = location.state || {};

  // Redirect if no userId (user accessed page directly)
  useEffect(() => {
    if (!userId || !email) {
      toast.error('Please register first');
      navigate('/register', { replace: true });
    }
  }, [userId, email, navigate]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timer <= 0 || isSuccess) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isSuccess]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Format timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle input change for each OTP digit
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down for backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste (paste all 6 digits at once)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only accept 6-digit numbers
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus(); // Focus last input
    }
  };

  // Handle verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/verify-otp', {
        userId,
        otp: otpString,
        purpose: 'EMAIL_VERIFICATION',
      });

      setIsSuccess(true);
      toast.success('Email verified successfully!');

      // Redirect to role selection or login after 2 seconds
      setTimeout(() => {
        navigate('/select-role', { 
          state: { userId, email },
          replace: true 
        });
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid OTP';
      setError(message);
      toast.error(message);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', {
        userId,
        purpose: 'EMAIL_VERIFICATION',
      });

      toast.success('New OTP sent to your email');
      setResendCooldown(60); // 60 seconds cooldown
      setTimer(600); // Reset main timer
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (!userId || !email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
          <ShoppingCart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We've sent a verification code to
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-blue-600">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Email Verified!
              </h3>
              <p className="text-sm text-slate-600">
                Redirecting to role selection...
              </p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}

              {/* OTP Input Boxes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                  Enter 6-digit verification code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isSubmitting}
                      className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all
                        ${digit 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-300 bg-white text-slate-900'
                        }
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  ))}
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-slate-600">
                    Code expires in{' '}
                    <span className="font-semibold text-blue-600">
                      {formatTime(timer)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">
                    Code expired. Please request a new one.
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting || otp.join('').length !== 6}
                className="flex w-full justify-center items-center rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>

              {/* Resend OTP Section */}
              <div className="text-center space-y-2">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-slate-500">
                    Resend code in{' '}
                    <span className="font-semibold text-slate-700">
                      {resendCooldown}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-4 w-4" />
                        Resend verification code
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Back to Register Link */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to registration
                </Link>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            &copy; 2026 RetailSync Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;