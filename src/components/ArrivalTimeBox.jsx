import React, { Fragment, useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, HelpCircle } from "lucide-react";


const ArrivalTimeBox = () => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const from = String(i).padStart(2, '0') + ":00";
    const to = String((i + 1) % 24).padStart(2, '0') + ":00";
    return `${from} – ${to}`;
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    return localStorage.getItem("arrivalTime") || "";
  });
  const [query, setQuery] = useState("");
  const filteredHours = query
    ? hours.filter((h) => h.toLowerCase().includes(query.toLowerCase()))
    : hours;

  useEffect(() => {
    const storedTime = localStorage.getItem("arrivalTime");
    if (storedTime) {
      setSelectedTime(storedTime);
    }
  }, []);

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    localStorage.setItem("arrivalTime", time);
  };

  return (
    <div className="border rounded-xl p-6 bg-white shadow-sm mt-4">
      <h2 className="text-xl font-bold mb-4">Your arrival time</h2>
      <ul className="text-black mb-4 space-y-1">
        <li className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#A58E63]" />
          <span className="text-sm text-black">Your room will be ready for check-in at 14:00</span>
        </li>
        <li className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#A58E63]" />
          <span className="text-sm text-black">24-hour front desk – Help whenever you need it!</span>
        </li>
      </ul>
      <label className="font-semibold text-sm block mb-1">
        Add your estimated arrival time <span className="text-gray-500 font-normal">(optional)</span>
      </label>
      <Combobox value={selectedTime} onChange={handleSelectTime}>
        <div className="relative">
          <Combobox.Input
            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Please select"
            displayValue={(v) => v}
            onChange={(e) => setQuery(e.target.value)}
          />
          <AnimatePresence>
            {filteredHours.length > 0 && (
              <Combobox.Options
                as={motion.ul}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg max-h-60 overflow-auto"
              >
                <Combobox.Option value="I don't know" as={Fragment}>
                  {({ active, selected }) => (
                    <li
                      className={`cursor-pointer px-4 py-2 ${
                        active ? "bg-gray-100" : ""
                      } ${selected ? "font-medium" : "font-normal"}`}
                    >
                      I don't know
                    </li>
                  )}
                </Combobox.Option>
                {filteredHours.map((slot, index) => (
                  <Combobox.Option key={index} value={slot} as={Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer px-4 py-2 ${
                          active ? "bg-gray-100" : ""
                        } ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {slot}
                      </li>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </AnimatePresence>
        </div>
      </Combobox>
      <p className="text-sm text-gray-500 mt-2">Time is for Siem Reap time zone</p>
    </div>
  );
};

export { ArrivalTimeBox };