import React, { useEffect, useState } from "react";

const SpecialRequestBox = () => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("specialRequest");
    if (stored) setValue(stored);
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
    localStorage.setItem("specialRequest", e.target.value);
  };

  return (
    <div className="border rounded-xl p-6 bg-white">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Special requests</h2>
      <p className="text-gray-700 text-sm mb-4">
        While we cannot guarantee all special requests, we’ll do our very best to accommodate them. You’re also welcome to share any additional requests after completing your booking.
      </p>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        Please write your requests in English. <span className="font-normal text-gray-500">(optional)</span>
      </label>
      <textarea
        className="w-full border border-gray-300 rounded-md p-2 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        value={value}
        onChange={handleChange}
        placeholder="Write your request here..."
      />
    </div>
  );
};

export default SpecialRequestBox;
