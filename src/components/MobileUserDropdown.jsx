import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const MobileUserDropdown = ({ user, setIsModalOpen, setIsDropdownOpen }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  return (
    <AnimatePresence>
      <>
        <motion.button
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsDropdownOpen(false)}
          aria-label="Close dropdown"
          className="fixed top-[75px] right-4 z-[9999]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[64px] left-0 right-0 md:absolute md:right-[-4px] md:top-auto mt-2 w-full h-[calc(100%-64px)] md:w-72 md:h-auto bg-white border border-gray-200 md:rounded-xl shadow-xl py-5 px-4 md:px-4 z-50 ring-1 ring-gray-100 overflow-y-auto"
        >
          {user ? (
            <>
              <div className="flex justify-between items-start px-6 pt-1 pb-4 sticky top-[10px] bg-white z-10 border-b border-gray-100 mb-2">
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    {user?.profile?.fullName?.split(" ")[0] || user?.displayName || "Guest"}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email || ""}</div>
                </div>
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-xl mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#9b875d]">
                    <img src="/Logo.png" alt="Status Logo" className="w-9 h-9" />
                  </div>
                  <p className="text-[15px] text-gray-600 leading-snug pt-1">
                    <span className="font-medium  text-gray-800 block">Exclusive access.</span>
                    <span className="font-medium text-gray-800 block">Elevated experience.</span>
                  </p>
                </div>
              </div>

              <ul className="text-sm space-y-2 font-medium text-gray-800">
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    navigate("/account/reservations");
                    setIsDropdownOpen(false);
                  }}
                >
                  Your reservations
                </motion.li>
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    navigate("/account/information");
                    setIsDropdownOpen(false);
                  }}
                >
                  Your information
                </motion.li>
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    navigate("/account/stay-preferences");
                    setIsDropdownOpen(false);
                  }}
                >
                  Your stay preferences
                </motion.li>
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Change currency
                </motion.li>
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="pt-2 border-t border-gray-200 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Help and support
                </motion.li>
                <motion.li
                  whileTap={{ scale: 0.96 }}
                  className="hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    const auth = getAuth();
                    signOut(auth)
                      .then(() => {
                        setIsDropdownOpen(false);
                        navigate("/");
                      })
                      .catch((error) => {
                        console.error("Logout error:", error);
                      });
                  }}
                >
                  Logout
                </motion.li>
              </ul>
            </>
          ) : (
            <div className="text-center py-6 px-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">Join us today</p>
              <p className="text-sm text-gray-500 mb-4">
              Enjoy a seamless and exclusive experience tailored to our members.
              </p>
              <button
                className="w-full bg-[#9b875d] text-white font-medium py-2 rounded-full mb-2"
                onClick={() => {
                  navigate("/register");
                  setIsDropdownOpen(false);
                }}
              >
                Sign up for free
              </button>
              <button
                className="w-full border border-[#9b875d] text-[#9b875d] font-medium py-2 rounded-full"
                onClick={() => {
                  navigate("/login");
                  setIsDropdownOpen(false);
                }}
              >
                Sign in
              </button>
            </div>
          )}
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default MobileUserDropdown;