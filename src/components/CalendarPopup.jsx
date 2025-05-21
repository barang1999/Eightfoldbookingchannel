import React, { useRef, useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { motion } from "framer-motion";
import { useClickOutside } from "../hooks/useClickOutside";
import { useTranslation } from "react-i18next";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./CalendarPopup.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Make sure you have this in your .env!

const toLocalDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toLocalDateStr = (d) => {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

const CalendarPopup = ({ onClose, selectionRange, onChange, onSearch, propertyId }) => {
  const { t } = useTranslation("translation");
  const ref = useRef();
  useClickOutside(ref, onClose);

  const [range, setRange] = useState([
    {
      startDate: selectionRange?.startDate || new Date(),
      endDate: selectionRange?.endDate || null,
      key: "selection"
    }
  ]);

  useEffect(() => {
    if (selectionRange?.startDate && selectionRange?.endDate) {
      setRange([{
        startDate: toLocalDateStr(new Date(selectionRange.startDate)),
        endDate: toLocalDateStr(new Date(selectionRange.endDate)),
        key: "selection"
      }]);
    }
  }, [selectionRange?.startDate, selectionRange?.endDate]);

  const handleChange = (item) => {
    const selection = item.selection;
    const normalizedStart = new Date(selection.startDate);
    const normalizedEnd = new Date(selection.endDate);
    setRange([
      {
        ...selection,
        startDate: toLocalDateStr(selection.startDate),
        endDate: toLocalDateStr(selection.endDate),
      }
    ]);
  };

  const handleSearchAndUpdateRooms = async () => {
    const selectedRange = range[0];
    if (selectedRange?.startDate && selectedRange?.endDate) {
      const normalizedStart = new Date(selectedRange.startDate);
      const normalizedEnd = new Date(selectedRange.endDate);
      onChange({
        startDate: toLocalDateStr(normalizedStart),
        endDate: toLocalDateStr(normalizedEnd),
      });
      await onSearch({
        startDate: normalizedStart,
        endDate: normalizedEnd,
      });
      onClose();
    } else {
      console.warn("❗ No valid date range selected before search.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl"
      ref={ref}
    >
      <div className="w-[700px] p-4 mx-auto shadow-xl rounded-xl bg-white text-[12px]">
        <DateRange
          editableDateInputs={true}
          onChange={handleChange}
          moveRangeOnFirstSelection={false}
          ranges={[{
            ...range[0],
            startDate: new Date(range[0].startDate),
            endDate: new Date(range[0].endDate)
          }]}
          rangeColors={["#A58E63"]}
          months={2}
          direction="horizontal"
          showDateDisplay={false}
          showSelectionPreview={true}
        />
        <div className="border-t mt-4 pt-4 flex flex-col items-center gap-2">
          <div className="text-gray-700 font-medium text-lg">
            {(() => {
              const start = range[0]?.startDate;
              const end = range[0]?.endDate;
              const nights = start && end
                ? Math.max(Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)), 0)
                : 0;
              return t("roomDetails.night", { count: nights, defaultValue: `${nights} night${nights !== 1 ? "s" : ""}` });
            })()}
          </div>
          <button
            className="bg-[#A58E63] text-base hover:bg-[#927b58] text-white font-semibold py-2 px-4 rounded-full shadow-md w-[70%] max-w-[240px] text-center"
            onClick={handleSearchAndUpdateRooms}
          >
            {t("searchFlow.search", "Search")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPopup;