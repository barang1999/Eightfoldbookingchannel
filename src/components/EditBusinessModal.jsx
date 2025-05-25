import React, { useState, useEffect, useRef } from "react";
import { Combobox } from "@headlessui/react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

// Reuse or import the full countryCodes array from your shared util file
import countryCodes from "./CountryCodesList"; // adjust this path to where your country code list is stored

import { useClickOutside } from "../hooks/useClickOutside"; // adjust the path if needed

const EditBusinessModal = ({ isOpen, onClose, onSave, businessInfo }) => {
  const [countryCode, setCountryCode] = useState("+855");
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  useEffect(() => {
    if (isOpen && businessInfo) {
      setEmail(businessInfo.businessEmail || "");
      setPhone(businessInfo.businessPhone || "");
      setCountryCode(businessInfo.countryCode || "+855");
      setBusinessAddress(businessInfo.businessAddress || "");
      setBillingAddress(businessInfo.billingAddress || "");
    }
  }, [isOpen, businessInfo]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-xl rounded-lg shadow-xl p-6 mx-4 relative"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <h2 className="text-lg font-semibold mb-4">Edit Business Contact</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const businessData = {
                countryCode,
                businessPhone: phone,
                businessEmail: email,
                businessAddress,
                billingAddress,
              };
              const db = getFirestore();
              const auth = getAuth();
              const uid = auth.currentUser?.uid;
              const propertyId = localStorage.getItem('propertyId');
              if (uid) {
                await setDoc(doc(db, "users", uid, "profile", "business"), businessData);
                console.log("Business data saved to Firebase:", businessData);

                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';
                console.log('[Debug] Syncing business info to MongoDB:', {
                  userUid: uid,
                  propertyId,
                  profile: { business: businessData }
                });
                const response = await fetch(`${apiBaseUrl}/api/user/update-profile`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userUid: uid,
                    propertyId,
                    profile: {
                      business: businessData
                    }
                  }),
                });
                const responseData = await response.json();
                console.log('[Debug] MongoDB response:', responseData);
              }
              setLoading(false);
              onSave(businessData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter business email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone number</label>
              <div className="flex gap-2">
                <Combobox value={countryCode} onChange={setCountryCode}>
                  <div className="relative w-32">
                    <Combobox.Input
                      className="w-full border rounded px-3 py-2 bg-white"
                      onChange={(event) => setQuery(event.target.value)}
                      displayValue={(val) => val}
                    />
                    <Combobox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border rounded shadow-md">
                      {countryCodes
                        .filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
                        .map(c => (
                          <Combobox.Option
                            key={`${c.label}-${c.value}`}
                            value={c.value}
                            className={({ active }) =>
                              `px-3 py-2 cursor-pointer ${active ? 'bg-primary text-white' : 'text-gray-900'}`
                            }
                          >
                            {c.label} ({c.value})
                          </Combobox.Option>
                        ))}
                    </Combobox.Options>
                  </div>
                </Combobox>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Business address</label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Enter business address"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Billing address</label>
              <input
                type="text"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Enter billing address"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditBusinessModal;