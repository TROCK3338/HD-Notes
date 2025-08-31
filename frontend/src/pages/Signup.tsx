import { useState, useEffect } from "react";
import { signup, verifyOTP, getMe } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { validateSignupForm, validateOTP } from "../utils/validation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await getMe();
        // If successful, user is logged in, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        // User is not logged in, stay on signup page
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleGetOtp = async () => {
    // Validate form before sending OTP
    const validation = validateSignupForm(name, email, dob);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signup(email, name, dob);
      setOtpSent(true);
    } catch (err: any) {
      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.status === 409) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setErrors({ otp: otpValidation.message });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      navigate("/dashboard");
    } catch (err: any) {
      let errorMessage = "OTP verification failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid OTP. Please check and try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "OTP has expired. Please request a new one.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setErrors({ otp: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    if (errors.dateOfBirth) {
      setErrors(prev => ({ ...prev, dateOfBirth: "" }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout (existing) - shown on screens smaller than lg */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 lg:hidden">
        {/* Logo + heading */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/icon.png" alt="HD" className="w-6 h-6" />
          <span className="text-xl font-bold">HD</span>
        </div>

        <h1 className="text-2xl font-bold">Sign up</h1>
        <p className="text-gray-500 mb-6">Sign up to enjoy the feature of HD</p>

        <div className="w-full max-w-sm space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-500">Your Name</label>
            <input
              type="text"
              placeholder="Jonas Khanwald"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              value={name}
              onChange={handleNameChange}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>
            <input
              type="date"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              value={dob}
              onChange={handleDobChange}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              placeholder="jonas_kahnwald@gmail.com"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2`}
              value={email}
              onChange={handleEmailChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-red-700 font-medium">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* OTP section */}
          {!otpSent ? (
            <button
              onClick={handleGetOtp}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition disabled:bg-blue-300"
              disabled={loading || !name.trim() || !email.trim() || !dob.trim()}
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          ) : (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2`}
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                )}
              </div>
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition disabled:bg-blue-300"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Sign up"}
              </button>
            </>
          )}
        </div>

        {/* OR Divider */}
        <div className="flex items-center my-6 w-full max-w-sm">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign In */}
        <button
        onClick={() => window.location.href = 'http://localhost:4000/api/auth/google'}
        className="w-full max-w-sm flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>

          {/* Footer */}
          <p className="mt-6 text-gray-500 text-sm text-center">
            Already have an account??{" "}
            <a href="/signin" className="text-blue-500 font-medium">
              Sign in
            </a>
          </p>
      </div>

      {/* Desktop Layout - shown on lg screens and larger */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Panel - Form */}
        <div className="w-1/2 flex items-center justify-center bg-white p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Logo + heading */}
            <div className="flex items-center gap-2 mb-8">
              <img src="/icon.png" alt="HD" className="w-8 h-8" />
              <span className="text-xl font-bold">HD</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
              <p className="text-gray-600">Sign up to enjoy the feature of HD</p>
            </div>

            <div className="space-y-5">
              {/* Success Message */}
              {otpSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700 font-medium">OTP sent successfully! Please check your email.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="Jonas Khanwald"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  value={name}
                  onChange={handleNameChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  value={dob}
                  onChange={handleDobChange}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="jonas_kahnwald@gmail.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                  value={email}
                  onChange={handleEmailChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP section */}
              {!otpSent ? (
                <button
                  onClick={handleGetOtp}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
                  disabled={loading || !name.trim() || !email.trim() || !dob.trim()}
                >
                  {loading ? "Sending OTP..." : "Get OTP"}
                </button>
              ) : (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                      value={otp}
                      onChange={handleOtpChange}
                      maxLength={6}
                    />
                    {errors.otp && (
                      <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                    )}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? "Verifying..." : "Sign up"}
                  </button>
                </>
              )}
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
            onClick={() => window.location.href = 'http://localhost:4000/api/auth/google'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </button>

              {/* Footer */}
              <p className="text-gray-600 text-center">
                Already have an account?{" "}
                <a href="/signin" className="text-blue-600 font-medium hover:underline">
                  Sign in
                </a>
              </p>
          </div>
        </div>

        {/* Right Panel - Image */}
        <div className="w-1/2 bg-white flex items-center justify-center p-3">
          <div className="w-full h-190 rounded-3xl overflow-hidden shadow-lg">
            <img 
              src="/container.png" 
              alt="Abstract blue waves" 
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}