import React, { useState, useEffect, useRef } from "react";
import { Combobox } from '@headlessui/react';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import { useClickOutside } from "../hooks/useClickOutside";

const EditContactModal = ({ isOpen, onClose, onSave, user, contactInfo }) => {
  const [countryCode, setCountryCode] = useState("+855");
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && contactInfo) {
      setCountryCode(contactInfo.countryCode || "+855");
      setPhone(contactInfo.phone || "");
      setAddress(contactInfo.address || "");
    }
  }, [isOpen, contactInfo]);

  const countryCodes = [
    { value: "+93", label: "Afghanistan" },
  { value: "+355", label: "Albania" },
  { value: "+213", label: "Algeria" },
  { value: "+1-684", label: "American Samoa" },
  { value: "+376", label: "Andorra" },
  { value: "+244", label: "Angola" },
  { value: "+1-264", label: "Anguilla" },
  { value: "+672", label: "Antarctica" },
  { value: "+1-268", label: "Antigua and Barbuda" },
  { value: "+54", label: "Argentina" },
  { value: "+374", label: "Armenia" },
  { value: "+297", label: "Aruba" },
  { value: "+61", label: "Australia" },
  { value: "+43", label: "Austria" },
  { value: "+994", label: "Azerbaijan" },
  { value: "+1-242", label: "Bahamas" },
  { value: "+973", label: "Bahrain" },
  { value: "+880", label: "Bangladesh" },
  { value: "+1-246", label: "Barbados" },
  { value: "+375", label: "Belarus" },
  { value: "+32", label: "Belgium" },
  { value: "+501", label: "Belize" },
  { value: "+229", label: "Benin" },
  { value: "+1-441", label: "Bermuda" },
  { value: "+975", label: "Bhutan" },
  { value: "+591", label: "Bolivia" },
  { value: "+387", label: "Bosnia and Herzegovina" },
  { value: "+267", label: "Botswana" },
  { value: "+55", label: "Brazil" },
  { value: "+246", label: "British Indian Ocean Territory" },
  { value: "+673", label: "Brunei" },
  { value: "+359", label: "Bulgaria" },
  { value: "+226", label: "Burkina Faso" },
  { value: "+257", label: "Burundi" },
  { value: "+855", label: "Cambodia" },
  { value: "+237", label: "Cameroon" },
  { value: "+1", label: "Canada" },
  { value: "+238", label: "Cape Verde" },
  { value: "+1-345", label: "Cayman Islands" },
  { value: "+236", label: "Central African Republic" },
  { value: "+235", label: "Chad" },
  { value: "+56", label: "Chile" },
  { value: "+86", label: "China" },
  { value: "+61", label: "Christmas Island" },
  { value: "+61", label: "Cocos (Keeling) Islands" },
  { value: "+57", label: "Colombia" },
  { value: "+269", label: "Comoros" },
  { value: "+242", label: "Congo" },
  { value: "+243", label: "Congo (Democratic Republic)" },
  { value: "+682", label: "Cook Islands" },
  { value: "+506", label: "Costa Rica" },
  { value: "+385", label: "Croatia" },
  { value: "+53", label: "Cuba" },
  { value: "+599", label: "Curacao" },
  { value: "+357", label: "Cyprus" },
  { value: "+420", label: "Czech Republic" },
  { value: "+45", label: "Denmark" },
  { value: "+253", label: "Djibouti" },
  { value: "+1-767", label: "Dominica" },
  { value: "+1-809", label: "Dominican Republic" },
  { value: "+593", label: "Ecuador" },
  { value: "+20", label: "Egypt" },
  { value: "+503", label: "El Salvador" },
  { value: "+240", label: "Equatorial Guinea" },
  { value: "+291", label: "Eritrea" },
  { value: "+372", label: "Estonia" },
  { value: "+268", label: "Eswatini" },
  { value: "+251", label: "Ethiopia" },
  { value: "+500", label: "Falkland Islands" },
  { value: "+298", label: "Faroe Islands" },
  { value: "+679", label: "Fiji" },
  { value: "+358", label: "Finland" },
  { value: "+33", label: "France" },
  { value: "+594", label: "French Guiana" },
  { value: "+689", label: "French Polynesia" },
  { value: "+241", label: "Gabon" },
  { value: "+220", label: "Gambia" },
  { value: "+995", label: "Georgia" },
  { value: "+49", label: "Germany" },
  { value: "+233", label: "Ghana" },
  { value: "+350", label: "Gibraltar" },
  { value: "+30", label: "Greece" },
  { value: "+299", label: "Greenland" },
  { value: "+1-473", label: "Grenada" },
  { value: "+590", label: "Guadeloupe" },
  { value: "+1-671", label: "Guam" },
  { value: "+502", label: "Guatemala" },
  { value: "+224", label: "Guinea" },
  { value: "+245", label: "Guinea-Bissau" },
  { value: "+592", label: "Guyana" },
  { value: "+509", label: "Haiti" },
  { value: "+504", label: "Honduras" },
  { value: "+852", label: "Hong Kong" },
  { value: "+36", label: "Hungary" },
  { value: "+354", label: "Iceland" },
  { value: "+91", label: "India" },
  { value: "+62", label: "Indonesia" },
  { value: "+98", label: "Iran" },
  { value: "+964", label: "Iraq" },
  { value: "+353", label: "Ireland" },
  { value: "+972", label: "Israel" },
  { value: "+39", label: "Italy" },
  { value: "+1-876", label: "Jamaica" },
  { value: "+81", label: "Japan" },
  { value: "+962", label: "Jordan" },
  { value: "+7", label: "Kazakhstan" },
  { value: "+254", label: "Kenya" },
  { value: "+686", label: "Kiribati" },
  { value: "+383", label: "Kosovo" },
  { value: "+965", label: "Kuwait" },
  { value: "+996", label: "Kyrgyzstan" },
  { value: "+856", label: "Laos" },
  { value: "+371", label: "Latvia" },
  { value: "+961", label: "Lebanon" },
  { value: "+266", label: "Lesotho" },
  { value: "+231", label: "Liberia" },
  { value: "+218", label: "Libya" },
  { value: "+423", label: "Liechtenstein" },
  { value: "+370", label: "Lithuania" },
  { value: "+352", label: "Luxembourg" },
  { value: "+853", label: "Macau" },
  { value: "+389", label: "North Macedonia" },
  { value: "+261", label: "Madagascar" },
  { value: "+265", label: "Malawi" },
  { value: "+60", label: "Malaysia" },
  { value: "+960", label: "Maldives" },
  { value: "+223", label: "Mali" },
  { value: "+356", label: "Malta" },
  { value: "+692", label: "Marshall Islands" },
  { value: "+596", label: "Martinique" },
  { value: "+222", label: "Mauritania" },
  { value: "+230", label: "Mauritius" },
  { value: "+262", label: "Mayotte" },
  { value: "+52", label: "Mexico" },
  { value: "+691", label: "Micronesia" },
  { value: "+373", label: "Moldova" },
  { value: "+377", label: "Monaco" },
  { value: "+976", label: "Mongolia" },
  { value: "+382", label: "Montenegro" },
  { value: "+212", label: "Morocco" },
  { value: "+258", label: "Mozambique" },
  { value: "+95", label: "Myanmar" },
  { value: "+264", label: "Namibia" },
  { value: "+674", label: "Nauru" },
  { value: "+977", label: "Nepal" },
  { value: "+31", label: "Netherlands" },
  { value: "+687", label: "New Caledonia" },
  { value: "+64", label: "New Zealand" },
  { value: "+505", label: "Nicaragua" },
  { value: "+227", label: "Niger" },
  { value: "+234", label: "Nigeria" },
  { value: "+683", label: "Niue" },
  { value: "+672", label: "Norfolk Island" },
  { value: "+850", label: "North Korea" },
  { value: "+47", label: "Norway" },
  { value: "+968", label: "Oman" },
  { value: "+92", label: "Pakistan" },
  { value: "+680", label: "Palau" },
  { value: "+970", label: "Palestinian Territories" },
  { value: "+507", label: "Panama" },
  { value: "+675", label: "Papua New Guinea" },
  { value: "+595", label: "Paraguay" },
  { value: "+51", label: "Peru" },
  { value: "+63", label: "Philippines" },
  { value: "+48", label: "Poland" },
  { value: "+351", label: "Portugal" },
  { value: "+1-787", label: "Puerto Rico" },
  { value: "+974", label: "Qatar" },
  { value: "+262", label: "Reunion" },
  { value: "+40", label: "Romania" },
  { value: "+7", label: "Russia" },
  { value: "+250", label: "Rwanda" },
  { value: "+290", label: "Saint Helena" },
  { value: "+1-869", label: "Saint Kitts and Nevis" },
  { value: "+1-758", label: "Saint Lucia" },
  { value: "+590", label: "Saint Martin" },
  { value: "+508", label: "Saint Pierre and Miquelon" },
  { value: "+1-784", label: "Saint Vincent and the Grenadines" },
  { value: "+685", label: "Samoa" },
  { value: "+378", label: "San Marino" },
  { value: "+239", label: "Sao Tome and Principe" },
  { value: "+966", label: "Saudi Arabia" },
  { value: "+221", label: "Senegal" },
  { value: "+381", label: "Serbia" },
  { value: "+248", label: "Seychelles" },
  { value: "+232", label: "Sierra Leone" },
  { value: "+65", label: "Singapore" },
  { value: "+421", label: "Slovakia" },
  { value: "+386", label: "Slovenia" },
  { value: "+677", label: "Solomon Islands" },
  { value: "+252", label: "Somalia" },
  { value: "+27", label: "South Africa" },
  { value: "+82", label: "South Korea" },
  { value: "+211", label: "South Sudan" },
  { value: "+34", label: "Spain" },
  { value: "+94", label: "Sri Lanka" },
  { value: "+249", label: "Sudan" },
  { value: "+597", label: "Suriname" },
  { value: "+268", label: "Swaziland" },
  { value: "+46", label: "Sweden" },
  { value: "+41", label: "Switzerland" },
  { value: "+963", label: "Syria" },
  { value: "+886", label: "Taiwan" },
  { value: "+992", label: "Tajikistan" },
  { value: "+255", label: "Tanzania" },
  { value: "+66", label: "Thailand" },
  { value: "+228", label: "Togo" },
  { value: "+690", label: "Tokelau" },
  { value: "+676", label: "Tonga" },
  { value: "+1-868", label: "Trinidad and Tobago" },
  { value: "+216", label: "Tunisia" },
  { value: "+90", label: "Turkey" },
  { value: "+993", label: "Turkmenistan" },
  { value: "+1-649", label: "Turks and Caicos Islands" },
  { value: "+688", label: "Tuvalu" },
  { value: "+256", label: "Uganda" },
  { value: "+380", label: "Ukraine" },
  { value: "+971", label: "United Arab Emirates" },
  { value: "+44", label: "United Kingdom" },
  { value: "+1", label: "United States" },
  { value: "+598", label: "Uruguay" },
  { value: "+998", label: "Uzbekistan" },
  { value: "+678", label: "Vanuatu" },
  { value: "+39", label: "Vatican City" },
  { value: "+58", label: "Venezuela" },
  { value: "+84", label: "Vietnam" },
  { value: "+681", label: "Wallis and Futuna" },
  { value: "+212", label: "Western Sahara" },
  { value: "+967", label: "Yemen" },
  { value: "+260", label: "Zambia" },
  { value: "+263", label: "Zimbabwe" }
];

  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

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

          <h2 className="text-lg font-semibold mb-4">Edit Contact</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              const contactData = {
                countryCode,
                phone,
                address
              };
              const db = getFirestore();
              const auth = getAuth();
              const uid = auth.currentUser?.uid;
              const propertyId = localStorage.getItem('propertyId');
              if (uid) {
                await setDoc(doc(db, "users", uid, "profile", "contact"), contactData);
                console.log("Contact data saved to Firebase:", contactData);

                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';
                console.log('[Debug] Syncing contact info to MongoDB:', {
                  userUid: uid,
                  propertyId,
                  profile: { contact: contactData }
                });
                const response = await fetch(`${apiBaseUrl}/api/user/update-profile`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userUid: uid,
                    propertyId,
                    profile: {
                      contact: contactData
                    }
                  }),
                });
                const responseData = await response.json();
                console.log('[Debug] MongoDB response:', responseData);
              }
              onSave(contactData);
              setIsSaving(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={user?.email || ""}
                disabled
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
                        .filter(c =>
                          c.label.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((c) => (
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
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
                className="px-5 py-2 text-sm bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditContactModal;