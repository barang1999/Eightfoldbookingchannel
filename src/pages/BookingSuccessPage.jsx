import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Home, Calendar, Mail } from "lucide-react";
import { motion } from "framer-motion";

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const { bookingId } = useParams();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BOOKING_API_URL}/${bookingId}`);
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error("Failed to load booking:", err);
      }
    };
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle2 size={64} className="text-[#A58E63]" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Booking Confirmed</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your reservation. A confirmation email has been sent.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 mb-6">
          <p className="mb-1 font-medium">Booking Reference:</p>
          <p className="text-lg font-semibold text-gray-800">
            {booking?.referenceNumber || "Loading..."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-100 transition"
          >
            <Home size={18} /> Go to Home
          </button>
          <button
            onClick={() => navigate("/account/reservations")}
            className="flex items-center justify-center gap-2 bg-[#A58E63] text-white px-6 py-2 rounded-full hover:opacity-90 transition"
          >
            <Calendar size={18} /> Manage Booking
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 space-y-2">
          
          <a
            href="https://calendar.google.com/calendar/u/0/r/eventedit"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <Calendar size={16} /> Add to Google Calendar
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingSuccessPage;