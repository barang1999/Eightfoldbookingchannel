import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
const countryCodeOptions = [
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
import { Listbox, Combobox } from '@headlessui/react';
import { Fragment } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../hooks/useClickOutside'; // Adjust the path if needed
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';

const GuestInfoForm = ({ user, showError }) => {
  const [prefilled, setPrefilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { selectedRooms } = useSelectedRooms();
  const [firstNameFromUser, lastNameFromUser] = user?.displayName?.split(' ') || [];
  const titleOptions = ["Mr", "Mrs", "Ms", "Doctor", "Professor"];
  const [selectedTitle, setSelectedTitle] = useState('');
  const [form, setForm] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '',
    phone: '',
    country: '',
    nationality: '',
    purpose: '',
    bedPreferences: {},
    agree: false
  });
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Options for Listbox fields
  const countryOptions = [...new Set([...form.country ? [form.country] : [], "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"])];
  const nationalityOptions = [...new Set([...form.nationality ? [form.nationality] : [], "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guinea-Bissauan", "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kittitian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerien", "Nigerian", "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Philippine", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Solomon Islander", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemeni", "Zambian", "Zimbabwean"])];
  const purposeOptions = [...new Set([...form.purpose ? [form.purpose] : [], "leisure", "business", "other"])];
  // Local state for Listbox dropdowns
  const [selectedCode, setSelectedCode] = useState(form.countryCode);
  const [selectedCountry, setSelectedCountry] = useState(form.country);
  const [selectedNationality, setSelectedNationality] = useState(form.nationality);
  const [selectedPurpose, setSelectedPurpose] = useState(form.purpose);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    if (!user) return;
    fetch("https://geolocation-db.com/json/")
      .then(res => res.json())
      .then(data => {
        if (data && data.country_name) {
          setSelectedCountry(data.country_name);
          handleChange({ target: { name: 'country', value: data.country_name } });
        }
      })
      .catch(err => console.error("Failed to fetch country:", err));
  }, [user]);

  // Restore from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("guestInfo");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
        setSelectedTitle(parsed.title || "");
        setSelectedCode(parsed.countryCode || "");
        setSelectedNationality(parsed.nationality || "");
        setSelectedPurpose(parsed.purpose || "");
        setSelectedCountry(parsed.country || "");
        setPrefilled(true);
      } catch (err) {
        console.error("❌ Failed to parse localStorage guestInfo:", err);
      }
    }
  }, []);

  // Save form state to localStorage whenever it changes, including fullName and log what is saved
  useEffect(() => {
    const dataToSave = {
      ...form,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      countryCode: form.countryCode
    };
    localStorage.setItem("guestInfo", JSON.stringify(dataToSave));
  }, [form]);

  useEffect(() => {
    if (!user || prefilled) {
      setLoading(false);
      return;
    }

    const fetchAndPrefill = async () => {
      setLoading(true);
      try {
        // Debug: Log user object
        const db = getFirestore(getApp());
        const contactRef = doc(db, 'users', user.uid, 'profile', 'contact');
        const contactSnap = await getDoc(contactRef);

        // Debug: Log if contact snapshot exists
        const contactData = contactSnap.exists() ? contactSnap.data() : {};
        // Debug: Log contact data from Firestore

        // Debug: Log user fullName and displayName
        const fullName = user?.fullName || user?.displayName || '';
        const [firstName = '', ...rest] = fullName.trim().split(' ');
        const lastName = rest.join(' ');
        // Debug: Log derived first and last name

        const newForm = {
          title: 'Mr',
          countryCode: contactData.countryCode || '+855',
          phone: contactData.phone || user.phoneNumber || '',
          country: 'Cambodia',
          nationality: 'Cambodian',
          purpose: '',
          firstName,
          lastName,
          email: user.email || '',
          agree: false,
          bedPreferences: {}
        };
        // Debug: Log final form object before setting

        // Ensure newForm.title exists in titleOptions
        if (!titleOptions.includes(newForm.title)) {
          newForm.title = titleOptions[0];
        }

        setForm((prev) => ({
          ...prev,
          ...newForm
        }));
        setSelectedTitle(newForm.title);
        setSelectedCode(newForm.countryCode);
        setSelectedNationality(newForm.nationality);
        setSelectedPurpose(newForm.purpose);
        setSelectedCountry(newForm.country);
        setPrefilled(true);
        handleChange({ target: { name: 'country', value: newForm.country } });
      } finally {
        setLoading(false);
      }
    };

    fetchAndPrefill();
  }, [user, prefilled]);

  const modalRef = useRef(null);
  useClickOutside(modalRef, () => setShowPrivacyModal(false));


  const handleBedChange = (roomId, value) => {
    setForm((prev) => ({
      ...prev,
      bedPreferences: {
        ...prev.bedPreferences,
        [roomId]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto px-0 py-0 sm:px-4 sm:py-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-0 py-0 sm:px-4 sm:py-6  rounded-md">
      <h2 className="text-xl font-semibold">let's get acquainted</h2>

      <Listbox value={selectedTitle || form.title} onChange={(value) => {
        setSelectedTitle(value);
        handleChange({ target: { name: 'title', value } });
      }}>
        <div className="relative">
          <Listbox.Button className="border p-2 rounded w-full text-left text-gray-600 font-light">
            {selectedTitle || form.title || "Title"}
          </Listbox.Button>
          <AnimatePresence>
            {true && (
              <Listbox.Options
                as={motion.ul}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg"
              >
                {titleOptions.map((title) => (
                  <Listbox.Option key={title} value={title} as={Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer px-4 py-2 ${
                          active ? 'bg-gray-100' : ''
                        } ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {title}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </AnimatePresence>
        </div>
      </Listbox>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="firstName"
          placeholder="First Name*"
          value={form.firstName}
          onChange={handleChange}
          className={`border p-2 rounded w-full text-gray-600 font-light${showError && !form.firstName ? ' border-red-500' : ''}`}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name*"
          value={form.lastName}
          onChange={handleChange}
          className={`border p-2 rounded w-full text-gray-600 font-light${showError && !form.lastName ? ' border-red-500' : ''}`}
          required
        />
        <input
          name="email"
          placeholder="Email*"
          type="email"
          value={form.email}
          onChange={handleChange}
          className={`border p-2 rounded w-full text-gray-600 font-light${showError && !form.email ? ' border-red-500' : ''}`}
          required
        />
        <div className="flex gap-2 w-full">
          <Combobox value={selectedCode} onChange={(value) => {
            setSelectedCode(value);
            handleChange({ target: { name: 'countryCode', value } });
          }}>
            <div className="relative w-[120px]">
              <Combobox.Input
                className="border p-2 rounded w-full text-gray-600 font-light"
                onChange={(event) => setSelectedCode(event.target.value)}
                placeholder="Code"
                displayValue={(value) => value}
              />
              <AnimatePresence>
                {countryCodeOptions.length > 0 && (
                  <Combobox.Options
                    as={motion.ul}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 mt-1 w-[260px] sm:w-[300px] bg-white rounded shadow-lg max-h-60 overflow-auto"
                  >
                    {countryCodeOptions
                      .filter((option) =>
                        selectedCode
                          ? `${option.value} ${option.label}`.toLowerCase().includes(selectedCode.toLowerCase())
                          : true
                      )
                      .map((option) => (
                        <Combobox.Option key={option.value} value={option.value} as={Fragment}>
                          {({ active, selected }) => (
                            <li
                              className={`cursor-pointer px-4 py-2 ${
                                active ? 'bg-gray-100' : ''
                              } ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {option.value} {option.label}
                            </li>
                          )}
                        </Combobox.Option>
                      ))}
                  </Combobox.Options>
                )}
              </AnimatePresence>
            </div>
          </Combobox>
          <input
            name="phone"
            placeholder="Phone Number*"
            value={form.phone}
            onChange={handleChange}
            className={`border p-2 rounded text-gray-600 font-light w-2/3${showError && !form.phone ? ' border-red-500' : ''}`}
            required
          />
        </div>
        <Combobox value={selectedCountry} onChange={(value) => {
          setSelectedCountry(value);
          handleChange({ target: { name: 'country', value } });
        }}>
          <div className="relative">
            <Combobox.Input
              className="border p-2 rounded w-full text-gray-600 font-light"
              onChange={(event) => setSelectedCountry(event.target.value)}
              placeholder="Select Country/Region"
              displayValue={(value) => value}
            />
            <AnimatePresence>
              {countryOptions.length > 0 && (
                <Combobox.Options
                  as={motion.ul}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg max-h-60 overflow-auto"
                >
                  {countryOptions
                    .filter((country) =>
                      selectedCountry ? country.toLowerCase().includes(selectedCountry.toLowerCase()) : true
                    )
                    .map((country) => (
                      <Combobox.Option key={country} value={country} as={Fragment}>
                        {({ active, selected }) => (
                          <li
                            className={`cursor-pointer px-4 py-2 ${
                              active ? 'bg-gray-100' : ''
                            } ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {country}
                          </li>
                        )}
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
              )}
            </AnimatePresence>
          </div>
        </Combobox>
        <Combobox value={selectedNationality} onChange={(value) => {
          setSelectedNationality(value);
          handleChange({ target: { name: 'nationality', value } });
        }}>
          <div className="relative">
            <Combobox.Input
              className="border p-2 rounded w-full text-gray-600 font-light"
              onChange={(event) => setSelectedNationality(event.target.value)}
              placeholder="Select Nationality"
              displayValue={(value) => value}
            />
            <AnimatePresence>
              {nationalityOptions.length > 0 && (
                <Combobox.Options
                  as={motion.ul}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg max-h-60 overflow-auto"
                >
                  {nationalityOptions
                    .filter((n) =>
                      selectedNationality ? n.toLowerCase().includes(selectedNationality.toLowerCase()) : true
                    )
                    .map((n) => (
                      <Combobox.Option key={n} value={n} as={Fragment}>
                        {({ active, selected }) => (
                          <li
                            className={`cursor-pointer px-4 py-2 ${
                              active ? 'bg-gray-100' : ''
                            } ${selected ? 'font-medium' : 'font-normal'}`}
                          >
                            {n}
                          </li>
                        )}
                      </Combobox.Option>
                    ))}
                </Combobox.Options>
              )}
            </AnimatePresence>
          </div>
        </Combobox>
      </div>

      <Listbox value={selectedPurpose} onChange={(value) => {
        setSelectedPurpose(value);
        handleChange({ target: { name: 'purpose', value } });
      }}>
        <div className="relative">
          <Listbox.Button className="border p-2 rounded w-full text-left text-gray-600 font-light">
            {selectedPurpose
              ? (selectedPurpose.charAt(0).toUpperCase() + selectedPurpose.slice(1))
              : "Purpose of Stay (optional)"}
          </Listbox.Button>
          <AnimatePresence>
            {true && (
              <Listbox.Options
                as={motion.ul}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white rounded shadow-lg max-h-60 overflow-auto"
              >
                {purposeOptions.map((purpose) => (
                  <Listbox.Option key={purpose} value={purpose} as={Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer px-4 py-2 ${active ? 'bg-gray-100' : ''} ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {purpose.charAt(0).toUpperCase() + purpose.slice(1)}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            )}
          </AnimatePresence>
        </div>
      </Listbox>


      {selectedRooms.map((room, idx) => (
        room.bedOptions?.length > 1 && (
          <div key={room.id || idx} className="border-t pt-4">
            <h3 className="font-medium text-sm text-gray-700">Room: {room.name}</h3>
            <label className="text-sm text-gray-600 block mt-1 mb-1">Select Bed Preference:</label>
            <select
              value={form.bedPreferences[room.id] || ''}
              onChange={(e) => handleBedChange(room.id, e.target.value)}
              className="border p-2 rounded w-full text-gray-600 font-light"
            >
              <option value="">Select Bed Type</option>
              {room.bedOptions.map((bed, i) => (
                <option key={i} value={bed}>{bed}</option>
              ))}
            </select>
          </div>
        )
      ))}

      <label className={`flex items-start gap-2${showError && !form.agree ? ' text-red-500' : ''}`}>
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="text-gray-600 font-light" />
        <span className="text-sm">
          I agree to the <button type="button" onClick={() => setShowPrivacyModal(true)} className="underline text-blue-600 hover:text-blue-800">privacy policy</button> and confirm the above details are correct.
        </span>
      </label>

      <AnimatePresence>
        {showPrivacyModal && (
          <>
            {/* Mobile Modal */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 bg-white w-full h-full px-4 pt-4 pb-6 overflow-y-auto"
              >
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 text-gray-600 hover:text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold mb-4 pt-8">Privacy Policy</h3>
                {/* Policy Content */}
                <p className="text-sm text-gray-700 mb-4">
                  The data collected are subject to processing by Eightfold Urban Resort for the purpose of managing your bookings and stays, understanding your preferences, improving our services and guest experience, and keeping you informed about updates and offerings from Eightfold Urban Resort. These data are shared with Eightfold Urban Resort’s authorized staff and technology service providers strictly for operational and service enhancement purposes. Data linked to your stays, preferences, and satisfaction feedback may be used to personalize and improve your experience with us. <br /><br />
                  You may opt out of data sharing related to service personalization at any time by contacting us at: eightfoldurban@gmail.com. <br /><br />
                  You have the right to request access to your personal data, to request its correction or deletion, to object to its processing, or to define instructions on how your data should be handled after your death. These requests can be made by writing to eightfoldurban@gmail.com. <br /><br />
                  Each hotel operating under Eightfold Urban Resort is individually responsible for its data processing procedures, which may include customer management, reservations, billing and payments, marketing, legal compliance, and the generation of internal statistics or guest satisfaction analysis. <br /><br />
                  For more information about how we handle your personal data, please refer to our Personal Data Protection Charter.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setForm((prev) => ({ ...prev, agree: true }));
                      setShowPrivacyModal(false);
                    }}
                    className="text-sm text-blue-700 underline hover:text-blue-900"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Desktop Modal */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 hidden sm:flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.25 }}
                className="bg-white w-[640px] max-h-[85vh] rounded px-6 pt-6 pb-6 shadow-xl overflow-y-auto"
              >
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 text-gray-600 hover:text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
                {/* Policy Content */}
                <p className="text-sm text-gray-700 mb-4">
                  The data collected are subject to processing by Eightfold Urban Resort for the purpose of managing your bookings and stays, understanding your preferences, improving our services and guest experience, and keeping you informed about updates and offerings from Eightfold Urban Resort. These data are shared with Eightfold Urban Resort’s authorized staff and technology service providers strictly for operational and service enhancement purposes. Data linked to your stays, preferences, and satisfaction feedback may be used to personalize and improve your experience with us. <br /><br />
                  You may opt out of data sharing related to service personalization at any time by contacting us at: eightfoldurban@gmail.com. <br /><br />
                  You have the right to request access to your personal data, to request its correction or deletion, to object to its processing, or to define instructions on how your data should be handled after your death. These requests can be made by writing to eightfoldurban@gmail.com. <br /><br />
                  Each hotel operating under Eightfold Urban Resort is individually responsible for its data processing procedures, which may include customer management, reservations, billing and payments, marketing, legal compliance, and the generation of internal statistics or guest satisfaction analysis. <br /><br />
                  For more information about how we handle your personal data, please refer to our Personal Data Protection Charter.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setForm((prev) => ({ ...prev, agree: true }));
                      setShowPrivacyModal(false);
                    }}
                    className="text-sm text-blue-700 underline hover:text-blue-900"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuestInfoForm;