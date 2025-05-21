// SelectedRoomSummaryCard.jsx
import React from "react";
import { X } from "lucide-react";
import { formatCurrency } from "../utils/formatCurrency";

const SelectedRoomSummaryCard = ({ room, currencyCode, exchangeRate, onRemove }) => {
  if (!room) return null;

  const {
    roomId,
    roomType,
    image,
    price,
    guests,
    startDate,
    endDate,
    baseRate,
    taxesAndFees,
    totalAfterTax
  } = room;

  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-xl shadow-sm relative bg-white">
      {image && (
        <img
          src={image}
          alt={roomType}
          className="w-28 h-20 object-cover rounded border"
        />
      )}

      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-800">{roomType}</div>
        <div className="text-sm text-gray-600">{startDate} – {endDate}</div>
        <div className="text-sm text-gray-600">
          Guests: {guests?.adults || 1} Adult{guests?.adults > 1 ? "s" : ""}, {guests?.children || 0} Child{guests?.children > 1 ? "ren" : ""}
        </div>
        <div className="text-sm text-gray-700 mt-1">
          Total: {formatCurrency(totalAfterTax || price || baseRate, exchangeRate, currencyCode)}
        </div>
      </div>

      <button
        onClick={() => onRemove?.(roomId)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default SelectedRoomSummaryCard;