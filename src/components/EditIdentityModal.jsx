import React, { useState, useEffect, useRef } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
import { motion, AnimatePresence } from "framer-motion";
import { Combobox } from '@headlessui/react';
import { useClickOutside } from "../hooks/useClickOutside";

const nationalities = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentinian", "Armenian", "Australian", "Austrian", "Azerbaijani",
  "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabé", "Burmese", "Burundian",
  "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Dutch",
  "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian",
  "Fijian", "Finnish", "French",
  "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinea-Bissauan", "Guyanese",
  "Haitian", "Honduran", "Hungarian",
  "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian",
  "Jamaican", "Japanese", "Jordanian",
  "Kazakh", "Kenyan", "Kiribati", "Korean", "Kosovar", "Kuwaiti", "Kyrgyz",
  "Lao", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger",
  "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican",
  "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerien", "Nigerian", "Norwegian",
  "Omani",
  "Pakistani", "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Philippine", "Polish", "Portuguese",
  "Qatari",
  "Romanian", "Russian", "Rwandan",
  "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander", "Somali", "South African", "South Sudanese", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan",
  "Ugandan", "Ukrainian", "Uruguayan", "Uzbek",
  "Vanuatuan", "Vatican", "Venezuelan", "Vietnamese",
  "Welsh",
  "Yemeni",
  "Zambian", "Zimbabwean"
];

const EditIdentityModal = ({ isOpen, onClose, onSave, identityInfo }) => {
  const modalRef = useRef();
  const [selectedNationality, setSelectedNationality] = useState('');
  const [query, setQuery] = useState('');
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dayQuery, setDayQuery] = useState("");
  const [monthQuery, setMonthQuery] = useState("");
  const [yearQuery, setYearQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("Mr.");
  const [fullName, setFullName] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  useEffect(() => {
    if (isOpen && identityInfo) {
      setTitle(identityInfo.title || "Mr.");
      setFullName(identityInfo.fullName || "");
      setPlaceOfBirth(identityInfo.placeOfBirth || "");
      setSelectedNationality(identityInfo.nationality || "");

      if (identityInfo.dob) {
        const [year, month, day] = identityInfo.dob.split("-");
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          setDobYear(year);
          setDobMonth(Number(month));
          setDobDay(Number(day));
        }
      }
    }
  }, [isOpen, identityInfo]);

  const filteredNationalities = nationalities.filter(n =>
    n.toLowerCase().includes(query.toLowerCase())
  );
  const filteredDays = dayQuery === "" ? days : days.filter((d) => d.toString().includes(dayQuery));
  const filteredMonths = monthQuery === "" ? months : months.filter((m) => m.toLowerCase().includes(monthQuery.toLowerCase()));
  const filteredYears = yearQuery === "" ? years : years.filter((y) => y.toString().includes(yearQuery));

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

          <h2 className="text-lg font-semibold mb-4">Edit Identity</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              const identityData = {
                title,
                fullName,
                dob: `${dobYear}-${dobMonth.toString().padStart(2, '0')}-${dobDay.toString().padStart(2, '0')}`,
                nationality: selectedNationality,
                placeOfBirth,
              };
              const db = getFirestore();
              const auth = getAuth();
              const uid = auth.currentUser?.uid;
              if (uid) {
                await setDoc(doc(db, "users", uid, "profile", "identity"), identityData);

                // --- Sync with backend MongoDB
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071';
                const propertyId = localStorage.getItem('propertyId');
                console.log('[Debug] Syncing identity info to MongoDB:', {
                  userUid: uid,
                  propertyId,
                  profile: { identity: identityData }
                });
                const response = await fetch(`${apiBaseUrl}/api/user/update-profile`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userUid: uid,
                    propertyId,
                    profile: {
                      identity: identityData
                    }
                  }),
                });
                const responseData = await response.json();
                console.log('[Debug] MongoDB response:', responseData);
              }
              setIsSaving(false);
              onSave(identityData);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <select name="title" className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)}>
                <option>Mr.</option>
                <option>Mrs.</option>
                <option>Ms.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <input name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              <div className="flex gap-2 relative z-30">
                <Combobox value={dobDay} onChange={setDobDay}>
                  <div className="relative w-1/3">
                    <Combobox.Input
                      className="w-full border rounded px-3 py-2"
                      displayValue={(val) => val}
                      placeholder="Day"
                      onChange={(e) => setDayQuery(e.target.value)}
                    />
                    {filteredDays.length > 0 && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                        {filteredDays.map((day) => (
                          <Combobox.Option key={day} value={day} className="px-4 py-2 text-gray-900 bg-gray-50 border-b border-gray-100">
                            {day}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}
                  </div>
                </Combobox>

                <Combobox value={dobMonth} onChange={setDobMonth}>
                  <div className="relative w-1/3">
                    <Combobox.Input
                      className="w-full border rounded px-3 py-2"
                      displayValue={(val) => months[val - 1] || ''}
                      placeholder="Month"
                      onChange={(e) => setMonthQuery(e.target.value)}
                    />
                    {filteredMonths.length > 0 && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                        {filteredMonths.map((month, i) => (
                          <Combobox.Option key={month} value={months.indexOf(month) + 1} className="px-4 py-2 text-gray-900 bg-gray-50 border-b border-gray-100">
                            {month}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}
                  </div>
                </Combobox>

                <Combobox value={dobYear} onChange={setDobYear}>
                  <div className="relative w-1/3">
                    <Combobox.Input
                      className="w-full border rounded px-3 py-2"
                      displayValue={(val) => val}
                      placeholder="Year"
                      onChange={(e) => setYearQuery(e.target.value)}
                    />
                    {filteredYears.length > 0 && (
                      <Combobox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                        {filteredYears.map((year) => (
                          <Combobox.Option key={year} value={year} className="px-4 py-2 text-gray-900 bg-gray-50 border-b border-gray-100">
                            {year}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    )}
                  </div>
                </Combobox>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nationality</label>
              <Combobox value={selectedNationality} onChange={setSelectedNationality}>
                <div className="relative">
                  <Combobox.Input
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full border rounded px-3 py-2 relative z-20 bg-white"
                    displayValue={(n) => n}
                    placeholder="Select nationality"
                  />
                  {query && filteredNationalities.length > 0 && (
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                      {filteredNationalities.map((n) => (
                        <Combobox.Option
                          key={n}
                          value={n}
                          className="cursor-pointer select-none px-4 py-2 border-b border-gray-100 bg-gray-50 text-gray-900"
                        >
                          {n}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                </div>
              </Combobox>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Place of Birth</label>
              <input name="placeOfBirth" type="text" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className="w-full border rounded px-3 py-2" />
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
                disabled={isSaving}
                className="px-5 py-2 text-sm bg-primary text-white rounded hover:bg-opacity-90 disabled:opacity-50"
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

export default EditIdentityModal;
