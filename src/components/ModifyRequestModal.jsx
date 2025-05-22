import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

const ModifyRequestModal = ({ isOpen, onClose, tour, onSend }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend({
        message,
        tour
      });
      onClose();
    } catch (err) {
      console.error("Failed to send request:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <XCircle size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-2">Request Modification</h2>
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>Tour:</strong> {tour.tourType}</p>
              <p><strong>Date:</strong> {new Date(tour.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p><strong>Time:</strong> {new Date(`1970-01-01T${tour.time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</p>
              <p><strong>Transport:</strong> {tour.transportType}</p>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Write your request here..."
            />

            <div className="mt-4 text-right">
              <button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="bg-[#A58E63] text-white px-4 py-2 rounded-md hover:bg-[#927b58] disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Request"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModifyRequestModal;