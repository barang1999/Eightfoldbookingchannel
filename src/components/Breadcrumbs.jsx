import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  // Define a static breadcrumb trail since this is a linear booking flow
  const steps = [
 
    { label: "Select Room", to: "/" },
    { label: "Guest Information", to: "/guest-info" },
    { label: "Confirmation", to: "/confirmation" },
  ];

  return (
    <nav className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2 tracking-wide overflow-x-auto whitespace-nowrap px-2 sm:px-0">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-1">
          <Link
            to={step.to}
            className={`hover:text-primary transition-colors ${
              location.pathname === step.to ? "text-[#A58E63] font-semibold" : "text-gray-600"
            }`}
          >
            {step.label}
          </Link>
          {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;