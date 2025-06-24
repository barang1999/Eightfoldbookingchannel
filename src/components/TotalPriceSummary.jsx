import React from "react";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { useSelectedServices } from "../contexts/SelectedServicesContext";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { useCurrency } from "../contexts/CurrencyProvider";
import { calculateNights } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatCurrency";

const TotalPriceSummary = () => {
  const { selectedRooms } = useSelectedRooms();
  const { selectedServices } = useSelectedServices();
  const { range } = useSelectedDate();
  const currencyContext = useCurrency();
  const { currency = "USD", exchangeRate = 1 } = currencyContext || {};
 

  const roomTotal = selectedRooms.reduce((total, room) => {
    const rate = room.price || room.totalRate || 0;
    return total + rate;
  }, 0);

  const serviceTotal = selectedServices.reduce((total, service) => {
    return total + (service.price || 0);
  }, 0);



  const subtotal = roomTotal + serviceTotal;
  // VAT-inclusive: extract VAT from subtotal
  const taxAmount = subtotal * (10 / 110); // Extract VAT from subtotal
  const totalWithTax = subtotal; // Already VAT-inclusive

  

  const format = (amount) => {
    const value = Number(amount);
    const fallbackCurrency = currency || "USD";
    if (isNaN(value) || !isFinite(value)) {
      console.warn("Invalid amount passed to format():", amount);
      return formatCurrency(0, exchangeRate, fallbackCurrency);
    }
    return formatCurrency(value, exchangeRate, fallbackCurrency);
  };



  return (
    <div className="p-4 bg-white rounded-xl shadow-md mt-4">
      <div className="text-lg font-semibold text-gray-800 mb-2">
        TOTAL <span className="text-sm text-gray-400">(fees and taxes included)</span>
      </div>
      <div className="flex justify-between py-1">
        <div>Subtotal (excl. VAT)</div>
        <div>{format(subtotal - taxAmount)}</div>
      </div>
      <div className="flex justify-between py-1">
        <div>Includes VAT</div>
        <div>{format(taxAmount)}</div>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between py-1 font-bold text-green-700 text-lg">
        <div>Total (incl. tax)</div>
        <div>{format(totalWithTax)}</div>
      </div>
    </div>
  );
};

export default TotalPriceSummary;