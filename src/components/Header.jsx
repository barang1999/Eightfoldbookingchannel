import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside"; // adjust path if needed
import { Listbox } from '@headlessui/react';
import { useCurrency } from "../contexts/CurrencyProvider";
import CurrencySelectorModal from "./CurrencySelectorModal";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import MobileUserDropdown from "./MobileUserDropdown";
import DesktopUserDropdown from "./DesktopUserDropdown";
import { useNavigate } from "react-router-dom";
import { useProperty } from "../contexts/PropertyContext";

const Header = () => {
  const { currency, setCurrency } = useCurrency();
  const { user, profile } = useAuth();

  const navigate = useNavigate();

  const property = useProperty();

  console.log("Header property name:", property?.name);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName.trim().split(" ")[0]; // Use first name from full name
    }
    if (user?.displayName) {
      return user.displayName.trim().split(" ")[0]; // Fallback to Firebase display name
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase(); // First letter of email
    }
    return "Sign in / Sign up";
  };

  // Debug log for website URL
  console.log("Website Link:", property?.socialLinks?.website);

  return (
    <header className="w-full bg-white shadow-md px-12 py-6 flex justify-between md:justify-center relative">
      <img
        src="/Logo.png"
        alt="Eightfold Logo"
        className="h-10 md:h-16 cursor-pointer"
        onClick={() => {
          if (property?.socialLinks?.website) {
            window.location.href = property.socialLinks.website;
          } else {
            navigate("/");
          }
        }}
      />
      <div className="absolute right-4 md:right-6 flex items-center gap-4 text-sm">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white border border-gray-300 rounded-md px-4 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          {currency}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="font-medium px-4 py-1.5 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition"
          >
            <span className="flex items-center gap-2">
              <div className="bg-primary rounded-full p-1 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" fill="white" className="inline-block">
                  <g>
                    <path d="M22 5.88281C22 7.53967 20.6569 8.88281 19 8.88281C17.3431 8.88281 16 7.53967 16 5.88281C16 4.22596 17.3431 2.88281 19 2.88281C20.6569 2.88281 22 4.22596 22 5.88281Z"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.7788 4.31999C13.9036 4.03618 12.9697 3.88281 12 3.88281C7.02944 3.88281 3 7.91225 3 12.8828C3 17.8534 7.02944 21.8828 12 21.8828C16.9706 21.8828 21 17.8534 21 12.8828C21 11.9131 20.8466 10.9792 20.5628 10.104C20.0976 10.2763 19.5962 10.3739 19.073 10.3822C19.3495 11.1643 19.5 12.006 19.5 12.8828C19.5 15.0502 18.5807 17.0028 17.1107 18.372C16.9844 17.9563 16.8658 17.6124 16.7416 17.3353C16.5892 16.9955 16.3957 16.6796 16.0951 16.456C15.7807 16.2221 15.4425 16.1582 15.1515 16.1377C14.97 16.125 14.7454 16.1278 14.5262 16.1305C14.4355 16.1317 14.3455 16.1328 14.26 16.1328H9.74002C9.65456 16.1328 9.56477 16.1317 9.47407 16.1305C9.25483 16.1278 9.03005 16.125 8.84849 16.1377C8.55751 16.1582 8.21936 16.2221 7.90491 16.456C7.60432 16.6796 7.41084 16.9955 7.25848 17.3353C7.13421 17.6124 7.01567 17.9563 6.88933 18.372C5.41934 17.0028 4.5 15.0502 4.5 12.8828C4.5 8.74068 7.85786 5.38281 12 5.38281C12.8768 5.38281 13.7185 5.53327 14.5006 5.80978C14.5089 5.28664 14.6065 4.78519 14.7788 4.31999ZM15.8298 19.3326C14.7088 19.9997 13.3991 20.3828 12 20.3828C10.6009 20.3828 9.29122 19.9997 8.17024 19.3326L8.24017 19.0923C8.39911 18.5459 8.51968 18.1888 8.62719 17.949C8.73537 17.7077 8.79814 17.6611 8.80013 17.6596L8.80107 17.659C8.80107 17.659 8.80539 17.6569 8.8143 17.6542C8.83412 17.6483 8.87462 17.6396 8.95342 17.6341C9.07262 17.6257 9.19616 17.6274 9.37109 17.6298C9.47336 17.6312 9.5932 17.6328 9.74002 17.6328H14.26C14.4068 17.6328 14.5267 17.6312 14.629 17.6298C14.8039 17.6274 14.9274 17.6257 15.0466 17.6341C15.1254 17.6396 15.1659 17.6483 15.1857 17.6542C15.1946 17.6569 15.199 17.659 15.199 17.659L15.1999 17.6596C15.2019 17.6611 15.2647 17.7077 15.3729 17.949C15.4804 18.1888 15.6009 18.5459 15.7599 19.0923L15.8298 19.3326Z"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 7.13281C9.92893 7.13281 8.25 8.81174 8.25 10.8828C8.25 12.9539 9.92893 14.6328 12 14.6328C14.0711 14.6328 15.75 12.9539 15.75 10.8828C15.75 8.81174 14.0711 7.13281 12 7.13281ZM9.75 10.8828C9.75 9.64017 10.7574 8.63281 12 8.63281C13.2426 8.63281 14.25 9.64017 14.25 10.8828C14.25 12.1255 13.2426 13.1328 12 13.1328C10.7574 13.1328 9.75 12.1255 9.75 10.8828Z"></path>
                  </g>
                </svg>
              </div>
              <span className="hidden md:inline">{getUserDisplayName()}</span>
            </span>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div className="block md:hidden">
                  <MobileUserDropdown
                    user={user}
                    setIsModalOpen={setIsModalOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                  />
                </div>
                <div className="hidden md:block">
                  <DesktopUserDropdown
                    user={user}
                    setIsModalOpen={setIsModalOpen}
                    setIsDropdownOpen={setIsDropdownOpen}
                  />
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <CurrencySelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;