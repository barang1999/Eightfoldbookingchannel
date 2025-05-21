// src/contexts/SelectedDateContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";

const SelectedDateContext = createContext();

export const SelectedDateProvider = ({ children }) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const toLocalDateStr = (d) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

  const [dateRange, setDateRange] = useState(() => {
    const savedStart = localStorage.getItem("selectedStartDate");
    const savedEnd = localStorage.getItem("selectedEndDate");

    if (savedStart && savedEnd) {
      return { startDate: savedStart, endDate: savedEnd };
    }

    return { startDate: toLocalDateStr(today), endDate: toLocalDateStr(tomorrow) };
  });

  const updateDateRange = (start, end) => {
    const toDateStr = (d) =>
      typeof d === "string"
        ? d
        : `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

    const newRange = {
      startDate: toDateStr(start),
      endDate: toDateStr(end),
    };

    setDateRange(newRange);
    console.log("🔁 updateDateRange called with:", newRange.startDate, newRange.endDate);
  };

  useEffect(() => {
    localStorage.setItem("selectedStartDate", dateRange.startDate);
    localStorage.setItem("selectedEndDate", dateRange.endDate);
  }, [dateRange]);

  return (
    <SelectedDateContext.Provider value={{ dateRange, updateDateRange }}>
      {children}
    </SelectedDateContext.Provider>
  );
};

export const useSelectedDate = () => {
  const context = useContext(SelectedDateContext);
  if (!context) {
    throw new Error("useSelectedDate must be used within a SelectedDateProvider");
  }
  return context;
};