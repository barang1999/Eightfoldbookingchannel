import React from "react";
import { useLocation } from "react-router-dom";
import { Check } from "lucide-react";

const MobileStepper = () => {
  const location = useLocation();

  const steps = [
  
    { label: "Select Room", to: "/" },
  
    { label: "Guest Info", to: "/guest-info" },
    { label: "Confirmation", to: "/confirmation" },
  ];

  const currentIndex = steps.findIndex((step) => step.to === location.pathname);

  return (
    <div className="flex items-center justify-center gap-2 sm:hidden px-4 py-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={index} className="flex flex-col items-center w-full relative">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2
                ${isCompleted || isCurrent ? "bg-[#A58E63] text-white border-[#A58E63]" : "text-gray-400 border-gray-300"}
              `}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <div className="text-[10px] text-center mt-1 text-gray-500 whitespace-nowrap">
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-1/2 left-full w-full h-1 z-[-1] transform -translate-y-1/2 
                  ${index < currentIndex - 1 ? "bg-[#A58E63]" : "bg-gray-300"}
                `}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileStepper;