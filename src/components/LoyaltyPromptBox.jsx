import React from "react";
import { Link } from "react-router-dom";

const LoyaltyPromptBox = () => {
  return (
    <div className="border border-gray-300 rounded-xl p-4 bg-white flex justify-between items-center">
      <div>
        <p className="text-gray-700 font-normal text-base">
          Enjoy a more seamless experience by signing in or creating a free account with <span className="font-medium">Loyalty</span>, our exclusive guest program
        </p>
        <div className="mt-2">
          <Link to="/login" className="text-blue-600 font-normal text-sm hover:underline mr-4">Sign in</Link>
          <Link to="/register" className="text-blue-600 font-normal text-sm hover:underline">Create a free account</Link>
        </div>
      </div>
      <div className="ml-4 text-right">
        <span className="text-2xl font-bold text-primary tracking-tight">Loyalty</span>
      </div>
    </div>
  );
};

export default LoyaltyPromptBox;
