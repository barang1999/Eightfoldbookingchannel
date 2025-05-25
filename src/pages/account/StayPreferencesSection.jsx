import React, { useState, useEffect } from "react";
import { FaUtensils, FaBed, FaStar } from "react-icons/fa6";
import { db } from "../../firebase"; // adjust path if needed
import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth";
import SupportButton from "../../components/SupportButton";

const PreferenceCard = ({ icon, title, options, selected, onSelect }) => (
  <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-1/3">
    <div className="flex items-center gap-3 mb-4 text-[#c4a875]">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            className="accent-[#c4a875] w-4 h-4"
            checked={selected.includes(opt)}
            onChange={() =>
              onSelect((prev) =>
                prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
              )
            }
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const StayPreferencesSection = () => {
  const [diningPrefs, setDiningPrefs] = useState([]);
  const [roomPrefs, setRoomPrefs] = useState([]);
  const [interestPrefs, setInterestPrefs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    console.log("Current user:", userId);
    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, "users", userId, "stayPreferences", "preferences");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDiningPrefs(data.diningPrefs || []);
          setRoomPrefs(data.roomPrefs || []);
          setInterestPrefs(data.interestPrefs || []);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSave = async () => {
    console.log("Button clicked");
    if (!userId) return;
    try {
      setIsSaving(true);
      setIsSaved(false);
      const payload = {
        diningPrefs,
        roomPrefs,
        interestPrefs,
      };
      console.log("Saving preferences for user:", userId, payload); // Debug log before setDoc
      const docRef = doc(db, "users", userId, "stayPreferences", "preferences");
      await setDoc(docRef, payload, { merge: true }); // Use merge to avoid overwriting
      console.log("Preferences saved successfully"); // Debug log after setDoc

      // ✅ Also sync to MongoDB
      const propertyId = localStorage.getItem('propertyId');
      const mongoPayload = {
        userUid: userId,
        propertyId,
        stayPreferences: payload,
      };
      console.log('[Debug] Syncing stay preferences to MongoDB:', mongoPayload);

      const mongoResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/update-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mongoPayload),
      });

      const mongoResult = await mongoResponse.json();
      console.log('[Debug] MongoDB response:', mongoResult);

      setIsSaving(false);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving preferences:", error);
      setIsSaving(false);
      alert("Failed to save preferences.");
    }
  };

  useEffect(() => {
    setIsSaved(false);
  }, [diningPrefs, roomPrefs, interestPrefs]);

  return (
    <div className="px-6 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Stay Preferences</h2>
      <p className="text-gray-600 mb-8">Let us personalize your stay based on your preferences.</p>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <PreferenceCard
          icon={<FaUtensils className="text-[#c4a875] text-[18px]" />}
          title="Drinks & Dining"
          options={["Vegetarian", "Vegan", "Gluten-free", "Halal"]}
          selected={diningPrefs}
          onSelect={setDiningPrefs}
        />
        <PreferenceCard
          icon={<FaBed className="text-[#c4a875] text-[18px]" />}
          title="Room Preferences"
          options={["King bed", "Twin beds", "Lower floor", "Upper floor"]}
          selected={roomPrefs}
          onSelect={setRoomPrefs}
        />
        <PreferenceCard
          icon={<FaStar className="text-[#c4a875] text-[18px]" />}
          title="Interests & Experience"
          options={["Quiet room", "Landmark view", "Pool access", "Pool View"]}
          selected={interestPrefs}
          onSelect={setInterestPrefs}
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-[#c4a875] text-white px-6 py-3 rounded-full shadow-md hover:bg-[#b69762] transition disabled:opacity-50"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Preferences"}
      </button>
      <div className="fixed bottom-6 right-6 z-50">
        <SupportButton />
      </div>
    </div>
  );
};

export default StayPreferencesSection;