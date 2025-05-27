import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "../hooks/useClickOutside";

const MapModal = ({ isOpen, onClose, embedHtml }) => {
  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-md overflow-hidden shadow-lg w-full h-[100dvh] sm:h-[98vh] sm:max-w-screen-2xl flex flex-col mx-0 sm:mx-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="sticky top-0 bg-white z-10 flex justify-end p-2 border-b">
              <button onClick={onClose} className="text-sm text-gray-500 hover:text-black transition">
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={(() => {
                  const match = embedHtml.match(/src="([^"]+)"/);
                  return match ? match[1] : "";
                })()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapModal;