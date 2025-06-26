import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset, getAuth } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or missing reset code.");
    }
  }, [oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("✅ Your password has been reset. Redirecting to login...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="hidden md:block bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-pool.jpg')" }}
        />
        <div className="flex items-center justify-center px-4 py-4 sm:px-6 lg:px-8 bg-white h-[100dvh] overflow-hidden">
          <form
            onSubmit={handleReset}
            className="max-w-md w-full space-y-6 flex flex-col justify-center min-h-full"
          >
            <div className="flex justify-center">
              <img src="/Logo.png" alt="Hotel Logo" className="h-20 mb-2 mt-2" />
            </div>
            <h2 className="text-2xl font-light text-gray-900 text-left">Reset your password</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full mb-3 p-2 border border-gray-300 rounded pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none mb-3"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-6">
              Go back to{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                login page
              </a>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
