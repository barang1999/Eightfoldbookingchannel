import React from "react";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { format } from "date-fns";

const DateSelector = () => {
  const { dateRange, setDateRange } = useSelectedDate();

  const handleDateChange = (e, type) => {
    const updated = new Date(e.target.value);
    setDateRange((prev) => ({
      ...prev,
      [type]: updated,
    }));
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-sm w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
      <input
        type="date"
        value={format(dateRange?.startDate || new Date(), "yyyy-MM-dd")}
        onChange={(e) => handleDateChange(e, "startDate")}
        className="mb-2 w-full px-3 py-2 border rounded"
      />
      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
      <input
        type="date"
        value={format(dateRange?.endDate || new Date(), "yyyy-MM-dd")}
        onChange={(e) => handleDateChange(e, "endDate")}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
  );
};

export default DateSelector;