import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { verifyOTP, getMe, sendOtp } from "../services/auth";
import { validateEmail, validateOTP } from "../utils/validation";

function Signin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpSent, setOtpSent] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user is already logged in and handle Google auth errors
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await getMe();
        // If successful, user is logged in, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (err) {
        // User is not logged in, check for Google auth errors
        const error = searchParams.get('error');
        if (error === 'auth_failed') {
          setErrors({ general: 'Google authentication failed. Please try again.' });
        }
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthStatus();
  }, [navigate, searchParams]);

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

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    const otpValidation = validateOTP(otp);
    
    const validationErrors: { [key: string]: string } = {};
    
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.message;
    }
    
    if (!otpValidation.isValid) {
      validationErrors.otp = otpValidation.message;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    try {
      await verifyOTP(email, otp);
      const user = await getMe();
      if (user) {
        navigate("/dashboard");
      } else {
        setErrors({ general: "Failed to fetch user details. Please try again." });
      }
    } catch (err: any) {
      let errorMessage = "Invalid OTP or sign-in failed.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid OTP. Please check and try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "OTP has expired or is incorrect. Please request a new one.";
      } else if (err.response?.status === 404) {
        errorMessage = "Account not found. Please sign up first.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setErrors({ otp: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGetOtp = async () => {
    // Validate email before sending OTP
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.message });
      return;
    }
    
    setLoading(true);
    setErrors({});
    setOtpSent(false);
    try {
      await sendOtp(email);
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
      } else if (err.response?.status === 404) {
        errorMessage = "No account found with this email. Please sign up first.";
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Real-time validation handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 lg:hidden">
        <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <img src="/icon.png" alt="HD" className="w-6 h-6 mr-2" />
            <span className="text-xl font-bold">HD</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-1">Sign In</h2>
          <p className="text-gray-500 text-center mb-6">
            Please login to continue to your account.
          </p>

          {/* Form */}
          <form onSubmit={handleSignin} className="space-y-4">
            {/* Success Message - Fixed position to prevent layout shift */}
            <div className="relative min-h-[3rem]">
              {otpSent && (
                <div className="absolute inset-0 bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-green-700 font-medium">OTP sent! Check your email.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-blue-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                required
                maxLength={6}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={handleGetOtp}
                disabled={!email.trim() || loading}
                className="text-blue-600 text-sm mt-1 hover:underline disabled:text-gray-400"
              >
                Get OTP
              </button>
              {errors.otp && (
                <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
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

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="keep" className="w-4 h-4" />
              <label htmlFor="keep" className="text-sm">
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => {
              // Clear any existing errors before redirecting
              setErrors({});
              window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>

          <p className="text-center text-sm text-gray-600">
            Need an account??{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
              <p className="text-gray-600">Please login to continue to your account.</p>
            </div>

            <form onSubmit={handleSignin} className="space-y-5">
              {/* Success Message - Fixed position to prevent layout shift */}
              <div className="relative min-h-[4rem]">
                {otpSent && (
                  <div className="absolute inset-0 bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                />
                <button
                  type="button"
                  onClick={handleGetOtp}
                  disabled={!email.trim() || loading}
                  className="text-blue-600 text-sm mt-2 hover:underline disabled:text-gray-400"
                >
                  Get OTP
                </button>
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
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

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="keep-desktop" className="w-4 h-4" />
                <label htmlFor="keep-desktop" className="text-sm text-gray-600">
                  Keep me logged in
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

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
              onClick={() => {
                // Clear any existing errors before redirecting
                setErrors({});
                window.location.href = 'http://localhost:4000/api/auth/google';
              }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition"
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
              Need an account?{" "}
              <Link to="/" className="text-blue-600 font-medium hover:underline">
                Create one
              </Link>
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

export default Signin;