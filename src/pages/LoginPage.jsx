import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      const fallbackPath = '/';
      const redirectTo = localStorage.getItem('lastVisitedPath');
      const validRedirect =
        redirectTo &&
        redirectTo !== '/login' &&
        redirectTo !== '/register' &&
        redirectTo !== window.location.pathname;

      if (validRedirect) {
        console.log('Redirecting to last valid path:', redirectTo);
        navigate(redirectTo, { replace: true });
      } else {
        console.log('No valid redirect path. Redirecting to fallback:', fallbackPath);
        navigate(fallbackPath, { replace: true });
      }
      return;
    } catch (err) {
      setError(err.message);
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
            <h2 className="text-2xl font-light text-light text-gray-900 text-left">Log in</h2>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right mb-4">
              <a href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                Forgot password?
              </a>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none mb-3"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in with Email'}
            </button>

            <div className="flex items-center my-3">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-2 text-sm text-gray-500">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <button
              onClick={async () => {
                try {
                  const lastVisitedPath = localStorage.getItem('lastVisitedPath');
                  const currentPath = window.location.pathname;
                  if (!lastVisitedPath && currentPath !== '/login' && currentPath !== '/register') {
                    localStorage.setItem('lastVisitedPath', currentPath);
                  }

                  await signInWithGoogle();
                  const fallbackPath = '/';
                  const redirectTo = localStorage.getItem('lastVisitedPath');
                  const validRedirect =
                    redirectTo &&
                    redirectTo !== '/login' &&
                    redirectTo !== '/register' &&
                    redirectTo !== window.location.pathname;

                  if (validRedirect) {
                    console.log('Redirecting to last valid path:', redirectTo);
                    navigate(redirectTo, { replace: true });
                  } else {
                    console.log('No valid redirect path. Redirecting to fallback:', fallbackPath);
                    navigate(fallbackPath, { replace: true });
                  }
                  return;
                } catch (err) {
                  console.error('Google login failed:', err);
                }
              }}
              className="w-full border border-gray-300 text-gray-800 py-3 rounded-[3rem] hover:bg-gray-100 transition flex items-center justify-center gap-4"
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="h-5 w-5 bg-white rounded-full" />
              Continue with Google
            </button>
            
             {/*
            <button
              onClick={async () => {
                try {
                  const lastVisitedPath = localStorage.getItem('lastVisitedPath');
                  const currentPath = window.location.pathname;
                  if (!lastVisitedPath && currentPath !== '/login' && currentPath !== '/register') {
                    localStorage.setItem('lastVisitedPath', currentPath);
                  }

                  await signInWithFacebook();
                  const fallbackPath = '/';
                  const redirectTo = localStorage.getItem('lastVisitedPath');
                  const validRedirect =
                    redirectTo &&
                    redirectTo !== '/login' &&
                    redirectTo !== '/register' &&
                    redirectTo !== window.location.pathname;

                  if (validRedirect) {
                    console.log('Redirecting to last valid path:', redirectTo);
                    navigate(redirectTo, { replace: true });
                  } else {
                    console.log('No valid redirect path. Redirecting to fallback:', fallbackPath);
                    navigate(fallbackPath, { replace: true });
                  }
                  return;
                } catch (err) {
                  console.error('Facebook login failed:', err);
                }
              }}
              className="w-full border border-gray-300 text-gray-800 py-3 rounded-[3rem] hover:bg-gray-100 transition flex items-center justify-center gap-4"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="Facebook" className="h-6 w-6 rounded-full shadow-md" />
              Continue with Facebook
            </button>
            */}

            <div className="text-center text-sm text-gray-600 mt-6">
              Not a member yet?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Register for free
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}