import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Removed incorrect import of normalizeDate
import { formatCurrency } from "../utils/formatCurrency";
import MobilePriceSummary from './MobilePriceSummary';

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const BookingSummaryBox = ({ hotel, stayPeriod, guestCount, selectedRooms = [], onShowDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [localGuestCount, setLocalGuestCount] = useState(guestCount || { adults: 2, children: 0 });

useEffect(() => {
  if (guestCount) {
    setLocalGuestCount(guestCount);
  } else {
    const stored = JSON.parse(localStorage.getItem(hotel?.propertyId));
    const fallback = stored?.guestCount || { adults: 2, children: 0 };
    setLocalGuestCount(fallback);
    console.log(
      "🧭 BookingSummaryBox Fallback — Using stored or default guest count:",
      fallback
    );
  }
}, [guestCount, hotel?.propertyId]);
  const navigate = useNavigate();

  const handleSeeDetails = () => {
    setShowDetails(true);
    if (onShowDetails) onShowDetails();
  };

  const totalPrice = selectedRooms.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const imageUrl = hotel?.images?.[0] || selectedRooms[0]?.image || "";

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold mb-1">Your Stay</h2>
          <p className="text-sm font-semibold uppercase text-gray-800">
            {hotel?.name || "Hotel Name"}
          </p>
          <p className="text-sm text-black">
            {formatDate(stayPeriod?.start)} → {formatDate(stayPeriod?.end)}
          </p>
          <p className="text-xs text-gray-500">
            {stayPeriod?.nights || 1} night{stayPeriod?.nights > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-black mt-1">
            {localGuestCount.adults} adult{localGuestCount.adults > 1 ? "s" : ""}
            {localGuestCount.children > 0 ? `, ${localGuestCount.children} child${localGuestCount.children > 1 ? "ren" : ""}` : ""}
          </p>
        </div>
        <div>
          <img src={imageUrl} alt="Hotel thumbnail" className="w-16 h-16 rounded-md object-cover ml-2" />
        </div>
      </div>

      <button
        onClick={handleSeeDetails}
        className="text-blue-700 text-sm font-medium underline mt-2"
      >
        See details
      </button>

      {showDetails && (
        <div className="mt-4 border-t pt-4">
          {selectedRooms.map((room, index) => (
            <div key={index} className="text-sm text-gray-800 mb-2">
              <div className="font-semibold">{room.roomName}</div>
              <div className="text-xs text-gray-500">{formatCurrency(room.totalPrice)} total</div>
            </div>
          ))}
          <div className="text-right font-bold text-black mt-2">
            Total: {formatCurrency(totalPrice)}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end justify-center">
          <div className="w-full max-w-md">
            <MobilePriceSummary
              selectedRooms={selectedRooms}
              onConfirm={() => setShowDetails(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummaryBox;
