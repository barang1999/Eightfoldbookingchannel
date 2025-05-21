import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";

const PageNavigation = ({ items }) => {
  if (!Array.isArray(items)) return null;
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6 space-x-2">
      <button onClick={() => navigate(-1)} className="mr-1">
        <ArrowLeft className="w-4 h-4 text-gray-500 mt-[2px]" />
      </button>
      <nav className="text-sm text-gray-500 flex items-center space-x-1 font-medium">
        {items.map((item, index) => (
          <span key={index} className="flex items-center space-x-1">
            {index > 0 && <span className="text-gray-300">/</span>}
            {item.current ? (
              <span className="text-[#9c865f] font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-[#9c865f] transition"
              >
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
};

export default PageNavigation;