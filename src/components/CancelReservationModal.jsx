// CancelReservationModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const CancelReservationModal = ({ booking, propertyEmail, onClose, onCancelled }) => {
  const [policy, setPolicy] = useState(null);
  const [isPastDeadline, setIsPastDeadline] = useState(false);
  const [cancellationDeadline, setCancellationDeadline] = useState(null);
  const [reason, setReason] = useState("");
  const [noComment, setNoComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPolicy = async () => {
      console.log("📦 Booking received in modal:", booking);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/policies?propertyId=${booking.propertyId}`);
        console.log("📜 Policy response:", res.data);

        if (Array.isArray(res.data) && res.data.length > 0) {
          const policyData = res.data[0]?.cancellationPolicy;
          if (policyData) {
            setPolicy(policyData);
            const checkInDate = new Date(booking.checkIn);
            const deadline = new Date(checkInDate);
            deadline.setDate(deadline.getDate() - policyData.cancellationNoticeDays);
            setIsPastDeadline(new Date() > deadline);
            setCancellationDeadline(deadline);
          } else {
            console.warn("⚠️ Cancellation policy missing from property data.");
            setPolicy(null);
          }
        } else {
          console.warn("⚠️ Policy response is not a valid array.");
          setPolicy(null);
        }
      } catch (err) {
        console.error("Failed to fetch cancellation policy", err);
        setPolicy(null);
      }
    };
    fetchPolicy();
  }, [booking]);

  const handleCancel = async () => {
    if (!reason.trim() && !noComment) {
      setError("Please provide a cancellation reason.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_BOOKING_API_URL}/cancel/${booking._id}`, {
        cancellationNote: noComment ? "No comment" : reason.trim(),
      });
      onCancelled();
    } catch (err) {
      console.error("Cancellation failed", err);
      setError("Cancellation failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="text-lg font-semibold">Cancel Reservation</h2>
        {policy === null ? (
          <p>Loading policy...</p>
        ) : isPastDeadline ? (
          <div className=" p-4 rounded border border-red-300 text">
            <p>
              This reservation is past the cancellation deadline of {policy.cancellationNoticeDays} days before check-in.
              Please contact <a href={`mailto:${propertyEmail}`} className="underline">{propertyEmail}</a> to cancel.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-3">
              You are within the cancellation period ({policy.cancellationNoticeDays} days before check-in).
              Please tell us the reason for your cancellation:
            </p>
            <p className="text-sm text-gray-600 italic mb-2">
              Cancel before {cancellationDeadline?.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
            <textarea
              className="w-full border p-2 rounded"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Your reason for cancellation..."
              disabled={noComment}
            ></textarea>
            <label className="flex items-center space-x-2 mt-2 mb-3">
              <input
                type="checkbox"
                checked={noComment}
                onChange={(e) => {
                  setNoComment(e.target.checked);
                  if (e.target.checked) setReason("");
                }}
              />
              <span className="text-sm text-gray-700">Prefer not to say</span>
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 mt-4 rounded-full shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading || (!reason.trim() && !noComment)}
              onClick={handleCancel}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </button>
          </>
        )}
        <button
          className="text-gray-500 hover:text-black text-sm mt-4 block"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CancelReservationModal;
