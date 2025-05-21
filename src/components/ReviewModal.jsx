import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useClickOutside } from "../hooks/useClickOutside";
import { motion, AnimatePresence } from "framer-motion";

const ReviewModal = ({ propertyId, ratingSummary, onClose }) => {
  const modalRef = useRef(null);
  useClickOutside(modalRef, onClose);

  const ratingWidgetRef = useRef();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=423&locationId=25173268&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=true&iswide=false&border=true&display_version=2";
    script.async = true;
    script.setAttribute("data-loadtrk", "true");
    ratingWidgetRef.current?.appendChild(script);
  }, []);

  const [fetchedReviews, setFetchedReviews] = useState([]);

  useEffect(() => {
    if (!propertyId) return;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/reviews?propertyId=${propertyId}`)
      .then((res) => {
        setFetchedReviews(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
      });
  }, [propertyId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <motion.div
          ref={modalRef}
          className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
          >
            &times;
          </button>
          <div ref={ratingWidgetRef} className="mb-4" />
          {/* Reviews List */}
          <div className="space-y-6">
            {fetchedReviews.map((review, idx) => (
              <div key={idx} className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                      {review.guestName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.guestName}</p>
                      <div className="flex space-x-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-green-600">●</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(review.date).toISOString().split("T")[0]}</p>
                </div>
                <h4 className="font-semibold text-md text-gray-700 mb-1">{review.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
