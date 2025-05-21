import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed incorrect import of normalizeDate
import { formatCurrency } from "../utils/formatCurrency";
import ModifyMobilePriceSummary from "./ModifyMobilePriceSummary";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const ModifyMobileBookingSummaryBox = ({
  hotel,
  stayPeriod,
  guestCount,
  selectedRooms = []
}) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleSeeDetails = () => setShowDetails(true);

  const totalPrice = selectedRooms.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  const imageUrl = hotel?.images?.[0] || selectedRooms[0]?.image || "";

  const guestCountFinal = {
    adults: typeof guestCount?.adults !== "undefined"
      ? Number(guestCount.adults)
      : Number(localStorage.getItem("numAdults") || 0),
    children: typeof guestCount?.children !== "undefined"
      ? Number(guestCount.children)
      : Number(localStorage.getItem("numChildren") || 0),
  };
  const adultCount = guestCountFinal.adults;
  const childCount = guestCountFinal.children;

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
          <p className="text-sm text-gray-500">
            {stayPeriod?.nights || 1} night{stayPeriod?.nights > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-black mt-1">
            {adultCount} adult{adultCount === 1 ? "" : "s"}
            {childCount > 0 ? `, ${childCount} child${childCount > 1 ? "ren" : ""}` : ""}
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
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-end justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetails(false);
            }
          }}
        >
          <div className="w-full max-w-md relative bg-white rounded-t-xl">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-600 text-xl"
            >
              ×
            </button>
            <ModifyMobilePriceSummary
              rooms={selectedRooms}
              onCloseDetails={() => setShowDetails(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyMobileBookingSummaryBox;
