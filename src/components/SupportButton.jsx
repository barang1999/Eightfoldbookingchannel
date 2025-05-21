import React, { useState, useRef } from "react";
import axios from "axios";
import { useEffect } from "react";
import { MessageCircle, Phone, Mail, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "../hooks/useClickOutside";
import { motion, AnimatePresence } from "framer-motion";

const SupportButton = ({ propertyId, className = "" }) => {
  const [open, setOpen] = useState(false);
  const toggleOptions = () => setOpen(!open);
  const wrapperRef = useRef(null);
  useClickOutside(wrapperRef, () => setOpen(false));

  const [contactInfo, setContactInfo] = useState({ email: "", phone: "", whatsapp: "" });

  useEffect(() => {
    if (!propertyId) return;

    const url = `${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`;

    const fetchContactInfo = async () => {
      try {
        const res = await fetch(url);
        const raw = await res.text();
        const data = JSON.parse(raw);

        setContactInfo({
          phone: data.phone,
          email: data.email,
          whatsapp: data.socialLinks?.whatsapp || `https://wa.me/${data.phone?.replace(/^0/, '+855')}`,
        });
       
      } catch (error) {
        console.error("❌ Error fetching property contact info:", error);
      }
    };

    fetchContactInfo();
  }, [propertyId]);

  return (
    <div
      ref={wrapperRef}
      className={`z-20 flex flex-col items-end gap-2 transition-all duration-300 ease-in-out ${className}`}
      style={{ display: typeof window !== 'undefined' && document.body.classList.contains('modal-open') ? 'none' : undefined }}
    >
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => window.open(`tel:${contactInfo.phone}`)}
              className="flex items-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-full shadow-md px-5 py-2 hover:bg-gray-50 transition"
            >
              <Phone className="w-5 h-5 text-[#a18a63]" />
              <span className="text-sm font-medium">Call Us</span>
            </motion.button>
            <motion.button
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => window.open(`mailto:${contactInfo.email}`)}
              className="flex items-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-full shadow-md px-5 py-2 hover:bg-gray-50 transition"
            >
              <Mail className="w-5 h-5 text-[#a18a63]" />
              <span className="text-sm font-medium">Email Us</span>
            </motion.button>
            <motion.button
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => window.open(`${contactInfo.whatsapp}`)}
              className="flex items-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-full shadow-md px-5 py-2 hover:bg-gray-50 transition"
            >
              <MessageSquareText className="w-5 h-5 text-[#a18a63]" />
              <span className="text-sm font-medium">WhatsApp</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>
      <button
        onClick={toggleOptions}
        className="flex items-center gap-3 bg-white text-gray-900 border border-gray-200 rounded-full shadow-md px-5 py-2 hover:bg-gray-50 transition"
      >
        <MessageCircle className="w-5 h-5 text-[#a18a63]" />
        <span className="hidden md:inline text-sm font-medium">Help &amp; Support</span>
      </button>
    </div>
  );
};

export default SupportButton;
