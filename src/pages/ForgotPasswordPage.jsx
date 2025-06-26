import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage("If this email exists, a reset link has been sent.");
    } catch (err) {
      console.error("Password reset error", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
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
          <div className="max-w-md w-full space-y-6 flex flex-col justify-center min-h-full">
            <div className="flex justify-center md:justify-center">
              <img src="/Logo.png" alt="Hotel Logo" className="h-20 mb-2 mt-2 md:mt-[-75x]" />
            </div>
            <h2 className="text-2xl font-light text-light text-gray-900 text-left">Reset your password</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              onClick={handlePasswordReset}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Sending reset link…' : 'Send Reset Link'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-6">
              Remembered your password?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Back to login
              </a>
            </div>
          </div>
        </div>
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
            <span className="text-lg text-gray-700 font-medium">Sending email…</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}