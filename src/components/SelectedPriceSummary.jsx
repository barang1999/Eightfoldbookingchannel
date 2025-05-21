// SelectedPriceSummary.jsx
import React from "react";
import { formatCurrency } from "../utils/formatCurrency";

const SelectedPriceSummary = ({ selectedRooms = [], currencyCode, exchangeRate }) => {
  const subtotal = selectedRooms.reduce((sum, room) => sum + (room.baseRate || 0), 0);
  const taxes = selectedRooms.reduce((sum, room) => sum + (room.taxesAndFees || 0), 0);
  const total = selectedRooms.reduce((sum, room) => sum + (room.totalAfterTax || 0), 0);

  return (
    <div className="text-sm text-gray-700 space-y-2">
      <div className="flex justify-between">
        <span>Room subtotal</span>
        <span>{formatCurrency(subtotal, exchangeRate, currencyCode)}</span>
      </div>
      <div className="flex justify-between">
        <span>Taxes & Fees</span>
        <span>{formatCurrency(taxes, exchangeRate, currencyCode)}</span>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total, exchangeRate, currencyCode)}</span>
      </div>
    </div>
  );
};

export default SelectedPriceSummary;
