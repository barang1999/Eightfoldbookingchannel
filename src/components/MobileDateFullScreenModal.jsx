import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { differenceInCalendarDays } from 'date-fns';
import { useSelectedDate } from '../contexts/SelectedDateContext';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function MobileDateFullScreenModal({ onClose }) {
  const { dateRange, updateDateRange } = useSelectedDate();
  const [range, setRange] = useState([
    {
      startDate: localStorage.getItem('selectedStartDate') ? new Date(localStorage.getItem('selectedStartDate')) : (dateRange.startDate ? new Date(dateRange.startDate) : new Date()),
      endDate: localStorage.getItem('selectedEndDate') ? new Date(localStorage.getItem('selectedEndDate')) : (dateRange.endDate ? new Date(dateRange.endDate) : new Date()),
      key: 'selection'
    }
  ]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    // If context is valid and user has not selected, override localStorage
    if (!hasUserInteracted && dateRange?.startDate && dateRange?.endDate) {
      localStorage.removeItem('selectedStartDate');
      localStorage.removeItem('selectedEndDate');
      localStorage.removeItem('dateExpiry');
    }
  }, []);

  const nightCount = differenceInCalendarDays(range[0].endDate, range[0].startDate);

  useEffect(() => {
    const storedStart = localStorage.getItem('selectedStartDate');
    const storedEnd = localStorage.getItem('selectedEndDate');
    const expiry = localStorage.getItem('dateExpiry');

    if (storedStart && storedEnd && expiry) {
      const now = new Date().getTime();
      if (now < parseInt(expiry)) {
        setRange([
          {
            startDate: new Date(storedStart),
            endDate: new Date(storedEnd),
            key: 'selection'
          }
        ]);
      } else {
        localStorage.removeItem('selectedStartDate');
        localStorage.removeItem('selectedEndDate');
        localStorage.removeItem('dateExpiry');
      }
    }
  }, []);

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      setHasUserInteracted(true);
    }
  }, []);

  useEffect(() => {
    if (!hasUserInteracted && dateRange.startDate && dateRange.endDate) {
      setRange([
        {
          startDate: new Date(dateRange.startDate),
          endDate: new Date(dateRange.endDate),
          key: 'selection',
        }
      ]);
    }
  }, [dateRange, hasUserInteracted]);

  const handleConfirm = () => {
    const selected = range[0];
    // Clear old booking context-based range that MobileBookingModal may reapply
    localStorage.removeItem("selectedBookingDateRange");

    updateDateRange(selected.startDate, selected.endDate);
    const expiresAt = new Date().getTime() + 60 * 60 * 1000; // 1 hour from now
    localStorage.setItem("selectedStartDate", selected.startDate.toISOString());
    localStorage.setItem("selectedEndDate", selected.endDate.toISOString());
    localStorage.setItem("dateExpiry", expiresAt.toString());
  
    const localStorageUpdatedEvent = new Event('localStorageUpdated');
    window.dispatchEvent(localStorageUpdatedEvent);
  
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onClose} className="text-gray-500 text-2xl">&#8592;</button>
        <h2 className="text-lg font-semibold">When do you leave?</h2>
        <div className="w-6"></div> {/* Placeholder to balance the back button */}
      </div>

      {/* Date inputs */}
      <div className="flex justify-center gap-4 p-4">
        <div className="flex flex-col items-center">
          <label className="text-gray-500 text-sm">From</label>
          <input
            type="text"
            readOnly
            className="border px-4 py-2 rounded-lg text-center w-[140px] text-base font-light tracking-wide text-gray-800 transition shadow-sm hover:shadow-md active:shadow-lg hover:bg-gray-100 active:bg-gray-200"
            value={range[0].startDate.toLocaleDateString('en-GB')}
          />
        </div>
        <div className="flex flex-col items-center">
          <label className="text-gray-500 text-sm">To</label>
          <input
            type="text"
            readOnly
            className="border px-4 py-2 rounded-lg text-center w-[140px] text-base font-light tracking-wide text-gray-800 transition shadow-sm hover:shadow-md active:shadow-lg hover:bg-gray-100 active:bg-gray-200"
            value={range[0].endDate.toLocaleDateString('en-GB')}
          />
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="text-[17px]">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => {
              setRange([item.selection]);
              setHasUserInteracted(true);
            }}
            moveRangeOnFirstSelection={false}
            ranges={range}
            rangeColors={["#A58E63"]}
            showDateDisplay={false}
            showSelectionPreview={true}
            months={1}
            direction="vertical"
            showPreview={true}
          />
        </div>
      </div>
      <div className="text-center text-lg font-semibold py-2">
        {nightCount > 0 ? `${nightCount} night${nightCount > 1 ? 's' : ''}` : ''}
      </div>

      {/* Confirm Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleConfirm}
          className="w-full bg-primary text-white py-3 rounded-xl text-lg font-semibold"
        >
          Confirm Dates
        </button>
      </div>
    </motion.div>
  );
}