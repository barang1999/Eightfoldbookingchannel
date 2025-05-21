// TotalWithVatSummary.jsx
import React from "react";

const TotalWithVatSummary = ({ selectedRooms = [], property }) => {
  const vatRate = property?.policy?.vat?.percentage || 10;

  const subtotal = selectedRooms.reduce((acc, room) => {
    const baseRate = Number(room.baseRate || room.price || 0);
    return acc + baseRate;
  }, 0);

  const vatAmount = subtotal * (vatRate / (100 + vatRate));
  const total = subtotal; // VAT already included


  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">TOTAL <span className="text-gray-400">(fees and taxes included)</span></h3>
      <div className="flex justify-between text-sm mb-1">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-1">
        <span>Includes VAT</span>
        <span>${vatAmount.toFixed(2)}</span>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between text-base font-semibold text-green-700">
        <span>Total (incl. tax)</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default TotalWithVatSummary;