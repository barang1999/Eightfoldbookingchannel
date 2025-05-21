import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const MapModal = ({ isOpen, onClose, embedHtml }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-md overflow-hidden shadow-lg w-full h-full max-w-screen-xl max-h-screen flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex justify-end p-2">
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